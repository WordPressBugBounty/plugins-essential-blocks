<?php
namespace EssentialBlocks\Blocks;

use EssentialBlocks\Core\Block;

/**
 * Registered in PHP so the block gets the shared render path, which runs
 * Conditional Display (#684). The field itself is static save markup.
 */
class FormCheckboxField extends Block {
	/**
	 * Unique name of the block.
	 * @return string
	 */
	public function get_name() {
		return 'form-checkbox-field';
	}

	/**
	 * Block render callback.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content    Saved markup.
	 * @return string
	 */
	public function render_callback( $attributes, $content ) {
		return self::unique_option_ids( $content, isset( $attributes['blockId'] ) ? (string) $attributes['blockId'] : '' );
	}

	/**
	 * Make the option inputs' ids (and their labels' `for`) unique per field.
	 *
	 * The saved markup uses each option's value as its HTML id, so two fields
	 * with the same options (a pasted or duplicated field, a copied form)
	 * share ids, and clicking a label toggles the other field's input (#685).
	 * Prefix them with the field's blockId at render time; the option values,
	 * which conditional logic and submissions use, stay as they are.
	 *
	 * @param string $content  Field markup.
	 * @param string $block_id Field blockId.
	 * @return string
	 */
	public static function unique_option_ids( $content, $block_id ) {
		if ( ! is_string( $content ) || '' === $content || '' === $block_id || ! class_exists( 'WP_HTML_Tag_Processor' ) ) {
			return $content;
		}
		$prefix = sanitize_html_class( $block_id ) . '-';
		$ids    = array();

		$tags = new \WP_HTML_Tag_Processor( $content );
		while ( $tags->next_tag( 'input' ) ) {
			$type = strtolower( (string) $tags->get_attribute( 'type' ) );
			$id   = $tags->get_attribute( 'id' );
			if ( in_array( $type, array( 'checkbox', 'radio' ), true ) && is_string( $id ) && '' !== $id ) {
				$ids[ $id ] = true;
				$tags->set_attribute( 'id', $prefix . $id );
			}
		}
		$content = $tags->get_updated_html();
		if ( empty( $ids ) ) {
			return $content;
		}

		$tags = new \WP_HTML_Tag_Processor( $content );
		while ( $tags->next_tag( 'label' ) ) {
			$for = $tags->get_attribute( 'for' );
			if ( is_string( $for ) && isset( $ids[ $for ] ) ) {
				$tags->set_attribute( 'for', $prefix . $for );
			}
		}
		return $tags->get_updated_html();
	}
}
