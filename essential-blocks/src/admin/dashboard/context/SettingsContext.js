/**
 * Shared, cached access to dashboard options.
 *
 * Each option (e.g. `eb_settings`, `eb_write_with_ai`) is fetched once per
 * page load through the existing `get_eb_admin_options` AJAX action and
 * shared by every tab, so switching tabs no longer refetches it.
 * Writes still go through the existing `save_eb_admin_options` action, but
 * every `eb_settings` write is serialised through one queue (the server's
 * save is an unlocked read-modify-write), and a failed write reverts only
 * its own key when no newer write to that key was queued.
 */

/**
 * WordPress dependencies
 */
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "@wordpress/element";

/**
 * Internal dependencies
 */
import { getOption, saveSetting as postSetting } from "../api/actions";
import { createSerialQueue } from "../api/serialQueue";

const SettingsContext = createContext(null);

const QUEUE_FALLBACK = {
    ok: false,
    data: null,
    error: null,
    code: "network",
    raw: null,
    status: 0,
};

export function SettingsProvider({ children }) {
    // { [optionKey]: { data: object, status: 'loading' | 'ready' | 'error',
    //   error: string|null, errorCode: string|null } }
    const [options, setOptions] = useState({});
    const requests = useRef({});
    const queue = useRef(null);
    if (!queue.current) {
        queue.current = createSerialQueue();
    }
    const generation = useRef({});
    const [pending, setPending] = useState(0);

    // Run a task through the eb_settings queue, counting it in `pending`.
    const enqueue = useCallback((task) => {
        setPending((n) => n + 1);
        return queue.current.push(task, QUEUE_FALLBACK).then((result) => {
            setPending((n) => n - 1);
            return result;
        });
    }, []);

    const load = useCallback((optionKey, { force = false } = {}) => {
        if (requests.current[optionKey] && !force) {
            return requests.current[optionKey];
        }

        setOptions((prev) => ({
            ...prev,
            [optionKey]: {
                data: prev[optionKey]?.data ?? {},
                status: "loading",
                error: null,
                errorCode: null,
            },
        }));

        // A "server" failure means the option is empty ("Invalid Key"): that
        // is a fresh install, so callers fall back to their defaults.
        // Nonce, network and unreadable answers are real load errors: the
        // entry goes to "error" and the cached request is dropped so a later
        // mount or retry() fetches again.
        const request = getOption(optionKey).then((result) => {
            if (result.ok || result.code === "server") {
                const value =
                    result.ok && result.data && typeof result.data === "object"
                        ? result.data
                        : {};
                setOptions((prev) => ({
                    ...prev,
                    [optionKey]: {
                        data: value,
                        status: "ready",
                        error: null,
                        errorCode: null,
                    },
                }));
                return value;
            }

            delete requests.current[optionKey];
            setOptions((prev) => ({
                ...prev,
                [optionKey]: {
                    data: prev[optionKey]?.data ?? {},
                    status: "error",
                    error: result.error,
                    errorCode: result.code,
                },
            }));
            return {};
        });

        requests.current[optionKey] = request;
        return request;
    }, []);

    // Update cached values without saving (e.g. after a save done elsewhere).
    // Merges by default; `replace` swaps the whole cached object.
    const setLocal = useCallback((optionKey, patch, { replace = false } = {}) => {
        setOptions((prev) => ({
            ...prev,
            [optionKey]: {
                ...prev[optionKey],
                status: prev[optionKey]?.status ?? "ready",
                data: replace ? { ...patch } : { ...(prev[optionKey]?.data ?? {}), ...patch },
            },
        }));
    }, []);

    // Optimistic, queued save of one eb_settings key. On failure the key
    // reverts, unless a newer write to the same key was queued meanwhile.
    const saveSetting = useCallback(
        (key, value) => {
            const next = typeof value === "boolean" ? String(value) : value;
            const gen = (generation.current[key] || 0) + 1;
            generation.current[key] = gen;
            let previous;

            setOptions((prev) => {
                const current = prev.eb_settings?.data ?? {};
                previous = current[key];
                return {
                    ...prev,
                    eb_settings: {
                        ...prev.eb_settings,
                        status: prev.eb_settings?.status ?? "ready",
                        data: { ...current, [key]: next },
                    },
                };
            });

            return enqueue(() => postSetting(key, next)).then((result) => {
                if (!result.ok && generation.current[key] === gen) {
                    setOptions((prev) => {
                        const data = { ...(prev.eb_settings?.data ?? {}) };
                        if (previous === undefined) {
                            delete data[key];
                        } else {
                            data[key] = previous;
                        }
                        return { ...prev, eb_settings: { ...prev.eb_settings, data } };
                    });
                }
                return {
                    ok: result.ok,
                    error: result.error,
                    code: result.code,
                };
            });
        },
        [enqueue]
    );

    // Back-compat: resolves true/false.
    const setSetting = useCallback(
        (key, value) => saveSetting(key, value).then((result) => result.ok),
        [saveSetting]
    );

    // Several keys, one request each, strictly in order. Each key is
    // independent on the server, so a failure does not stop the rest.
    const saveSettings = useCallback(
        (entries) =>
            Promise.all(
                (entries || []).map(([key, value]) =>
                    saveSetting(key, value).then((result) => ({
                        key,
                        ...result,
                    }))
                )
            ).then((results) => ({
                ok: results.every((result) => result.ok),
                results,
            })),
        [saveSetting]
    );

    const value = useMemo(
        () => ({
            options,
            load,
            setLocal,
            setSetting,
            saveSetting,
            saveSettings,
            enqueue,
            pending,
        }),
        [
            options,
            load,
            setLocal,
            setSetting,
            saveSetting,
            saveSettings,
            enqueue,
            pending,
        ]
    );

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

/**
 * Read one cached option. Fetches it on first use.
 *
 * `loading` stays true while the option is loading **or** failed to load,
 * so consumers stay non-interactive. When `status === "error"`, render a
 * load-error state with `retry` (T20).
 *
 * @param {string} optionKey Option name (must contain "eb_").
 * @return {Object} { data, loading, status, error, errorCode, retry, refresh, setLocal }
 */
export function useEbOption(optionKey) {
    const context = useContext(SettingsContext);
    const { options, load, setLocal } = context;

    useEffect(() => {
        load(optionKey);
    }, [load, optionKey]);

    const retry = useCallback(
        () => load(optionKey, { force: true }),
        [load, optionKey]
    );

    const entry = options[optionKey];
    const status = entry?.status ?? "loading";

    return {
        data: entry?.data ?? {},
        loading: status !== "ready",
        status,
        error: status === "error" ? entry.error : null,
        errorCode: status === "error" ? entry.errorCode : null,
        retry,
        refresh: retry,
        setLocal: (patch, opts) => setLocal(optionKey, patch, opts),
    };
}

/**
 * `eb_settings` with queued, optimistic writes:
 * - `setSetting( key, value )` resolves true/false (reverts on failure);
 * - `saveSetting( key, value )` resolves { ok, error, code };
 * - `saveSettings( entries )` saves several keys in order;
 * - `enqueue( task )` runs any other eb_settings write through the queue;
 * - `pending` counts queued + in-flight writes.
 */
export function useEbSettings() {
    const { setSetting, saveSetting, saveSettings, enqueue, pending } =
        useContext(SettingsContext);
    const { data, loading, status, error, errorCode, retry, refresh, setLocal } =
        useEbOption("eb_settings");

    return {
        settings: data,
        loading,
        status,
        error,
        errorCode,
        retry,
        refresh,
        setLocal,
        setSetting,
        saveSetting,
        saveSettings,
        enqueue,
        pending,
    };
}

/**
 * Whether an `eb_settings` flag is on. Values are stored as "true"/"false"
 * strings; a missing key means the given default.
 *
 * @param {Object}  settings     Cached eb_settings.
 * @param {string}  key          Setting key.
 * @param {boolean} defaultValue Value when the key is missing.
 * @return {boolean} Whether the flag is on.
 */
export const isSettingOn = (settings, key, defaultValue = true) => {
    const value = settings?.[key];
    if (value === undefined || value === "") {
        return defaultValue;
    }
    return value !== "false" && value !== false;
};

/**
 * Cached value of an option if some tab already loaded it, without
 * triggering a fetch (e.g. AI status shown on the Extensions tab).
 *
 * @param {string} optionKey Option name.
 * @return {Object|null} Cached data, or null when not loaded.
 */
export function usePeekOption(optionKey) {
    const { options } = useContext(SettingsContext);
    const entry = options[optionKey];
    return entry && entry.status === "ready" ? entry.data : null;
}
