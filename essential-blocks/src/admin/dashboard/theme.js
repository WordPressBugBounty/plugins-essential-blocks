/**
 * Dashboard theme preference: "light" (default) or "dark".
 * Any other stored value (including the earlier "system") is treated as
 * "light". views/admin.php carries an inline copy of the read step so the
 * theme is applied before first paint; keep the two in sync.
 *
 * The preference lives in localStorage only (per viewer, no backend).
 * The theme is written to `data-eb-theme` on <body>, the dashboard wrapper
 * and any portaled dashboard surface (`.eb-dash-portal`).
 */
const THEME_STORAGE_KEY = "eb-dashboard-theme";

const WRAPPER_SELECTOR = ".eb-settings-wrap";
const PORTAL_SELECTOR = ".eb-dash-portal";

export const PREFERENCES = ["light", "dark"];

const listeners = new Set();
// Fallback when localStorage is unavailable: keep the choice for this page.
let memoryPreference = null;

const normalize = (value) =>
    PREFERENCES.includes(value) ? value : "light";

/**
 * Stored preference: "light" | "dark".
 *
 * @return {string} Preference.
 */
export const getThemePreference = () => {
    try {
        return normalize(window.localStorage.getItem(THEME_STORAGE_KEY));
    } catch (e) {
        return memoryPreference || "light";
    }
};

/**
 * Theme shown: "light" | "dark".
 *
 * @return {string} Resolved theme.
 */
export const getResolvedTheme = getThemePreference;

// Back-compat alias: the resolved theme.
export const getTheme = getResolvedTheme;

const applyTheme = (theme) => {
    // body carries it too so page-level rules (#wpcontent background) can follow.
    document.body.setAttribute("data-eb-theme", theme);
    document
        .querySelectorAll(`${WRAPPER_SELECTOR}, ${PORTAL_SELECTOR}`)
        .forEach((el) => el.setAttribute("data-eb-theme", theme));
};

const notify = () => {
    const resolved = getResolvedTheme();
    applyTheme(resolved);
    const preference = getThemePreference();
    listeners.forEach((listener) => listener(resolved, preference));
};

/**
 * Persist a preference and apply it.
 *
 * @param {string} preference "light" | "dark".
 */
export const setTheme = (preference) => {
    const next = normalize(preference);
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (e) {
        memoryPreference = next;
    }
    notify();
};

/**
 * @param {Function} listener Called with (resolved, preference).
 * @return {Function} Unsubscribe.
 */
export const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

/**
 * Apply the stored theme. Call once, before the React root renders.
 */
export const initTheme = () => {
    applyTheme(getResolvedTheme());

    // Keep multiple open dashboard tabs in sync.
    window.addEventListener("storage", (event) => {
        if (event.key === THEME_STORAGE_KEY) {
            notify();
        }
    });
};
