<?php
namespace EssentialBlocks\Blocks;

use EssentialBlocks\Core\Block;

/**
 * Registered in PHP so the block gets the shared render path, which runs
 * Conditional Display (#684). The field itself is static save markup.
 */
class FormSelectField extends Block {
	/**
	 * Unique name of the block.
	 * @return string
	 */
	public function get_name() {
		return 'form-select-field';
	}
}
