/**
 * Page-lifetime cache for the Templately packs shown on the Templates tab.
 *
 * - The first mount fetches; later mounts reuse a 'ready'/'empty' result
 *   without a request (the tabs unmount on every switch).
 * - Errors are not cached: the next mount or reload() fetches again.
 * - Concurrent callers share one in-flight request.
 */

/**
 * WordPress dependencies
 */
import { useEffect, useState } from "@wordpress/element";

/**
 * External dependencies
 */
import { ebJsonStringCheck } from "@essential-blocks/controls";

/**
 * Internal dependencies
 */
import { getAdminTemplates } from "../api/actions";

const IDLE = { status: "idle", packs: [], error: null, code: null };

let cache = IDLE;
let inflight = null;
const listeners = new Set();

const emit = () => listeners.forEach((listener) => listener());

/**
 * Pure: EbAjaxResult → { status, packs }, with the same parsing rules the
 * Templates tab always used.
 *
 * @param {Object} result EbAjaxResult from getAdminTemplates().
 * @return {{status: string, packs: Array}} Parsed state.
 */
export function parsePacksResult(result) {
    if (!result || !result.ok) {
        return { status: "error", packs: [] };
    }
    const body = result.data?.body;
    const parsed = body && ebJsonStringCheck(body) ? JSON.parse(body) : null;
    const packs = parsed?.data?.packs?.data;
    if (Array.isArray(packs) && packs.length > 0) {
        return { status: "ready", packs };
    }
    return { status: parsed ? "empty" : "error", packs: [] };
}

const fetchPacks = () => {
    if (inflight) {
        return inflight;
    }
    cache = { ...cache, status: "loading" };
    emit();

    inflight = getAdminTemplates()
        .then((result) => {
            cache = {
                ...parsePacksResult(result),
                error: result.ok ? null : result.error,
                code: result.ok ? null : result.code,
            };
        })
        .finally(() => {
            inflight = null;
            emit();
        });
    return inflight;
};

/**
 * @return {Object} { status: 'loading'|'ready'|'empty'|'error', packs, error, code, reload }
 */
export default function useTemplatelyPacks() {
    const [, force] = useState(0);

    useEffect(() => {
        const unsubscribe = (() => {
            const listener = () => force((n) => n + 1);
            listeners.add(listener);
            return () => listeners.delete(listener);
        })();
        if (cache.status === "idle" || cache.status === "error") {
            fetchPacks();
        }
        return unsubscribe;
    }, []);

    return {
        status: cache.status === "idle" ? "loading" : cache.status,
        packs: cache.packs,
        error: cache.error,
        code: cache.code,
        reload: fetchPacks,
    };
}

/**
 * Test-only: reset the cache.
 */
export function __resetPacksCache() {
    cache = IDLE;
    inflight = null;
    emit();
}
