/**
 * Block visibility state + persistence.
 *
 * Persists exactly like before: the full blocks map is sent through the
 * existing `save_eb_admin_options` action with type `enable_disable`.
 * Saves are serialised and always send the latest map, so quick
 * successive toggles cannot race each other.
 */
/**
 * WordPress dependencies
 */
import { useCallback, useRef, useState } from "@wordpress/element";
/**
 * External dependencies
 */
import { saveEBSettingsData } from "@essential-blocks/controls";

const isSaveSuccess = (raw) => {
    try {
        return JSON.parse(raw)?.success === true;
    } catch (e) {
        return false;
    }
};

/**
 * Locked Pro blocks (Pro inactive) are never changed by the UI: the toggles
 * and Enable/Disable all only touch unlocked items. So they are re-sent
 * with exactly the value the server provided, and their "off" look is
 * derived in getBlockItems().
 *
 * @param {Object} initialBlocks EssentialBlocksLocalize.all_blocks.
 * @return {Object} { blocks, setVisibility, setMany }
 */
export default function useBlocksStore(initialBlocks) {
    const [blocks, setBlocks] = useState(() => ({ ...(initialBlocks || {}) }));

    const latest = useRef(blocks);
    const queue = useRef(Promise.resolve());

    const commit = (next) => {
        latest.current = next;
        setBlocks(next);
    };

    const save = () => {
        const run = () =>
            saveEBSettingsData("", JSON.stringify(latest.current), "enable_disable")
                .then(isSaveSuccess)
                .catch(() => false);
        const request = queue.current.then(run, run);
        queue.current = request;
        return request;
    };

    /**
     * Apply visibility changes optimistically, then persist.
     * Resolves true on success; on failure the changed keys are reverted.
     */
    const setMany = useCallback((changes) => {
        const previous = {};
        const next = { ...latest.current };
        Object.keys(changes).forEach((key) => {
            previous[key] = next[key]?.visibility;
            next[key] = { ...next[key], visibility: String(changes[key]) };
        });
        commit(next);

        return save().then((ok) => {
            if (!ok) {
                const reverted = { ...latest.current };
                Object.keys(previous).forEach((key) => {
                    reverted[key] = { ...reverted[key], visibility: previous[key] };
                });
                commit(reverted);
            }
            return ok;
        });
    }, []);

    const setVisibility = useCallback(
        (key, enabled) => setMany({ [key]: enabled }),
        [setMany]
    );

    return { blocks, setVisibility, setMany };
}
