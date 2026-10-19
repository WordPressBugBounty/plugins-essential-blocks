/**
 * Unsaved-changes guard for dashboard forms.
 *
 * While `isDirty`:
 * - reloading or closing the page shows the browser's native leave prompt;
 * - plain left clicks on links to another dashboard tab are caught in the
 *   capture phase (before React's handlers) and confirmed first. Modified
 *   and middle clicks open a new browser tab and are left alone.
 *
 * Browser Back/Forward can't be stopped here (the shell's popstate handler
 * switches tabs). Forms use `drafts` to keep their edits for the page
 * session instead. No listener stays attached while the form is clean.
 */

/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useEffect, useRef } from "@wordpress/element";

/**
 * Internal dependencies
 */
import { useConfirm } from "../components/ui/ConfirmDialog";
import { navigateToTab } from "../routing";

// Page-session only: no storage, no eb_settings write.
const draftStore = new Map();

export const drafts = {
    get: (key) => draftStore.get(key),
    set: (key, value) => draftStore.set(key, value),
    clear: (key) => draftStore.delete(key),
};

const currentTab = () =>
    new URLSearchParams(window.location.search).get("tab") || "general";

// Dashboard tab a link points to, or null for anything else.
const targetTab = (anchor) => {
    try {
        const url = new URL(anchor.href, window.location.href);
        if (
            url.origin !== window.location.origin ||
            url.searchParams.get("page") !== "essential-blocks"
        ) {
            return null;
        }
        return url.searchParams.get("tab") || "general";
    } catch (e) {
        return null;
    }
};

/**
 * @param {boolean}  isDirty             Form has unsaved changes.
 * @param {Object}   opts
 * @param {string}   opts.message        Dialog body (translated).
 * @param {Function} opts.onConfirmLeave Called before leaving (mark clean).
 */
export default function useUnsavedGuard(isDirty, opts = {}) {
    const confirm = useConfirm();
    const optsRef = useRef(opts);
    optsRef.current = opts;

    useEffect(() => {
        if (!isDirty) {
            return undefined;
        }

        const onBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = "";
        };

        const onClick = (event) => {
            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            ) {
                return;
            }
            const anchor = event.target.closest?.("a[href]");
            if (!anchor || (anchor.target && anchor.target !== "_self")) {
                return;
            }
            const tab = targetTab(anchor);
            if (!tab || tab === currentTab()) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            confirm({
                title: __("Leave without saving?", "essential-blocks"),
                message: optsRef.current.message,
                confirmLabel: __("Leave", "essential-blocks"),
                cancelLabel: __("Stay", "essential-blocks"),
            }).then((leave) => {
                if (!leave) {
                    return;
                }
                optsRef.current.onConfirmLeave?.();
                const url = new URL(anchor.href, window.location.href);
                const navOpts = {};
                ["section", "focus"].forEach((param) => {
                    if (url.searchParams.get(param)) {
                        navOpts[param] = url.searchParams.get(param);
                    }
                });
                navigateToTab(tab, navOpts);
            });
        };

        window.addEventListener("beforeunload", onBeforeUnload);
        document.addEventListener("click", onClick, true);
        return () => {
            window.removeEventListener("beforeunload", onBeforeUnload);
            document.removeEventListener("click", onClick, true);
        };
    }, [isDirty, confirm]);
}
