/**
 * One wrapper per admin-ajax action used by the 7 dashboard tabs.
 *
 * Every wrapper sends exactly the same fields, in the same order, as the
 * code it replaces, and resolves to the normalized result from ebAjax().
 */

/**
 * Internal dependencies
 */
import { ebAjax } from "./ebAjax";

/**
 * The nonce pair, read at call time so a refreshed nonce is picked up.
 *
 * @return {Array} ['admin_nonce', value]
 */
const nonce = () => [
    "admin_nonce",
    (typeof window !== "undefined" && window.EssentialBlocksLocalize
        ? window.EssentialBlocksLocalize.admin_nonce
        : undefined),
];

/**
 * Read one option. Handler: includes/Admin/Admin.php `get()`.
 * A fresh install answers {success:false,data:"Invalid Key"}.
 *
 * @param {string} key Option name, e.g. "eb_settings".
 * @return {Promise<Object>} EbAjaxResult.
 */
export const getOption = (key) =>
    ebAjax("get_eb_admin_options", [["key", key], nonce()]);

/**
 * Raw transport for one eb_settings key. Handler: Admin.php `save()`.
 * UI code must use the queued saveSetting from useSettingMutation (T04).
 *
 * @param {string} key   eb_settings key.
 * @param {string} value String value ("true"/"false"/JSON string).
 * @return {Promise<Object>} EbAjaxResult.
 */
export const saveSetting = (key, value) =>
    ebAjax("save_eb_admin_options", [
        ["type", "settings"],
        ["value", value],
        nonce(),
        ["key", key],
    ]);

/**
 * Save the full block visibility map (type enable_disable, no key).
 *
 * @param {Object} blocksMap Full essential_all_blocks map.
 * @return {Promise<Object>} EbAjaxResult.
 */
export const saveBlocksVisibility = (blocksMap) =>
    ebAjax("save_eb_admin_options", [
        ["type", "enable_disable"],
        ["value", JSON.stringify(blocksMap)],
        nonce(),
    ]);

/**
 * Save AI Suite settings (type write_with_ai, no key).
 * On a bad key: result.data = {message, type:'api_key_error'}.
 *
 * @param {Object} aiSettings eb_write_with_ai value.
 * @return {Promise<Object>} EbAjaxResult.
 */
export const saveAiSettings = (aiSettings) =>
    ebAjax("save_eb_admin_options", [
        ["type", "write_with_ai"],
        ["value", JSON.stringify(aiSettings)],
        nonce(),
    ]);

/**
 * Reset one eb_settings key. Handler: Admin.php `reset()`.
 *
 * @param {string} key eb_settings key.
 * @return {Promise<Object>} EbAjaxResult.
 */
export const resetSetting = (key) =>
    ebAjax("reset_eb_admin_options", [
        nonce(),
        ["type", "settings"],
        ["key", key],
    ]);

/**
 * Templately packs proxy. data = wp_remote_post array (body is a JSON
 * string) or a WP_Error object. Handler: Admin.php `templates()`.
 *
 * @return {Promise<Object>} EbAjaxResult.
 */
export const getAdminTemplates = () =>
    ebAjax("get_eb_admin_templates", [nonce()]);

/**
 * Install/activate a plugin. The server always wraps the installer result,
 * so a failure arrives as {success:true,data:{success:false}}; ebAjax's
 * default rule turns that into ok:false.
 * Dashboard installs skip the "installed by" claim, so a plugin such as
 * xSpeed keeps its own onboarding (only Quick Setup's offer makes the claim).
 * Handler: includes/Integrations/PluginInstaller.php.
 *
 * @param {string} slug       Plugin slug.
 * @param {string} pluginFile Plugin basename, e.g. "templately/templately.php".
 * @return {Promise<Object>} EbAjaxResult.
 */
export const runPluginInstaller = (slug, pluginFile) =>
    ebAjax("plugin_installer", [
        ["slug", slug],
        ["plugin_file", pluginFile],
        ["host_claim", "0"],
        nonce(),
    ]);

/**
 * Regenerate generated CSS/JS assets.
 * Handler: includes/Integrations/AssetGeneration.php.
 *
 * @return {Promise<Object>} EbAjaxResult.
 */
export const regenerateAssets = () =>
    ebAjax("eb_regenerate_assets", [nonce(), ["value", true]]);

/**
 * The geocode URL the Google Maps key check proxies.
 *
 * @param {string} apiKey Google Maps API key.
 * @return {string} URL.
 */
export const googleMapsValidationUrl = (apiKey) =>
    `https://maps.googleapis.com/maps/api/geocode/json?address=New+York&key=${apiKey}`;

/**
 * Validate a Google Maps key. The reply is Google's own JSON (no envelope).
 * Handler: includes/Integrations/GoogleMap.php.
 *
 * @param {string} apiKey Google Maps API key.
 * @return {Promise<Object>} EbAjaxResult; data is the parsed body.
 */
export const validateGoogleMapsKey = (apiKey) =>
    ebAjax(
        "google_map_api_key_validation",
        [nonce(), ["ebGoogleMapUrl", googleMapsValidationUrl(apiKey)]],
        {
            isOk: (json) =>
                !!json &&
                !json.error_message &&
                json.status !== "error" &&
                json.success !== false,
        }
    );

/**
 * Register an Openverse client. The reply is Openverse's JSON (no envelope).
 * Handler: includes/Integrations/OpenVerse.php `registration()`.
 *
 * @param {string} email Contact email.
 * @param {string} name  Project name.
 * @return {Promise<Object>} EbAjaxResult; data is the parsed body.
 */
export const registerOpenverse = (email, name) =>
    ebAjax(
        "eb_get_registration",
        [nonce(), ["openverseEmail", email], ["openverseName", name]],
        {
            isOk: (json) =>
                !!json &&
                Object.prototype.hasOwnProperty.call(json, "client_id"),
        }
    );

/**
 * Fetch an Openverse access token.
 * Handler: includes/Integrations/OpenVerse.php `generate_token()`.
 *
 * @return {Promise<Object>} EbAjaxResult; data is the parsed body.
 */
export const getOpenverseToken = () =>
    ebAjax("eb_openverse_token", [nonce()], {
        isOk: (json) => !!json && typeof json.access_token === "string",
    });

/**
 * True when an AI settings save failed because of the API key.
 *
 * @param {Object} res EbAjaxResult.
 * @return {boolean} Whether it is an API key error.
 */
export const isApiKeyError = (res) =>
    !!res && !!res.data && res.data.type === "api_key_error";

/**
 * The server's error text, or the caller's translated fallback.
 *
 * @param {Object} res      EbAjaxResult.
 * @param {string} fallback Translated fallback copy.
 * @return {string} Message.
 */
export const errorMessage = (res, fallback) =>
    (res && res.error) || fallback;
