/**
 * In-page section navigation (real links; works in a new tab and without
 * JS). Plain left-clicks call `onSelect` instead of navigating.
 */

/**
 * WordPress dependencies
 */
import { useEffect, useRef } from "@wordpress/element";

/**
 * External dependencies
 */
import classnames from "classnames";

const isPlainClick = (event) =>
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey;

/**
 * @param {Object}   props
 * @param {string}   props.label     nav aria-label.
 * @param {Array}    props.items     [{ id, label, href, badge }].
 * @param {string}   props.current   Current item id.
 * @param {Function} props.onSelect  (id, event) for plain left-clicks.
 * @param {boolean}  props.sticky    Sticky at ≥1024px (default true).
 * @param {string}   props.className Extra class.
 * @return {JSX.Element} Section navigation.
 */
export default function SectionNav({
    label,
    items = [],
    current,
    onSelect,
    sticky = true,
    className,
}) {
    const listRef = useRef(null);

    // Keep the active pill visible in the horizontal (narrow) layout.
    useEffect(() => {
        const active = listRef.current?.querySelector('[aria-current="true"]');
        if (active && typeof active.scrollIntoView === "function") {
            const list = listRef.current;
            if (list.scrollWidth > list.clientWidth) {
                active.scrollIntoView({ block: "nearest", inline: "nearest" });
            }
        }
    }, [current]);

    return (
        <nav
            aria-label={label}
            className={classnames("eb-section-nav", className, {
                "is-sticky": sticky,
            })}
        >
            <ul ref={listRef} className="eb-section-nav__list">
                {items.map((item) => (
                    <li key={item.id} className="eb-section-nav__item">
                        <a
                            href={item.href}
                            className="eb-section-nav__link"
                            aria-current={item.id === current ? "true" : undefined}
                            onClick={(event) => {
                                if (onSelect && isPlainClick(event)) {
                                    event.preventDefault();
                                    onSelect(item.id, event);
                                }
                            }}
                        >
                            <span className="eb-section-nav__label">{item.label}</span>
                            {item.badge && (
                                <span className="eb-section-nav__badge">{item.badge}</span>
                            )}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
