/**
 * Dashboard modal built on @wordpress/components Modal (focus trap, Esc,
 * aria-modal, focus return). The overlay is portaled to <body>, so it is
 * tagged `.eb-dash-portal` and given the current theme for the tokens.
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
 * @param {string}   props.title
 * @param {Function} props.onClose
 * @param {string=}  props.size          sm | md (default) | lg.
 * @param {string=}  props.className
 * @param {string=}  props.role          Optional dialog role (e.g. "alertdialog").
 * @param {Object=}  props.aria          Optional { describedby, labelledby }.
 * @param {boolean=} props.isDismissible Optional; WP default is true.
 * @param {*}        props.children
 * @return {JSX.Element} Modal.
 */
export default function Modal({
    title,
    onClose,
    size = "md",
    className,
    role,
    aria,
    isDismissible,
    children,
}) {
    // Only forward the optional props when set, so existing callers get
    // exactly the WP defaults.
    const optional = {};
    if (role !== undefined) {
        optional.role = role;
    }
    if (aria !== undefined) {
        optional.aria = aria;
    }
    if (isDismissible !== undefined) {
        optional.isDismissible = isDismissible;
    }

    const contentRef = useRef(null);

    useEffect(() => {
        const overlay = contentRef.current?.closest(".eb-dash-portal");
        overlay?.setAttribute("data-eb-theme", getResolvedTheme());
    }, []);

    return (
        <WPModal
            title={title}
            onRequestClose={onClose}
            className={classnames("eb-dash-modal", `eb-dash-modal--${size}`, className)}
            overlayClassName="eb-dash-portal eb-dash-modal-overlay"
            {...optional}
        >
            <div ref={contentRef} className="eb-dash-modal__content">
                {children}
            </div>
        </WPModal>
    );
}
