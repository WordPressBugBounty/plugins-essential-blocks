/**
 * Category chips as in-page navigation: a chip scrolls its section to just
 * below the sticky toolbar, and the selected chip follows the section in
 * view while the user scrolls. Nothing is filtered or hidden.
 */
import { useCallback, useEffect, useRef, useState } from "@wordpress/element";

// Lead past the toolbar before the next section counts as current.
const SPY_SLACK = 8;
// A programmatic scroll ends this long after its last scroll event.
const SETTLE_MS = 150;

const prefersReducedMotion = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/**
 * @param {string[]} keys     Rendered section keys, in page order.
 * @param {string}   idPrefix Section heading id prefix (heading id = prefix + key).
 * @return {{toolbarRef: Object, active: string, goTo: Function}} Toolbar ref, current key ("all" above the first section) and chip handler.
 */
export default function useSectionNav(keys, idPrefix) {
    const toolbarRef = useRef(null);
    const keysRef = useRef(keys);
    const lockTimer = useRef(null);
    const [active, setActive] = useState("all");

    keysRef.current = keys;
    const keysSignature = keys.join();

    const heading = useCallback((key) => document.getElementById(`${idPrefix}${key}`), [idPrefix]);

    // Distance from the viewport top to where a section should start: the
    // toolbar's stuck position plus its height and bottom margin.
    const offset = useCallback(() => {
        const toolbar = toolbarRef.current;
        if (!toolbar) {
            return 0;
        }
        const style = window.getComputedStyle(toolbar);
        let top = parseFloat(style.top) || 0;

        // On desktop the sticky page header compacts as soon as the page
        // scrolls, which raises the toolbar's stuck position. Aim for that
        // compact state even when the click happens at rest (PageHeader.js).
        const wrap = toolbar.closest(".eb-settings-wrap");
        const header = wrap?.querySelector(".eb-dash-page-header");
        if (header && window.getComputedStyle(header).position === "sticky") {
            const restHeight = parseFloat(wrap.style.getPropertyValue("--eb-page-header-h"));
            const stuckHeight = parseFloat(wrap.style.getPropertyValue("--eb-page-header-stuck-h"));
            if (!Number.isNaN(restHeight) && !Number.isNaN(stuckHeight)) {
                top += stuckHeight - restHeight;
            }
        }

        return top + toolbar.offsetHeight + (parseFloat(style.marginBottom) || 0);
    }, []);

    const scrollTargetOf = useCallback(
        (key) => {
            const section = heading(key)?.closest("section");
            return section ? window.scrollY + section.getBoundingClientRect().top - offset() : null;
        },
        [heading, offset]
    );

    const current = useCallback(() => {
        const list = keysRef.current;
        const first = list.length ? scrollTargetOf(list[0]) : null;
        if (first === null || window.scrollY < first - 1) {
            return "all";
        }
        const line = offset() + SPY_SLACK;
        let found = list[0];
        list.forEach((key) => {
            const section = heading(key)?.closest("section");
            if (section && section.getBoundingClientRect().top <= line) {
                found = key;
            }
        });
        return found;
    }, [heading, offset, scrollTargetOf]);

    // While a chip's scroll runs, keep its chip selected instead of
    // stepping through every section passed on the way.
    const settle = useCallback(() => {
        window.clearTimeout(lockTimer.current);
        lockTimer.current = window.setTimeout(() => {
            lockTimer.current = null;
        }, SETTLE_MS);
    }, []);

    useEffect(() => {
        let frame = 0;
        const onScroll = () => {
            if (lockTimer.current) {
                settle();
                return;
            }
            if (!frame) {
                frame = window.requestAnimationFrame(() => {
                    frame = 0;
                    setActive(current());
                });
            }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            window.cancelAnimationFrame(frame);
            window.clearTimeout(lockTimer.current);
        };
    }, [current, settle]);

    // Search and status filters add or remove sections.
    useEffect(() => {
        if (!lockTimer.current) {
            setActive(current());
        }
    }, [keysSignature, current]);

    const goTo = useCallback(
        (key) => {
            if (key === active) {
                return;
            }
            const target = key === "all" ? 0 : scrollTargetOf(key);
            if (target === null) {
                return;
            }
            setActive(key);

            const max = document.documentElement.scrollHeight - window.innerHeight;
            const top = Math.max(0, Math.min(target, max));
            if (Math.abs(top - window.scrollY) >= 1) {
                settle();
                window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
            }
            // Like an anchor link: keyboard and screen reader users continue
            // from the section they jumped to.
            if (key !== "all") {
                heading(key)?.focus({ preventScroll: true });
            }
        },
        [active, heading, scrollTargetOf, settle]
    );

    return { toolbarRef, active, goTo };
}
