/**
 * Off-canvas drawer built on the WP Modal (focus trap, Esc, scrim click,
 * focus return, page hidden from assistive tech, body scroll lock).
 * Used by the mobile shell (≤782px) to show the sidebar navigation.
 */

/**
 * WordPress dependencies
 */
import { Modal as WPModal } from "@wordpress/components";
import { useEffect, useRef } from "@wordpress/element";

/**
 * External dependencies
 */
import classnames from "classnames";

/**
 * Internal dependencies
 */
import { getResolvedTheme } from "../../theme";

/**
 * @param {Object}   props
 * @param {boolean}  props.isOpen          Renders nothing when false.
 * @param {Function} props.onClose         Esc, scrim click, close button.
 * @param {string}   props.title           Dialog name.
 * @param {boolean}  props.hideTitle       Visually hide the heading text.
 * @param {string}   props.side            'left' | 'right'.
 * @param {string}   props.width           CSS width (default min(320px, 85vw)).
 * @param {Object}   props.initialFocusRef Element focused after open.
 * @param {string}   props.id              Frame id (for aria-controls).
 * @param {string}   props.className       Extra class.
 * @param {*}        props.children        Content.
 * @return {JSX.Element|null} Drawer.
 */
export default function Drawer({
    isOpen,
    onClose,
    title,
    hideTitle = false,
    side = "left",
    width = "min(320px, 85vw)",
    initialFocusRef,
    id,
    className,
    children,
}) {
    const contentRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }
        const overlay = contentRef.current?.closest(".eb-dash-portal");
        overlay?.setAttribute("data-eb-theme", getResolvedTheme());
        const frame = contentRef.current?.closest(".components-modal__frame");
        frame?.style.setProperty("--eb-drawer-w", width);
        if (id) {
            frame?.setAttribute("id", id);
        }
        // After WP Modal's own focus-on-mount.
        const raf = window.requestAnimationFrame(() =>
            initialFocusRef?.current?.focus()
        );
        return () => window.cancelAnimationFrame(raf);
    }, [isOpen, width, id, initialFocusRef]);

    if (!isOpen) {
        return null;
    }

    return (
        <WPModal
            title={title}
            onRequestClose={onClose}
            className={classnames("eb-drawer", `eb-drawer--${side}`, className, {
                "eb-drawer--title-hidden": hideTitle,
            })}
            overlayClassName={`eb-dash-portal eb-drawer-overlay eb-drawer-overlay--${side}`}
        >
            <div ref={contentRef} className="eb-drawer__content">
                {children}
            </div>
        </WPModal>
    );
}
