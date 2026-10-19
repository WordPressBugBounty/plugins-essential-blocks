/**
 * Queued writes to `eb_settings`.
 *
 * Every write goes through one FIFO queue (concurrency 1) owned by the
 * SettingsProvider, because the server saves `eb_settings` with an unlocked
 * read-modify-write. A failed write reverts only its own key, and only when
 * no newer write to that key was queued.
 */

/**
 * Internal dependencies
 */
import { useEbSettings } from "../context/SettingsContext";

export { createSerialQueue } from "../api/serialQueue";

/**
 * @return {Object} { setSetting, saveSetting, saveSettings, enqueue, pending }
 *  - setSetting(key, value)   → Promise<boolean>
 *  - saveSetting(key, value)  → Promise<{ok, error, code}>
 *  - saveSettings(entries)    → Promise<{ok, results}>
 *  - enqueue(task)            → Promise<EbAjaxResult>
 *  - pending                  → number of queued + in-flight writes
 */
export default function useSettingMutation() {
    const { setSetting, saveSetting, saveSettings, enqueue, pending } =
        useEbSettings();
    return { setSetting, saveSetting, saveSettings, enqueue, pending };
}
