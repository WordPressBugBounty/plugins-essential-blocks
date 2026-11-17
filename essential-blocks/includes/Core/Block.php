<?php

namespace EssentialBlocks\Core;

use Error;
use EssentialBlocks\Traits\HasSingletone;

/**
 * Description
 *
 * @method string render_callback($attributes, $content)
 * @property-read mixed $attributes
 *
 * @since 1.0.0
 * @package PackageName
 */
abstract class Block
{
    use HasSingletone;

    /**
     * Enqueue
     *
     * @var \EssentialBlocks\Utils\Enqueue
     */
    protected $assets_manager = null;
    protected $dir            = '';
    protected $is_pro         = false;

    protected $editor_scripts   = [];
    protected $editor_styles    = [];
    protected $animation_script = 'essential-blocks-eb-animation';
    protected $animation_style  = 'essential-blocks-animation';
    protected $liquid_glass_style  = 'essential-blocks-liquid-glass';

    protected $frontend_styles  = [];
    protected $frontend_scripts = [];

    /**
     * unique name of block
     *
     * @return string
     */
    abstract public function get_name();

    /**
     * Block can be enabled or not.
     *
     * Override if needed.
     *
     * @return bool
     */
    public function can_enable()
    {
        return true;
    }

    public function get_block_path($name, $wp_version_check = false)
    {
        $path = ESSENTIAL_BLOCKS_BLOCK_DIR . $name;

        if ($wp_version_check && ESSENTIAL_BLOCKS_WP_VERSION < 5.8) {
            $path = 'essential-blocks/' . $name;
        }

        return apply_filters('essential_blocks_block_path', $path, $this->is_pro, $name, $wp_version_check);
    }

    public function path($name = '')
    {
        if (empty($name)) {
            $name = $this->get_name();
        }

        return $this->get_block_path($name);
    }

    public function register_block_type($name, ...$args)
    {
        if (empty($name)) {
            $name = $this->get_name();
        }

        return register_block_type($this->get_block_path($name, true), ...$args);
    }

    public function load_frontend_styles()
    {
        // animate.css, the animation loader and hover.css are enqueued by
        // maybe_enqueue_effect_assets(), only for blocks whose markup uses
        // them. Liquid Glass CSS is enqueued by Utils\LiquidGlassRenderer,
        // only for blocks that render the effect.

        $frontend_styles = $this->frontend_styles;

        if (empty($frontend_styles)) {
            return;
        }

        foreach ($frontend_styles as $handle) {
            wp_enqueue_style($handle);
        }
    }

    public function load_frontend_scripts()
    {
        if (empty($this->frontend_scripts)) {
            return;
        }

        foreach ($this->frontend_scripts as $handle) {
            wp_enqueue_script($handle);
        }
    }

    public function load_scripts()
    {

        $this->frontend_styles  = apply_filters("eb_frontend_styles/{$this->get_name()}", $this->frontend_styles);
        $this->frontend_scripts = apply_filters("eb_frontend_scripts/{$this->get_name()}", $this->frontend_scripts);

        $this->load_frontend_styles();
        $this->load_frontend_scripts();
    }

