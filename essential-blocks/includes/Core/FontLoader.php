<?php
namespace EssentialBlocks\Core;

use EssentialBlocks\Utils\Helper;
use EssentialBlocks\Traits\HasSingletone;

/**
 * Load google fonts.
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class FontLoader
{
    use HasSingletone;

    /**
     * Google fonts to enqueue
     *
     * @access public
     * @var array
     */
    public static $gfonts      = [  ];
    private static $block_name = [  ];

    /**
     * The Constructor.
     */
    public function __construct( $block_name )
    {
        self::$block_name = $block_name;

        // Get font from each block loaded in page
        add_filter( 'render_block', [ $this, 'get_fonts_on_render_block' ], 10, 2 );

        // add_filter( 'wp_enqueue_scripts', [$this, 'eb_enqueue_fonts'], 15 );
        add_action( 'wp_footer', [ $this, 'eb_enqueue_fonts' ], 15 );
    }

    /**
     * Run font loader after all block render
     *
     * @since 4.0.2
     * @access public
     */
    public function eb_enqueue_fonts()
    {
        $this->fonts_loader();
    }

    /**
     * Get Attributes on block render
     *
     * @since 4.0.2
     * @access public
     */
    public function get_fonts_on_render_block( $block_content, $block )
    {
        if ( isset( $block[ 'attrs' ] ) ) {
            if ( 'essential-blocks' === self::$block_name || $block[ 'blockName' ] === self::$block_name ) {
                $fonts        = self::get_fonts_family( $block[ 'attrs' ] );
                self::$gfonts = array_unique( array_merge( self::$gfonts, $fonts ) );
            }
        }

        return $block_content;
    }

    /**
     * Generate Font family from Attributes
     *
     * @since 4.0.0
     * @access public
     */
    public static function get_fonts_family( $attributes )
    {
        $keys             = preg_grep( '/^(\w+)FontFamily/i', array_keys( $attributes ), 0 );
        $googleFontFamily = [  ];
        foreach ( $keys as $key ) {
            $googleFontFamily[ $attributes[ $key ] ] = $attributes[ $key ];
        }
        return $googleFontFamily;
    }

    /**
     * Load fonts.
     *
     * @since 4.0.0
     * @access public
     */
    public function fonts_loader( $handle_name = 'eb-block-fonts' )
    {
        $googleFont = true;
        if ( 'essential-blocks' === self::$block_name ) {
            $eb_settings = get_option( 'eb_settings', [  ] );
            $googleFont  = ! empty( $eb_settings[ 'googleFont' ] ) ? $eb_settings[ 'googleFont' ] : 'true';
        }

        if ( 'false' !== $googleFont ) {
            $fonts = self::$gfonts;

            // $default_fonts = [
            //     "Default",
            //     "Arial",
            //     "Helvetica",
            //     "Times New Roman",
            //     "Georgia"
            //  ];

            // $fonts = array_diff( $fonts, $default_fonts );

            Helper::load_google_font( $fonts, $handle_name );
        }
    }
}
