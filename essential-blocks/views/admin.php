<?php
	// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="essential-blocks-admin-page-wrapper eb-settings-wrap">
	<hr class="wp-header-end">
	<div id="eb-settings"></div>
</div>
<?php
/*
 * Apply the dashboard theme before first paint.
 * Keep in sync with src/admin/dashboard/theme.js (preference light|dark)
 * and shell/Sidebar.js (eb-sidebar collapsed|expanded).
 */
$eb_theme_js = "(function () {
	var p = 'light', t = 'light';
	try { p = window.localStorage.getItem('eb-dashboard-theme') || 'light'; } catch (e) {}
	if (p === 'dark') { t = 'dark'; }
	document.body.setAttribute('data-eb-theme', t);
	var w = document.querySelector('.eb-settings-wrap');
	if (w) { w.setAttribute('data-eb-theme', t); }
	var sb = 'expanded';
	try { sb = window.localStorage.getItem('eb-sidebar') === 'collapsed' ? 'collapsed' : 'expanded'; } catch (e) {}
	if (w) { w.setAttribute('data-eb-sidebar', sb); }
})();";
wp_print_inline_script_tag( $eb_theme_js );
?>

<?php
do_action( 'eb_admin_page_setting' );
