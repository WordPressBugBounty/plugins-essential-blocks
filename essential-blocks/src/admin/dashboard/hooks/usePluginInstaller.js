/**
 * Page-wide plugin install/activate status.
 *
 * Seeded once per plugin from `EssentialBlocksLocalize.get_plugins` and
 * updated only from truthful `plugin_installer` results. The store lives
 * outside React, so a status survives tab switches (the tabs unmount), and
 * concurrent clicks for the same plugin share one request.
 *
 * The store lives for the page view: a reload re-seeds from PHP. The
 * localized global is read, never written (it is a readonly global, and
 * other readers expect the page-load snapshot).
 */

/**
 * WordPress dependencies
 */
import { useCallback, useEffect, useState } from "@wordpress/element";

/**
 * Internal dependencies
 */
import { runPluginInstaller } from "../api/actions";

export const PLUGIN_STATUS = {
    MISSING: "missing",
    INACTIVE: "inactive",
    INSTALLING: "installing",
    ACTIVATING: "activating",
    ACTIVE: "active",
};

const store = new Map();
const inflight = new Map();
const listeners = new Set();

const emit = () => listeners.forEach((listener) => listener());

const seedStatus = (basename) => {
    const plugins =
        (typeof window !== "undefined" &&
            window.EssentialBlocksLocalize?.get_plugins) ||
        {};
    const plugin = plugins[basename];
    if (plugin && typeof plugin === "object") {
        return plugin.active ? PLUGIN_STATUS.ACTIVE : PLUGIN_STATUS.INACTIVE;
    }
    return PLUGIN_STATUS.MISSING;
};

const update = (basename, patch) => {
    store.set(basename, { ...getPluginEntry(basename), ...patch });
    emit();
};

/**
 * Current entry for a plugin, seeding it on first access.
 *
 * @param {string} basename Plugin file, e.g. "templately/templately.php".
 * @return {{status: string, error: (string|null), code: (string|null)}} Entry.
 */
export function getPluginEntry(basename) {
    if (!store.has(basename)) {
        store.set(basename, {
            status: seedStatus(basename),
            error: null,
            code: null,
        });
    }
    return store.get(basename);
}

/**
 * Install and/or activate a plugin. While a request for the same plugin is
 * in flight, the same promise is returned (no second request).
 *
 * @param {string} slug     Plugin slug.
 * @param {string} basename Plugin file.
 * @return {Promise<Object>} EbAjaxResult (never rejects).
 */
export function installPluginShared(slug, basename) {
    const entry = getPluginEntry(basename);

    if (entry.status === PLUGIN_STATUS.ACTIVE) {
        return Promise.resolve({
            ok: true,
            data: null,
            error: null,
            code: null,
            raw: null,
            status: 0,
        });
    }
    if (inflight.has(basename)) {
        return inflight.get(basename);
    }

    const before = entry.status;
    update(basename, {
        status:
            before === PLUGIN_STATUS.MISSING
                ? PLUGIN_STATUS.INSTALLING
                : PLUGIN_STATUS.ACTIVATING,
        error: null,
        code: null,
    });

    const request = runPluginInstaller(slug, basename)
        .then((result) => {
            if (result.ok) {
                store.set(basename, {
                    status: PLUGIN_STATUS.ACTIVE,
                    error: null,
                    code: null,
                });
            } else {
                store.set(basename, {
                    status: before,
                    error: result.error || "",
                    code:
                        (result.data &&
                            typeof result.data === "object" &&
                            result.data.code) ||
                        result.code,
                });
            }
            return result;
        })
        .finally(() => {
            inflight.delete(basename);
            emit();
        });

    inflight.set(basename, request);
    return request;
}

/**
 * Subscribe to store changes.
 *
 * @param {Function} listener Called with no arguments.
 * @return {Function} Unsubscribe.
 */
export function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/**
 * React binding.
 *
 * @param {string[]} basenames Plugins this component renders (stable array).
 * @return {Object} { entries, install, isBusy }
 */
export default function usePluginInstaller(basenames) {
    const [, force] = useState(0);

    useEffect(() => subscribe(() => force((n) => n + 1)), []);

    const entries = {};
    (basenames || []).forEach((basename) => {
        entries[basename] = getPluginEntry(basename);
    });

    const install = useCallback(
        (slug, basename) => installPluginShared(slug, basename),
        []
    );

    const isBusy = useCallback((basename) => {
        const { status } = getPluginEntry(basename);
        return (
            status === PLUGIN_STATUS.INSTALLING ||
            status === PLUGIN_STATUS.ACTIVATING
        );
    }, []);

    return { entries, install, isBusy };
}

/**
 * Test-only: reset the module store.
 */
export function __resetPluginStore() {
    store.clear();
    inflight.clear();
    emit();
}
