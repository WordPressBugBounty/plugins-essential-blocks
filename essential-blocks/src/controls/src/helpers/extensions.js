/**
 * Dashboard "Extensions" switches, localized by PHP as 'true' / 'false'
 * strings on EssentialBlocksLocalize (see includes/Core/Scripts.php).
 * A missing key means enabled, so older PHP keeps everything on.
 *
 * @param {string} key Localized setting key, e.g. "liquidGlass".
 * @return {boolean} Whether the extension is enabled.
 */
export const isEbExtensionEnabled = (key) =>
    window.EssentialBlocksLocalize?.[key] !== "false";

/**
 * Liquid Glass "off" only hides the editor controls. Saved markup and
 * frontend rendering are untouched, so block save() must never use this.
 *
 * @return {boolean} Whether the Liquid Glass controls should show.
 */
export const isLiquidGlassEnabled = () => isEbExtensionEnabled("liquidGlass");
