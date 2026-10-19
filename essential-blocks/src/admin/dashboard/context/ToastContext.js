/**
 * Non-blocking save feedback. Success/info toasts auto-dismiss after 3s;
 * errors stay until dismissed. Announced through aria-live regions.
 *
 * Optional per toast: `key` (dedupe), `persistent` (never auto-dismissed,
 * never evicted by newer toasts), `action: { label, onClick }` and
 * `duration` (ms, success/info only).
 * Any request whose nonce expired raises one persistent session toast.
 */

/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
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
import { onSessionExpired, registerNonceMessages } from "../api/ebAjax";

// The server's nonce messages are translated; register their localized
// forms so ebAjax (import-free) recognises them on non-English sites.
registerNonceMessages([
    __("Nonce Error", "essential-blocks"),
    __("Nonce did not match", "essential-blocks"),
]);

const ToastContext = createContext({ show: () => {} });

const AUTO_DISMISS_MS = 3000;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(0);
    // Mirrors the stack for synchronous dedupe by key.
    const stack = useRef([]);

    const commit = (updater) => {
        setToasts((prev) => {
            const next = updater(prev);
            stack.current = next;
            return next;
        });
    };

    const dismiss = useCallback((id) => {
        commit((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const show = useCallback(
        ({ type = "success", message, key, persistent = false, action, duration }) => {
            if (key) {
                const existing = stack.current.find((toast) => toast.key === key);
                if (existing) {
                    return existing.id;
                }
            }
            const id = ++nextId.current;
            const toast = { id, type, message, key, persistent, action };
            // Keep the stack short: persistent toasts always stay, the
            // others are capped at the newest 3 (plus the new one).
            commit((prev) => {
                const pinned = prev.filter((item) => item.persistent);
                const rest = prev.filter((item) => !item.persistent).slice(-3);
                return [...pinned, ...rest, toast];
            });
            stack.current = [...stack.current, toast];
            if (type !== "error" && !persistent) {
                setTimeout(() => dismiss(id), duration || AUTO_DISMISS_MS);
            }
            return id;
        },
        [dismiss]
    );

    useEffect(
        () =>
            onSessionExpired(() =>
                show({
                    type: "error",
                    key: "session-expired",
                    persistent: true,
                    message: __(
                        "Your session has expired. Reload the page to keep saving changes.",
                        "essential-blocks"
                    ),
                    action: {
                        label: __("Reload", "essential-blocks"),
                        onClick: () => window.location.reload(),
                    },
                })
            ),
        [show]
    );

    const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

    const renderToast = (toast) => (
        <div key={toast.id} className={`eb-toast eb-toast--${toast.type}`}>
            <span className="eb-toast__message">{toast.message}</span>
            {toast.action && (
                <button
                    type="button"
                    className="eb-toast__action"
                    onClick={toast.action.onClick}
                >
                    {toast.action.label}
                </button>
            )}
            <button
                type="button"
                className="eb-toast__close"
                aria-label={__("Dismiss notification", "essential-blocks")}
                onClick={() => dismiss(toast.id)}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" focusable="false">
                    <path d="M18 6 6 18M6 6l12 12" />
                </svg>
            </button>
        </div>
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="eb-toasts">
                <div role="status" aria-live="polite" className="eb-toasts__region">
                    {toasts.filter((t) => t.type !== "error").map(renderToast)}
                </div>
                <div role="alert" aria-live="assertive" className="eb-toasts__region">
                    {toasts.filter((t) => t.type === "error").map(renderToast)}
                </div>
            </div>
        </ToastContext.Provider>
    );
}

/**
 * @return {{show: Function, dismiss: Function}} Toast API.
 */
export const useToast = () => useContext(ToastContext);
