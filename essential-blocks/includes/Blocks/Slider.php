<?php

namespace EssentialBlocks\Blocks;

use EssentialBlocks\Core\Block;

class Slider extends Block {
    protected $frontend_scripts = array(
        'essential-blocks-slickjs',
        'essential-blocks-slick-lightbox-js',
        'essential-blocks-babel-bundle',
        'essential-blocks-slider-frontend'
     );
    protected $frontend_styles = array( 'essential-blocks-fontawesome', 'essential-blocks-slick-style', 'essential-blocks-common-style', 'essential-blocks-slick-lightbox-style' );

    /**
     * Unique name of the block.
     *
     * @return string
     */
    public function get_name() {
        return 'slider';
    }

    /**
     * Register all other scripts
     *
     * @return void
     */
    public function register_scripts() {
        $this->assets_manager->register(
            'slider-frontend',
            $this->path() . '/frontend.js',
            array( 'essential-blocks-controls-frontend', 'essential-blocks-slick-lightbox-js' )
        );

        // v1 sliders only: React + react-slick (vendor bundle).
        $this->assets_manager->register(
            'slider-frontend-legacy',
            $this->path() . '/frontend-legacy.js',
            array( 'essential-blocks-controls-frontend' )
        );

        $this->assets_manager->register( 'slickjs', 'js/slick.min.js', array( 'jquery' ) );
    }

    /**
     * Load the React runtime only for sliders saved with the v1 markup.
     *
     * v1 sliders (no `data-version`, or "v1") are rendered by React; v2+ are
     * plain markup driven by jQuery slick. Until 6.5.4 every page with any
     * Slider loaded React, ReactDOM and the vendor bundle for the v1 path.
     *
     * @param array  $attributes Block attributes.
     * @param string $content    Saved block markup.
     * @return string
     */
    public function render_callback( $attributes, $content ) {
        if ( ! is_admin() && is_string( $content ) && false !== strpos( $content, 'eb-slider-wrapper' ) ) {
            $version = preg_match( '/\beb-slider-wrapper\b[^>]*\bdata-version="([^"]*)"/', $content, $m ) ? $m[1] : '';
            if ( '' === $version || 'v1' === $version ) {
                wp_enqueue_script( 'essential-blocks-slider-frontend-legacy' );
            }
        }
        return $content;
    }
}
