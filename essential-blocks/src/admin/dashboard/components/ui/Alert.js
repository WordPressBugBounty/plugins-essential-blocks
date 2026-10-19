/**
 * Inline message (info / success / warning / error).
 *
 * Body text uses --eb-text; the tone colour is used only for the left
 * border and the icon. No focus is moved on render: after `onDismiss`, the
 * consumer must move focus to a sensible target.
 */

/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";

/**
 * External dependencies
 */
import classnames from "classnames";

const svg = (children) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        {children}
    </svg>
);

const ICONS = {
    info: svg(
        <>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
        </>
    ),
    success: svg(
        <>
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </>
    ),
    warning: svg(
        <>
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 9v4M12 17h.01" />
        </>
    ),
    error: svg(
        <>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
        </>
    ),
};

const LIVE_ROLES = { polite: "status", assertive: "alert" };

/**
 * @param {Object}   props
 * @param {string}   props.tone      'info' | 'success' | 'warning' | 'error'.
 * @param {*}        props.title     Bold first line.
 * @param {*}        props.children  Body.
 * @param {*}        props.actions   Usually Button size="sm".
 * @param {Function} props.onDismiss Renders a Dismiss button.
 * @param {string}   props.live      'off' | 'polite' | 'assertive'.
 * @param {string}   props.role      Explicit role override.
 * @param {*}        props.icon      Icon node, or false for none.
 * @param {string}   props.className Extra class.
 * @return {JSX.Element} Alert.
 */
export default function Alert({
    tone = "info",
    title,
    children,
    actions,
    onDismiss,
    live = "off",
    role,
    icon,
    className,
}) {
    const resolvedRole = role || LIVE_ROLES[live];
    const iconNode = icon === false ? null : icon || ICONS[tone] || ICONS.info;

    return (
        <div
            className={classnames("eb-alert-box", `eb-alert-box--${tone}`, className)}
            role={resolvedRole}
        >
            {iconNode && <span className="eb-alert-box__icon">{iconNode}</span>}
            <div className="eb-alert-box__body">
                {title && <p className="eb-alert-box__title">{title}</p>}
                {children && <div className="eb-alert-box__content">{children}</div>}
            </div>
            {actions && <div className="eb-alert-box__actions">{actions}</div>}
            {onDismiss && (
                <button
                    type="button"
                    className="eb-alert-box__dismiss"
                    aria-label={__("Dismiss", "essential-blocks")}
                    onClick={onDismiss}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" focusable="false">
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}