    /**
     * Replace EBDisplayIconSave placeholders (eb-display-icon-svg) with sanitized inline SVG via regex.
     * This runs only on frontend (not in admin).
     */
    private function inline_svg_icons_via_regex($content)
    {
        if (is_admin() || empty($content)) {
            return $content;
        }
        if (strpos($content, 'eb-display-icon-svg') === false || strpos($content, 'data-svg-url') === false) {
            return $content;
        }

        $pattern = '~<span\b(?=[^>]*\bclass=(["\"]) (?:(?!\\1).)*?\beb-display-icon-svg\b (?:(?!\\1).)*?\\1)(?=[^>]*\bdata-svg-url=(["\"])(.*?)\\2)[^>]*\s*/?>\s*(?:</span>)?~xis';

        $original = $content;
        $content  = preg_replace_callback($pattern, function ($m) {
            $url = isset($m[3]) ? esc_url_raw($m[3]) : '';
            if (empty($url)) {
                return $m[0];
            }
            $path = parse_url($url, PHP_URL_PATH);
            if (! $path || ! preg_match('/\.svg($|[?#])/i', $path)) {
                return $m[0];
            }

            $cache_key = 'eb_svg_' . md5($url);
            $svg = get_transient($cache_key);

            if ($svg === false) {
                $svg = '';
                $res = wp_remote_get($url, [
                    'timeout' => 5,
                    'redirection' => 3,
                    'headers' => [ 'Accept' => 'image/svg+xml,text/plain,*/*' ],
                    'reject_unsafe_urls' => true,
                ]);
                if (! is_wp_error($res) && (int) wp_remote_retrieve_response_code($res) === 200) {
                    $raw = (string) wp_remote_retrieve_body($res);
                    if (preg_match('/<svg[\s\S]*?<\/svg>/i', $raw, $mm)) {
                        $raw = $mm[0];
                    }
                    $sanitized = \EssentialBlocks\Utils\SvgSanitizer::get_instance()->sanitize($raw);
                    if (! empty($sanitized)) {
                        $svg = $sanitized;
                    }
                }
                set_transient($cache_key, $svg, HOUR_IN_SECONDS * 6);
            }

            // Extract optional data-class-name from the placeholder span and add it to the root <svg>
            if (! empty($svg)) {
                $classAttr = '';
                if (preg_match('/\bdata-class-name=(["\'])(.*?)\1/i', $m[0], $mc)) {
                    $classAttr = trim($mc[2]);
                }
                if ($classAttr !== '') {
                    $classes = preg_split('/\s+/', $classAttr);
                    $classes = array_filter(array_map('sanitize_html_class', (array) $classes));
                    if (! empty($classes)) {
                        $svg = preg_replace_callback('/<svg\b([^>]*)>/i', function ($m2) use ($classes) {
                            $before = $m2[1];
                            if (preg_match('/\sclass=(["\'])(.*?)\1/i', $before, $m3)) {
                                $final = implode(' ', $classes);
                                $new_before = preg_replace('/\sclass=(["\'])(.*?)\1/i', ' class=$1' . esc_attr($final) . '$1', $before, 1);
                                return '<svg' . $new_before . '>';
                            } else {
                                $final = implode(' ', $classes);
                                return '<svg' . $before . ' class="' . esc_attr($final) . '">';
                            }
                        }, $svg, 1);
                    }
                }
            }

            return $svg ?: $m[0];
        }, $content);

        // null on a PCRE backtrack/recursion limit: keep the original markup.
        return null === $content ? $original : $content;
    }


    /**
     * Function to handle conditional display logic for the block.
     */
    /**
     * Enqueue core's `dashicons` stylesheet when a block's rendered HTML uses it.
     *
     * The icon picker can emit `dashicon dashicons-*` classes for any
     * icon-bearing block (see controls helpers `renderIcon`), so a per-block
     * allowlist would be wrong. Scanning the output is exact and cheap. Until
     * 6.4.7 the stylesheet loaded on every frontend page instead.
     *
     * Blocks that create Dashicons markup from JS at runtime (Table of
     * Contents' copy tooltip) can't be detected here and must list
     * `dashicons` in $frontend_styles explicitly.
     */
    /**
     * Font Awesome SVG map (includes/Utils/FontAwesomeSvgMap.php), loaded once
     * per request and only when a rendered block contains an FA icon.
     *
     * @var array|null
     */
    private static $fa_svg_map = null;

    /**
     * Font Awesome classes that change how an icon is drawn (animations,
     * stacking, list bullets). Icons using them keep the webfont.
     */
    const FA_FONT_ONLY_MODIFIERS = '/^fa-(spin|spin-pulse|spin-reverse|pulse|beat|beat-fade|fade|bounce|flip|shake|stack|stack-1x|stack-2x|li|ul|border|inverse|pull-left|pull-right|rotate-by|layers)$/';

