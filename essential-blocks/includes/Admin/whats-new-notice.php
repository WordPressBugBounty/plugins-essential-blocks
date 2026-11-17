<?php
    if ( ! defined( 'ABSPATH' ) ) {
        exit;
    }
    $title       = esc_html__( 'Introducing Custom Cursor [PRO Feature]', 'essential-blocks' );
    $description = esc_html__( 'Replace the default pointer with eye-catching custom cursors and interactive effects that make your WordPress site stand out', 'essential-blocks' );
    $learn_more  = esc_html__( 'Learn More', 'essential-blocks' );
    $dismiss     = esc_html__( 'Dismiss', 'essential-blocks' );
    $doc_url     = esc_url( ESSENTIAL_BLOCKS_SITE_URL . 'demo/custom-cursor/' );

    // Campaign content from Admin::eb_whats_new_notice(), already escaped.
    // Kept off the `= esc_html__` / `= esc_url` lines that release.sh rewrites.
    if ( ! empty( $eb_whats_new ) ) {
        $title       = $eb_whats_new['title'];
        $description = $eb_whats_new['description'];
        $learn_more  = $eb_whats_new['button'];
        $doc_url     = $eb_whats_new['url'];
    }
?>

<script type="text/javascript">
jQuery(document).ready(function ($) {
	const promoHtml = `
		<div class="eb-whats-new">
			<div class="eb-hn-title">
				<span class="dashicons dashicons-megaphone"></span>
				<span><?php echo $title; ?></span>
			</div>
			<div class="eb-hn-content">
				<p><?php echo $description; ?></p>
                <div class="eb-hn-buttons">
                    <button class="button button-primary">
                        <a href="<?php echo $doc_url; ?>" target="_blank" rel="noopener noreferrer"><?php echo $learn_more; ?></a>
                    </button>
                    <button class="button button-dismiss">
                        <span class="dashicons dashicons-dismiss"></span> <?php echo $dismiss; ?>
                    </button>
                </div>
			</div>
		</div>
	`;

	$('#toplevel_page_essential-blocks').append(promoHtml);

	$(document).on('click', '.eb-whats-new .button-dismiss', function () {
		$('.eb-whats-new').remove();
	});
});
</script>
