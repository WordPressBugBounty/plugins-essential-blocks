/**
 * Card surface used across the dashboard.
 */
import classnames from "classnames";

/**
 * @param {Object}   props
 * @param {string=}  props.as          Element to render (default "div").
 * @param {boolean=} props.interactive Hover elevation (only for clickable cards).
 * @param {boolean=} props.muted       Subtle background (e.g. locked state).
 * @param {string=}  props.className
 * @param {*}        props.children
 * @return {JSX.Element} Card.
 */
export default function Card({
    as: Tag = "div",
    interactive = false,
    muted = false,
    className,
    children,
    ...rest
}) {
    return (
        <Tag
            className={classnames(
                "eb-card",
                { "eb-card--interactive": interactive, "eb-card--muted": muted },
                className
            )}
            {...rest}
        >
            {children}
        </Tag>
    );
}

const part = (base) =>
    function CardPart({ className, children, ...rest }) {
        return (
            <div className={classnames(base, className)} {...rest}>
                {children}
            </div>
        );
    };

Card.Header = part("eb-card__header");
Card.Body = part("eb-card__body");
Card.Footer = part("eb-card__footer");