    /**
     * Swap Font Awesome `<i class="fas fa-star">` icons for inline SVG.
     *
     * Library icons are saved as empty `<i>` tags styled by the Font Awesome
     * stylesheet and webfonts (~100 KB CSS plus fonts) that used to load on
     * almost every page. The <i> and all its attributes stay (block CSS keeps
     * targeting it); the SVG goes inside, sized like the glyph (1em high,
     * width from the icon's own proportions) and coloured with currentColor.
     * Unknown icons and ones using animation/stack classes are left as they
     * are, and maybe_enqueue_icon_assets() then loads the stylesheet for them.
     *
     * @param string $html Rendered block HTML.
     * @return string
     */
    private function inline_fa_icons($html)
    {
        if (is_admin() || empty($html) || strpos($html, '<i') === false || strpos($html, 'fa-') === false) {
            return $html;
        }

        $converted = preg_replace_callback(
            '/<i\b([^>]*\bclass=(["\'])([^"\']*\bfa[a-z-]*\b[^"\']*)\2[^>]*)>\s*<\/i>/i',
            function ($m) {
                $svg = self::fa_svg_for_classes($m[3]);
                if ('' === $svg) {
                    return $m[0];
                }
                $open = preg_replace('/\bclass=(["\'])([^"\']*)\1/i', 'class=$1$2 eb-fa-svg$1', '<i' . $m[1] . '>', 1);
                return $open . $svg . '</i>';
            },
            $html
        );

        // preg_* return null when PCRE hits its backtrack/recursion limit
        // on very large markup: keep the original HTML rather than render
        // an empty block.
        return null === $converted ? $html : $converted;
    }

    /**
     * Inline SVG for a Font Awesome class list, or '' when it can't be drawn
     * without the webfont.
     *
     * @param string $classes Class attribute value.
     * @return string
     */
    private static function fa_svg_for_classes($classes)
    {
        $tokens = preg_split('/\s+/', trim($classes));
        $style  = '';
        $name   = '';
        $is_v4  = false;
        foreach ($tokens as $token) {
            if (in_array($token, [ 'fas', 'fa-solid' ], true)) {
                $style = 's';
            } elseif (in_array($token, [ 'far', 'fa-regular' ], true)) {
                $style = 'r';
            } elseif (in_array($token, [ 'fab', 'fa-brands' ], true)) {
                $style = 'b';
            } elseif ('fa' === $token) {
                $is_v4 = true;
            } elseif (0 === strpos($token, 'fa-')) {
                if (preg_match(self::FA_FONT_ONLY_MODIFIERS, $token)) {
                    return '';
                }
                // Size / fixed-width / rotation helpers are not icon names.
                if (preg_match('/^fa-(fw|xs|sm|lg|xl|2xl|[0-9]+x|2xs|rotate-(90|180|270)|flip-(horizontal|vertical|both)|classic|sharp)$/', $token)) {
                    continue;
                }
                if ('' === $name) {
                    $name = substr($token, 3);
                }
            }
        }
        if ('' === $name) {
            return '';
        }

        if (null === self::$fa_svg_map) {
            $file             = ESSENTIAL_BLOCKS_DIR_PATH . 'includes/Utils/FontAwesomeSvgMap.php';
            self::$fa_svg_map = file_exists($file) ? (array) include $file : [];
        }
        $map = self::$fa_svg_map;
        if (empty($map)) {
            return '';
        }

        if ('' === $style && $is_v4 && isset($map['v4'][$name])) {
            list($style, $name) = $map['v4'][$name];
        }
        if ('' === $style) {
            $style = 's';
        }
        if (! isset($map[$style][$name]) && isset($map['a'][$name])) {
            $name = $map['a'][$name];
        }
        if (! isset($map[$style][$name])) {
            return '';
        }

        list($width, $path) = explode('|', $map[$style][$name], 2);
        // Inline size: the glyph's own advance width (viewBox width / 512 em)
        // and 1em high, !important so block CSS written for uploaded SVG icons
        // (fixed width/height on any svg in the block) can't resize it.
        $em = rtrim(rtrim(number_format((int) $width / 512, 4, '.', ''), '0'), '.');
        return '<svg class="eb-fa-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' . (int) $width . ' 512" style="width:' . $em . 'em!important;height:1em!important;min-width:0!important;min-height:0!important;max-width:none!important;max-height:none!important" aria-hidden="true" focusable="false"><path fill="currentColor" d="' . esc_attr($path) . '"></path></svg>';
    }

