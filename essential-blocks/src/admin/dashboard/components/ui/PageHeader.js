/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { flushSync, useEffect, useRef, useState } from "@wordpress/element";

/**
 * External dependencies
 */
import classnames from "classnames";

/**
 * Internal dependencies
 */
import ThemeSwitcher from "./ThemeSwitcher";

/**
 * Page title + description + optional actions, shared by every tab.
 * The light/dark toggle sits top-right on the title row.
 * The h1 is programmatically focusable (focus moves to it on tab switch).
 *
 * @param {Object}  props
 * @param {string}  props.title       Page title.
 * @param {string=} props.description Short description under the title.
 * @param {*=}      props.actions     Action buttons, right-aligned.
 * @param {string=} props.titleId     id for aria-labelledby on the page.
 * @param {Object=} props.docLink     { href, label } external doc link.
 * @return {JSX.Element} Page header.
 */
export default function PageHeader({ title, description, actions, titleId, docLink }) {
    const hasActions = !!(actions || docLink);
    const headerRef = useRef(null);
    const restRef = useRef({ height: 0, marginBottom: 0 });
    const [isStuck, setIsStuck] = useState(false);

    // The header sticks under the admin bar on desktop (scss/_common.scss)
    // and turns into a compact bar once pinned. Publish its height so other
    // sticky bars and in-page jumps sit below it.
    useEffect(() => {
        const header = headerRef.current;
        const wrap = header?.closest(".eb-settings-wrap");
        if (!header || !wrap) {
            return undefined;
        }

        // Full size, used to keep the page from jumping when it compacts.
        const recordRestHeight = () => {
            if (!header.classList.contains("is-stuck")) {
                restRef.current = {
                    height: header.offsetHeight,
                    marginBottom: parseFloat(window.getComputedStyle(header).marginBottom) || 0,
                };
            }
        };

        // Compact height, published so in-page jumps can aim for where the
        // toolbar sits once the header has compacted. The class is added and
        // removed in one task, so the compact bar is never painted here.
        let stuckHeight = 0;
        const recordStuckHeight = () => {
            const wasStuck = header.classList.contains("is-stuck");
            if (!wasStuck) {
                header.classList.add("is-stuck");
            }
            stuckHeight = header.offsetHeight;
            if (!wasStuck) {
                header.classList.remove("is-stuck");
            }
            wrap.style.setProperty("--eb-page-header-stuck-h", `${stuckHeight}px`);
        };

        // The compact bar is shorter than the full header; its bottom margin
        // takes up the difference so the content below stays put. That margin
        // collapses with the next element's top margin, so aim for the same
        // collapsed gap as at rest plus the lost height. Set from the recorded
        // heights before the class goes on: measuring after it would lay out
        // the compact bar without the margin once, and Chrome's scroll
        // anchoring answers that shift by scrolling the page (at the very top
        // it snaps back to 0, so the header pins and unpins on every wheel).
        const setStuckMargin = () => {
            const { height, marginBottom } = restRef.current;
            const shrink = Math.max(0, height - stuckHeight);
            const next = header.nextElementSibling;
            const nextMargin = next ? parseFloat(window.getComputedStyle(next).marginTop) || 0 : 0;
            const collapse = (a, b) => Math.max(a, b, 0) + Math.min(a, b, 0);
            const margin = collapse(marginBottom, nextMargin) + shrink - Math.min(nextMargin, 0);
            header.style.setProperty("--eb-page-header-stuck-mb", `${margin}px`);
        };

        // Sticky offset (NaN when the header isn't sticky, e.g. ≤782px).
        // Read on resize only, so scroll frames don't recompute styles.
        let stickyTop = NaN;
        const recordStickyTop = () => {
            const style = window.getComputedStyle(header);
            stickyTop = style.position === "sticky" ? parseFloat(style.top) : NaN;
        };

        // At rest the header already sits exactly at its sticky offset,
        // so it only counts as pinned once the page has scrolled.
        const isPinned = () =>
            !Number.isNaN(stickyTop) &&
            window.scrollY > 0 &&
            header.getBoundingClientRect().top <= stickyTop + 0.5;

        let frame = 0;
        let stuck = false;
        const update = () => {
            frame = 0;
            const next = isPinned();
            if (next === stuck) {
                return;
            }
            stuck = next;
            if (next) {
                setStuckMargin();
            }
            // Commit before this frame paints. A batched update lands a frame
            // or more later, and with notices above the header the pin point
            // is mid-scroll: the full header shows pinned, or the compact bar
            // shows unpinned, then snaps (the faster the scroll, the farther).
            flushSync(() => setIsStuck(next));
            if (!next) {
                header.style.removeProperty("--eb-page-header-stuck-mb");
            }
        };
        const schedule = () => {
            if (!frame) {
                frame = window.requestAnimationFrame(update);
            }
        };
        const onResize = () => {
            recordRestHeight();
            recordStickyTop();
            schedule();
        };

        const observer =
            typeof window.ResizeObserver === "function"
                ? new window.ResizeObserver(() => {
                      recordRestHeight();
                      recordStuckHeight();
                      wrap.style.setProperty("--eb-page-header-h", `${header.offsetHeight}px`);
                      schedule();
                  })
                : null;
        observer?.observe(header);
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", onResize);
        recordRestHeight();
        recordStickyTop();
        recordStuckHeight();
        // flushSync can't run inside an effect; on mount a plain update is enough.
        stuck = isPinned();
        if (stuck) {
            setStuckMargin();
        }
        setIsStuck(stuck);

        return () => {
            observer?.disconnect();
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", onResize);
            if (frame) {
                window.cancelAnimationFrame(frame);
            }
            wrap.style.removeProperty("--eb-page-header-h");
            wrap.style.removeProperty("--eb-page-header-stuck-h");
            header.style.removeProperty("--eb-page-header-stuck-mb");
        };
    }, []);

    // Grid areas: desktop "title actions theme / desc", mobile
    // "title theme / desc / actions" (scss/_common.scss).
    return (
        <div
            ref={headerRef}
            className={classnames("eb-dash-page-header", {
                "has-actions": hasActions,
                "is-stuck": isStuck,
            })}
        >
            <h1 className="eb-dash-page-header__title" id={titleId} tabIndex={-1}>
                {title}
            </h1>
            {hasActions && (
                <div className="eb-dash-page-header__actions">
                    {actions}
                    {docLink && (
                        <a
                            className="eb-dash-page-header__doclink"
                            href={docLink.href}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {docLink.label}
                            <span className="eb-visually-hidden">
                                {__("(opens in a new tab)", "essential-blocks")}
                            </span>
                        </a>
                    )}
                </div>
            )}
            <div className="eb-dash-page-header__theme">
                <ThemeSwitcher />
            </div>
            {description && (
                <p className="eb-dash-page-header__description">{description}</p>
            )}
        </div>
    );
}
