<?php

namespace EssentialBlocks\Blocks;

use EssentialBlocks\Core\Block;

class Wrapper extends Block {
	protected $editor_styles   = 'essential-blocks-block-common';
	protected $frontend_styles = array( 'essential-blocks-block-common' );

	protected function __construct() {
		add_filter( 'eb_block_meta_css', array( $this, 'fix_custom_height_width' ), 10, 2 );
	}

	/**
	 * Unique name of the block.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'wrapper';
	}

	/**
	 * Drop the `width: 100%` that Custom Height used to add to the outer wrapper.
	 *
	 * Why: with "Use Width In Wrapper" on, the width control styles
	 * `.eb-wrapper-outer`, and the later Custom Height rule's `width: 100%`
	 * overrode it, stretching the wrapper to full width. The editor no longer
	 * emits it, but blocks saved before the fix still carry it in blockMeta.
	 *
	 * @param array|string $block_meta Saved CSS ( desktop / tab / mobile ).
	 * @param array        $block      Parsed block.
	 * @return array|string
	 */
	public function fix_custom_height_width( $block_meta, $block ) {
		$attrs = isset( $block['attrs'] ) && is_array( $block['attrs'] ) ? $block['attrs'] : array();

		if (
			! isset( $block['blockName'] ) || 'essential-blocks/wrapper' !== $block['blockName']
			|| empty( $attrs['isWrapperWidth'] ) || empty( $attrs['useCustomHeight'] )
			|| empty( $attrs['blockId'] ) || ! is_array( $block_meta ) || empty( $block_meta['desktop'] )
		) {
			return $block_meta;
		}

		$block_meta['desktop'] = preg_replace(
			'/(\.eb-wrapper-outer\.' . preg_quote( $attrs['blockId'], '/' ) . '\s*\{\s*display:\s*flex;\s*align-items:[^;{}]*;\s*justify-content:\s*center;\s*)width:\s*100%;\s*/',
			'$1',
			$block_meta['desktop']
		);

		return $block_meta;
	}
}