    /**
     * Enqueue what inline / font icons in the rendered HTML need: the small
     * inline-SVG stylesheet when icons were converted, and the Font Awesome
     * stylesheet only when a Font Awesome icon is still left as a font glyph.
     *
     * @param string $html Rendered block HTML (after inline_fa_icons()).
     */
    private function maybe_enqueue_icon_assets($html)
    {
        if (is_admin() || empty($html)) {
            return;
        }
        if (strpos($html, 'eb-fa-svg') !== false) {
            // Sized and coloured like the glyph it replaces. !important:
            // block CSS written for uploaded SVG icons (e.g. Breadcrumbs
            // sizes every svg in its separator) must not apply to it.
            if (! wp_style_is('essential-blocks-fa-svg', 'registered')) {
                wp_register_style('essential-blocks-fa-svg', false, [], ESSENTIAL_BLOCKS_VERSION);
                wp_add_inline_style(
                    'essential-blocks-fa-svg',
                    'i.eb-fa-svg{display:inline-block;font-style:normal;line-height:1}i.eb-fa-svg::before{content:none!important}i.eb-fa-svg>svg{font-size:inherit!important;max-width:none;max-height:none;overflow:visible;vertical-align:top}i.eb-fa-svg>svg path{fill:currentColor!important}'
                    // Font Awesome 6 helper classes (size, fixed width, rotate, flip) for
                    // converted icons, so they work without the FA stylesheet.
                    . 'i.eb-fa-svg.fa-2xs{font-size:.625em;vertical-align:.225em}i.eb-fa-svg.fa-xs{font-size:.75em;vertical-align:.125em}i.eb-fa-svg.fa-sm{font-size:.875em;vertical-align:.05357em}i.eb-fa-svg.fa-lg{font-size:1.25em;vertical-align:-.075em}i.eb-fa-svg.fa-xl{font-size:1.5em;vertical-align:-.125em}i.eb-fa-svg.fa-2xl{font-size:2em;vertical-align:-.1875em}i.eb-fa-svg.fa-1x{font-size:1em}i.eb-fa-svg.fa-2x{font-size:2em}i.eb-fa-svg.fa-3x{font-size:3em}i.eb-fa-svg.fa-4x{font-size:4em}i.eb-fa-svg.fa-5x{font-size:5em}i.eb-fa-svg.fa-6x{font-size:6em}i.eb-fa-svg.fa-7x{font-size:7em}i.eb-fa-svg.fa-8x{font-size:8em}i.eb-fa-svg.fa-9x{font-size:9em}i.eb-fa-svg.fa-10x{font-size:10em}i.eb-fa-svg.fa-fw{width:1.25em;text-align:center}i.eb-fa-svg.fa-rotate-90{transform:rotate(90deg)}i.eb-fa-svg.fa-rotate-180{transform:rotate(180deg)}i.eb-fa-svg.fa-rotate-270{transform:rotate(270deg)}i.eb-fa-svg.fa-flip-horizontal{transform:scale(-1,1)}i.eb-fa-svg.fa-flip-vertical{transform:scale(1,-1)}i.eb-fa-svg.fa-flip-both{transform:scale(-1,-1)}'
                );
            }
            wp_enqueue_style('essential-blocks-fa-svg');
        }
        // A Font Awesome class on an element that was not converted.
        if (preg_match('/class=(["\'])(?![^"\']*\beb-fa-svg\b)[^"\']*\b(?:fa|fas|far|fab|fa-solid|fa-regular|fa-brands)\b[^"\']*\bfa-[a-z0-9-]+/i', $html)) {
            wp_enqueue_style('essential-blocks-fontawesome');
        }
    }

    private function maybe_enqueue_dashicons($html)
    {
        if (is_admin() || empty($html) || strpos($html, 'dashicons') === false) {
            return;
        }
        wp_enqueue_style('dashicons');
    }

    /**
     * Enqueue animate.css + the animation loader, and hover.css, only when
     * the rendered markup uses them.
     *
     * Until 6.5.4 every EB block render enqueued animate.css and
     * eb-animation-load.js, and six blocks (Button, CTA, Info Box, Social,
     * Social Share, Team Member) always enqueued hover.css, whether or not an
     * animation or hover effect was set. The settings are visible in the
     * markup: an entrance animation adds `eb_animation` to the block's class
     * (blocks are saved hidden until the loader reveals them, so the loader
     * must come with it), and a hover effect adds an `hvr-*` class. Container
     * blocks scan their inner blocks' HTML too, so nothing nested is missed.
     */
    private function maybe_enqueue_effect_assets($html)
    {
        if (is_admin() || empty($html)) {
            return;
        }
        if (strpos($html, 'eb_animation') !== false) {
            wp_enqueue_style($this->animation_style);
            wp_enqueue_script($this->animation_script);
        }
        // `hvr-icon` alone only marks the icon an effect animates (every
        // .hvr-icon rule in hover.css sits under an effect class), and
        // Social, Team Member and Social Share always print it. Load hover.css
        // only for an actual effect class (hvr-grow, hvr-icon-back, …).
        if (strpos($html, 'hvr-') !== false && preg_match('/\bhvr-(?!icon(?![\w-]))[\w-]/', $html)) {
            wp_enqueue_style('essential-blocks-hover-css');
        }
    }

