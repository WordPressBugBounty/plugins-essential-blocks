<?php

namespace EssentialBlocks\Blocks;

use EssentialBlocks\Core\Block;
use EssentialBlocks\Utils\Helper;

class SocialShare extends Block
{
    protected $frontend_scripts = [ 'essential-blocks-social-share-js' ];
    protected $frontend_styles  = [];

    /**
     * Unique name of the block.
     *
     * @return string
     */
    public function get_name()
    {
        return 'social-share';
    }

    /**
     * Register all other scripts
     *
     * @return void
     */
    public function register_scripts()
    {
        $this->assets_manager->register(
            'social-share-js',
            $this->path() . '/frontend.js'
        );
    }

    /**
     * Block render callback.
     *
     * @param mixed $attributes
     * @param mixed $content
     * @return mixed
     */
    public function render_callback( $attributes, $content )
    {
        // Sync translated iconText from socialDetails into profilesOnly.
        // WPML may translate socialDetails but profilesOnly (which the
        // view renders) stays stale. Merge translated values.
        if ( ! empty( $attributes['socialDetails'] ) && ! empty( $attributes['profilesOnly'] ) ) {
            foreach ( $attributes['profilesOnly'] as $i => &$profile ) {
                if ( isset( $attributes['socialDetails'][ $i ]['iconText'] ) ) {
                    $profile['iconText'] = $attributes['socialDetails'][ $i ]['iconText'];
                }
            }
            unset( $profile );
        }

        ob_start();
        Helper::views(
            'social-share',
            wp_parse_args(
                $attributes,
                [
                    'classHook'          => '',
                    'blockId'            => '',
                    'profilesOnly'       => [],
                    'icnEffect'          => '',
                    'showTitle'          => true,
                    'isFloating'         => false,
                    'iconShape'          => '',
                    'wrapper_attributes' => get_block_wrapper_attributes( [ 'class' => 'root-' . ( $attributes[ 'blockId' ] ?? '' ) ] ),
                    'block_object'       => $this
                ]
            )
        );
        return ob_get_clean();
    }

    /**
     * Get Social Shareable link
     *
     * @param int    $id current post/page id
     * @param string $icon_text icon text to find the icon name
     */
    public static function eb_social_share_name_link( $id, $icon_text )
    {
        if ( empty( $icon_text ) || ! is_string( $icon_text ) || empty( $id ) ) {
            return;
        }

        // Encode so titles containing &, #, ? or spaces don't break the share URL.
        $post_title = rawurlencode( wp_strip_all_tags( html_entity_decode( get_the_title( $id ), ENT_QUOTES, 'UTF-8' ) ) );
        $post_link  = rawurlencode( (string) get_the_permalink( $id ) );

        if ( preg_match( '/facebook/', $icon_text ) ) {
            return esc_url( 'https://www.facebook.com/sharer/sharer.php?u=' . $post_link );
        } elseif ( preg_match( '/linkedin/', $icon_text ) ) {
            return esc_url( 'https://www.linkedin.com/shareArticle?title=' . $post_title . '&url=' . $post_link . '&mini=true' );
        } elseif ( preg_match( '/twitter/', $icon_text ) ) {
            return esc_url( 'https://twitter.com/share?text=' . $post_title . '&url=' . $post_link );
        } elseif ( preg_match( '/pinterest/', $icon_text ) ) {
            return esc_url( 'https://pinterest.com/pin/create/button/?url=' . $post_link );
        } elseif ( preg_match( '/reddit/', $icon_text ) ) {
            return esc_url( 'https://www.reddit.com/submit?url=' . $post_link . '&title=' . $post_title );
        } elseif ( preg_match( '/tumblr/', $icon_text ) ) {
            return esc_url( 'https://www.tumblr.com/widgets/share/tool?canonicalUrl=' . $post_link );
        } elseif ( preg_match( '/whatsapp/', $icon_text ) ) {
            return esc_url( 'https://api.whatsapp.com/send?text=' . $post_title . ' ' . $post_link );
        } elseif ( preg_match( '/telegram/', $icon_text ) ) {
            return esc_url( 'https://telegram.me/share/url?url=' . $post_link . '&text=' . $post_title );
        } elseif ( preg_match( '/threads/', $icon_text ) ) {
            return esc_url( 'https://www.threads.net/intent/post?text=' . $post_title . '%20' . $post_link );
        } elseif ( preg_match( '/pocket/', $icon_text ) ) {
            return esc_url( 'https://getpocket.com/edit?url=' . $post_link );
        } elseif ( preg_match( '/envelope/', $icon_text ) ) {
            return esc_url( 'mailto:?subject=' . $post_title . '&body=' . $post_link );
        } elseif ( preg_match( '/xing/', $icon_text ) ) {
            return esc_url( 'https://www.xing.com/spi/shares/new?url=' . $post_link );
        } elseif ( preg_match( '/vk/', $icon_text ) ) {
            return esc_url( 'https://vk.com/share.php?url=' . $post_link );
        }
    }
}
