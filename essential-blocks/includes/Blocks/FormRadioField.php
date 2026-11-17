<?php
namespace EssentialBlocks\Blocks;

use EssentialBlocks\Core\Block;

/**
 * Registered in PHP so the block gets the shared render path, which runs
 * Conditional Display (#684). The field itself is static save markup.
 */
class FormRadioField extends Block {
	/**
	 * Unique name of the block.
	 * @return string
	 */
	public function get_name() {
		return 'form-radio-field';
	}

	/**
	 * Block render callback: unique option ids, see
	 * FormCheckboxField::unique_option_ids() (#685).
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content    Saved markup.
	 * @return string
	 */
	public function render_callback( $attributes, $content ) {
		return FormCheckboxField::unique_option_ids( $content, isset( $attributes['blockId'] ) ? (string) $attributes['blockId'] : '' );
	}
}