    private function should_display_block($attributes)
    {
        // Skip logic check in admin area
        if (is_admin()) {
            return true;
        }

        // Apply a filter to determine whether the block should be displayed or hidden.
        return apply_filters('eb_conditional_display_results', $attributes) !== false;
    }

    public function register($assets_manager)
    {
        $this->assets_manager = $assets_manager;

        $_args = [];

        if (method_exists($this, 'register_scripts')) {
            $this->register_scripts();
        }

        $_args['render_callback'] = function ($attributes, $content, $block = null) {
            if (!$this->should_display_block($attributes)) {
                return ''; // Stop execution and return empty content
            }

            // Fire action to notify Pro plugin about block detection
            do_action('eb_detect_block_on_page', $this->get_name(), $attributes, $block);

            // Inline SVG placeholders before returning content
            $content = $this->inline_svg_icons_via_regex($content);
            $content = $this->inline_fa_icons($content);
            $this->maybe_enqueue_icon_assets($content);
            $this->maybe_enqueue_dashicons($content);
            $this->maybe_enqueue_effect_assets($content);

            return $content;
        };

        if (method_exists($this, 'render_callback')) {
            $_args['render_callback'] = function ($attributes, $content, $block = null) {
                if (!is_admin()) {
                    $this->load_scripts();
                }
                if (!is_admin()) {

                    if (!$this->should_display_block($attributes)) {
                        return ''; // Stop execution and return empty content
                    }

                    $this->load_scripts();
                }

                // Fire action to notify Pro plugin about block detection
                do_action('eb_detect_block_on_page', $this->get_name(), $attributes, $block);

                // Inline SVG placeholders before returning content
                $content = $this->inline_svg_icons_via_regex($content);

                $output = $this->render_callback($attributes, $content, $block);

                // Also inline SVGs in the render_callback output (dynamic blocks
                // generate HTML with SVG placeholders that aren't in $content).
                $output = $this->inline_svg_icons_via_regex($output);
                $output = $this->inline_fa_icons($output);
                $this->maybe_enqueue_icon_assets($output);
                $this->maybe_enqueue_dashicons($output);
                $this->maybe_enqueue_effect_assets($output);

                return $output;
            };
        }

        if ((!empty($this->frontend_scripts) || !empty($this->frontend_styles)) && ! method_exists($this, 'render_callback')) {
            $_args['render_callback'] = function ($attributes, $content, $block = null) {
                if (!is_admin()) {


                    if (!$this->should_display_block($attributes)) {
                        return ''; // Stop execution and return empty content
                    }

                    $this->load_scripts();
                }

                // Fire action to notify Pro plugin about block detection
                do_action('eb_detect_block_on_page', $this->get_name(), $attributes, $block);

                // Inline SVG placeholders before returning content
                $content = $this->inline_svg_icons_via_regex($content);
                $content = $this->inline_fa_icons($content);
                $this->maybe_enqueue_icon_assets($content);
                $this->maybe_enqueue_dashicons($content);
                $this->maybe_enqueue_effect_assets($content);
                return $content;
            };
        }

        $_args['editor_script'] = array_merge(
            is_array($this->editor_scripts) ? $this->editor_scripts : [$this->editor_scripts],
            [$this->animation_script],
            ['essential-blocks-editor-script']
        );
        $_args['editor_style'] = array_merge(
            is_array($this->editor_styles) ? $this->editor_styles : [$this->editor_styles],
            [$this->animation_style],
            ['essential-blocks-editor-css']
        );

        if (property_exists($this, 'attributes')) {
            $_args['attributes'] = $this->attributes;
        }

        return $this->register_block_type($this->get_name(), $_args);
    }
}
