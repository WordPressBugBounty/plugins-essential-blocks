/**
 * Dashboard button. Renders <a> when `href` is set, otherwise <button>.
 * Composes the legacy `.eb-btn-*` classes so existing styles stay shared.
 */
import classnames from "classnames";

const VARIANTS = {
    primary: "eb-btn-primary",
    secondary: "eb-btn-border",
    ghost: "eb-btn-ghost",
    link: "eb-btn-link",
    danger: "eb-btn-danger",
};

const SIZES = {
    sm: "eb-btn-sm",
    md: "eb-btn-md",
};

/**
 * @param {Object}  props
 * @param {string=} props.variant  primary | secondary | ghost | link | danger.
 * @param {string=} props.size     sm | md.
 * @param {boolean=} props.loading Shows a spinner and sets aria-busy.
 * @param {boolean=} props.disabled
 * @param {string=} props.href     Renders a link instead of a button.
 * @param {*=}      props.icon     Leading icon element.
 * @param {string=} props.className
 * @param {*}       props.children
 * @return {JSX.Element} Button.
 */
export default function Button({
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    href,
    icon,
    className,
    children,
    ...rest
}) {
    const classes = classnames("eb-btn", VARIANTS[variant], SIZES[size], className);
    const content = (
        <>
            {loading ? <span className="eb-btn__spinner" aria-hidden="true" /> : icon}
            {children}
        </>
    );

    if (href) {
        return (
            <a
                className={classes}
                href={disabled ? undefined : href}
                aria-disabled={disabled || undefined}
                {...rest}
            >
                {content}
            </a>
        );
    }

    return (
        <button
            type="button"
            className={classes}
            disabled={disabled}
            aria-busy={loading || undefined}
            {...rest}
        >
            {content}
        </button>
    );
}
