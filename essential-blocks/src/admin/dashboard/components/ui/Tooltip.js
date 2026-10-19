/**
 * Tooltip shown on hover and keyboard focus.
 *
 * - Hoverable: the pointer can move from the trigger onto the bubble
 *   (hover is tracked on the wrapper, with a short hide delay).
 * - Dismissable: Esc hides it while visible, without moving focus.
 * - Persistent: stays until mouseleave, blur or Esc (no timeout).
 * - describe="auto" (default) links the bubble with aria-describedby only
 *   when the trigger has no aria-label/aria-labelledby of its own, so a
 *   full accessible name isn't repeated as a description.
 * - The bubble is portaled to <body> and positioned `fixed` next to the
 *   trigger, so containers with overflow (the collapsed sidebar) never
 *   clip it.
 */

/**
 * WordPress dependencies
 */
import {
    cloneElement,
    createPortal,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "@wordpress/element";
import { useInstanceId } from "@wordpress/compose";

/**
 * External dependencies
 */
import classnames from "classnames";

/**
 * Internal dependencies
 */
import { getResolvedTheme } from "../../theme";

const HIDE_DELAY = 100;
const GAP = 8;

// One shared layer for every tooltip. `.eb-dash-portal` gives it the
// dashboard tokens; theme.js keeps its data-eb-theme in sync.
let layer = null;
const getLayer = () => {
    if (!layer || !layer.isConnected) {
        layer = document.createElement("div");
        layer.className = "eb-dash-portal eb-tooltip-layer";
        document.body.appendChild(layer);
    }
    layer.setAttribute("data-eb-theme", getResolvedTheme());
    return layer;
};

/**
 * @param {Object}         props
 * @param {string}         props.text      Tooltip content.
 * @param {JSX.Element}    props.children  Focusable trigger element.
 * @param {boolean|string} props.describe  true | false | 'auto'.
 * @param {string}         props.placement 'top' | 'right'.
 * @param {boolean}        props.disabled  Never show the bubble.
 * @return {JSX.Element} Trigger with tooltip.
 */
export default function Tooltip({
    text,
    children,
    describe = "auto",
    placement = "top",
    disabled = false,
}) {
    const id = `eb-tooltip-${useInstanceId(Tooltip)}`;
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState(null);
    const hideTimer = useRef(null);
    const wrapRef = useRef(null);

    const show = () => {
        window.clearTimeout(hideTimer.current);
        setVisible(true);
    };
    const hide = () => {
        window.clearTimeout(hideTimer.current);
        setVisible(false);
    };
    const hideSoon = () => {
        window.clearTimeout(hideTimer.current);
        hideTimer.current = window.setTimeout(() => setVisible(false), HIDE_DELAY);
    };

    // Esc anywhere hides a visible tooltip (no stopPropagation, so an open
    // modal still closes on the same key).
    useEffect(() => {
        if (!visible) {
            return undefined;
        }
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                hide();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [visible]);

    useEffect(() => () => window.clearTimeout(hideTimer.current), []);

    // Anchor point next to the trigger, in viewport coordinates.
    const place = useCallback(() => {
        const rect = wrapRef.current?.getBoundingClientRect();
        if (!rect) {
            return;
        }
        // In the sidebar rail, start past the sidebar's edge, not the link's.
        const edge =
            wrapRef.current.closest(".eb-sidebar")?.getBoundingClientRect().right ?? rect.right;
        setPosition(
            placement === "right"
                ? { top: rect.top + rect.height / 2, left: Math.max(rect.right, edge) + GAP }
                : { top: rect.top - GAP, left: rect.left + rect.width / 2 }
        );
    }, [placement]);

    const isShown = visible && !disabled;

    useLayoutEffect(() => {
        if (!isShown) {
            return undefined;
        }
        place();
        window.addEventListener("scroll", place, true);
        window.addEventListener("resize", place);
        return () => {
            window.removeEventListener("scroll", place, true);
            window.removeEventListener("resize", place);
        };
    }, [isShown, place]);

    const chain = (handler, own) => (event) => {
        own(event);
        handler?.(event);
    };
    const { props } = children;

    const hasOwnName = !!(props["aria-label"] || props["aria-labelledby"]);
    const shouldDescribe = describe === "auto" ? !hasOwnName : !!describe;

    const triggerProps = {
        onFocus: chain(props.onFocus, show),
        onBlur: chain(props.onBlur, hide),
    };
    if (shouldDescribe) {
        triggerProps["aria-describedby"] = props["aria-describedby"]
            ? `${props["aria-describedby"]} ${id}`
            : id;
    }

    const bubble = (
        <span
            id={id}
            role="tooltip"
            className={classnames("eb-tooltip", `eb-tooltip--${placement}`)}
            style={position ? { top: position.top, left: position.left } : undefined}
            data-visible={(isShown && position) || undefined}
            aria-hidden={describe === false ? "true" : undefined}
            onMouseEnter={show}
            onMouseLeave={hideSoon}
        >
            {text}
        </span>
    );

    return (
        <span
            ref={wrapRef}
            className="eb-tooltip-wrap"
            onMouseEnter={show}
            onMouseLeave={hideSoon}
        >
            {cloneElement(children, triggerProps)}
            {typeof document !== "undefined" ? createPortal(bubble, getLayer()) : bubble}
        </span>
    );
}
