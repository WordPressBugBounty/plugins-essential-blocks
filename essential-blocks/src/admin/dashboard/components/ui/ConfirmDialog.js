/**
 * Confirmation dialog for destructive or hard-to-reverse actions.
 *
 *   const confirm = useConfirm();
 *   if ( await confirm( { title, message, confirmLabel, tone: 'danger' } ) ) { … }
 *
 * Resolves true on Confirm, false on Cancel / Esc / X / overlay click.
 * Focus starts on Cancel, so Enter cancels. One dialog at a time.
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
    useRef,
    useState,
} from "@wordpress/element";
import { useInstanceId } from "@wordpress/compose";

/**
 * Internal dependencies
 */
import Modal from "./Modal";
import Button from "./Button";

const ConfirmContext = createContext(null);

/**
 * Controlled confirmation dialog.
 *
 * @param {Object}   props
 * @param {boolean}  props.isOpen       Whether it is shown.
 * @param {string}   props.title        Dialog name.
 * @param {*}        props.message      Body (aria-describedby).
 * @param {string}   props.confirmLabel Confirm button text.
 * @param {string}   props.cancelLabel  Cancel button text.
 * @param {string}   props.tone         'default' | 'danger'.
 * @param {Function} props.onConfirm    Confirm handler.
 * @param {Function} props.onCancel     Cancel / close handler.
 * @return {JSX.Element|null} Dialog.
 */
export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = __("Confirm", "essential-blocks"),
    cancelLabel = __("Cancel", "essential-blocks"),
    tone = "default",
    onConfirm,
    onCancel,
}) {
    const messageId = useInstanceId(ConfirmDialog, "eb-confirm-message");
    // Button is not a forwardRef component: focus Cancel through its container.
    const actionsRef = useRef(null);
    const settled = useRef(false);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }
        settled.current = false;
        // After WP Modal's own focus-on-mount.
        const raf = window.requestAnimationFrame(() =>
            actionsRef.current?.querySelector(".eb-confirm__cancel")?.focus()
        );
        return () => window.cancelAnimationFrame(raf);
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const once = (handler) => () => {
        if (settled.current) {
            return;
        }
        settled.current = true;
        handler?.();
    };

    return (
        <Modal
            title={title}
            size="sm"
            role="alertdialog"
            aria={{ describedby: messageId }}
            onClose={once(onCancel)}
            className="eb-confirm"
        >
            <div id={messageId} className="eb-confirm__message">
                {message}
            </div>
            <div ref={actionsRef} className="eb-confirm__actions">
                <Button
                    variant="secondary"
                    className="eb-confirm__cancel"
                    onClick={once(onCancel)}
                >
                    {cancelLabel}
                </Button>
                <Button
                    variant={tone === "danger" ? "danger" : "primary"}
                    onClick={once(onConfirm)}
                >
                    {confirmLabel}
                </Button>
            </div>
        </Modal>
    );
}

/**
 * Provides `useConfirm()` to the dashboard.
 *
 * @param {Object} props
 * @param {*}      props.children Children.
 * @return {JSX.Element} Provider.
 */
export function ConfirmProvider({ children }) {
    const [current, setCurrent] = useState(null);
    const active = useRef(null);

    const confirm = useCallback(
        (options) =>
            new Promise((resolve) => {
                if (active.current) {
                    if (window.SCRIPT_DEBUG) {
                        // eslint-disable-next-line no-console
                        console.warn("EB: a confirmation dialog is already open.");
                    }
                    resolve(false);
                    return;
                }
                active.current = { options, resolve };
                setCurrent(active.current);
            }),
        []
    );

    const settle = (value) => {
        const entry = active.current;
        active.current = null;
        setCurrent(null);
        entry?.resolve(value);
    };

    useEffect(
        () => () => {
            active.current?.resolve(false);
            active.current = null;
        },
        []
    );

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {current && (
                <ConfirmDialog
                    isOpen
                    {...current.options}
                    onConfirm={() => settle(true)}
                    onCancel={() => settle(false)}
                />
            )}
        </ConfirmContext.Provider>
    );
}

/**
 * @return {Function} confirm(options) → Promise<boolean>.
 */
export function useConfirm() {
    const confirm = useContext(ConfirmContext);
    if (!confirm) {
        throw new Error("useConfirm() must be used inside <ConfirmProvider>.");
    }
    return confirm;
}
