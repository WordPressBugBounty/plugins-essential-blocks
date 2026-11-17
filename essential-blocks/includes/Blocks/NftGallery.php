<?php
namespace EssentialBlocks\Blocks;

use EssentialBlocks\Core\Block;

class NftGallery extends Block
{
    protected $frontend_scripts = [ 'essential-blocks-nft-gallery-frontend' ];
    /**
     * Unique name of the block.
     *
     * @return string
     */
    public function get_name()
    {
        return 'nft-gallery';
    }

    /**
     * Register all other scripts
     *
     * NFT Gallery keeps React on the frontend on purpose (#601): unlike
     * Slider or Image Comparison, nothing useful is in the saved markup — the
     * script fetches the collection from OpenSea over AJAX and builds the
     * whole gallery (filters, loading and error states, pagination) at
     * runtime, which is what React is for. Its cost is React/ReactDOM (shared
     * with WordPress) and lodash only: the script imports nothing from the
     * vendor bundle, so it no longer depends on it (6.5.4).
     *
     * @return void
     */
    public function register_scripts()
    {
        $this->assets_manager->register(
            'nft-gallery-frontend',
            $this->path() . '/frontend.js',
            [ 'essential-blocks-blocks-localize' ]
        );
    }
}
