/**
 * Small status pill.
 */
import classnames from "classnames";

/**
 * @param {Object}  props
 * @param {string=} props.tone free | pro | new | popular | updated | active | always | neutral.
 * @param {*=}      props.icon Leading icon.
 * @param {string=} props.className
 * @param {*}       props.children
 * @return {JSX.Element} Badge.
 */
export default function Badge({ tone = "neutral", icon, className, children }) {
    return (
        <span className={classnames("eb-badge", `eb-badge--${tone}`, className)}>
            {icon}
            {children}
        </span>
    );
}
