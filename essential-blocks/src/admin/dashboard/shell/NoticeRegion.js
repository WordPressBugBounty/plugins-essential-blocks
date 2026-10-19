/**
 * Notice region on the EB dashboard.
 *
 * WP prints admin notices at the top of #wpbody-content and common.js moves
 * them after the first `.wp-header-end` marker (views/admin.php puts one in
 * the EB wrapper). This region adopts the marker and Essential Blocks' own
 * notices, so they render inside the main column above the page heading,
 * whichever of React or common.js runs first. Notices from other plugins and
 * core are not shown on the EB dashboard: they stay where WP put them and
 * are hidden by CSS (scss/_shell.scss). React renders no children here and
 * never remounts it, so adopted nodes (and their dismiss handlers) are
 * untouched.
 */

/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useLayoutEffect, useRef } from "@wordpress/element";

const NOTICE_SELECTOR = "div.notice, div.updated, div.error";

// Essential Blocks (free + Pro) notices; keep in sync with scss/_shell.scss.
const EB_NOTICE_SELECTOR = [
    "[id^='wpnotice-essential_blocks']",
    ".eb-notice",
    ".wpdeveloper-licensing-notice",
    "[class*='essential-blocks']",
].join(", ");

const isEbNotice = (el) =>
    el.matches(EB_NOTICE_SELECTOR) || !!el.querySelector(".eb-optin");

const isMovable = (el) =>
    el.matches(NOTICE_SELECTOR) &&
    isEbNotice(el) &&
    !el.classList.contains("inline") &&
    !el.classList.contains("below-h2");

/**
 * Move notices (and EB's promo banner) into the region, keeping order.
 *
 * @param {HTMLElement} region Region element.
 */
const adopt = (region) => {
    if (!region) {
        return;
    }
    const wrap = document.querySelector(".eb-settings-wrap");
    const body = document.getElementById("wpbody-content");

    const promo = document.getElementById("eb-admin-promotion-message");
    if (promo && !region.contains(promo)) {
        region.prepend(promo);
    }

    let marker = region.querySelector(".wp-header-end");
    if (!marker) {
        marker = wrap?.querySelector(":scope > .wp-header-end");
        if (marker) {
            region.appendChild(marker);
        }
    }

    const candidates = [
        // Moved by common.js next to the marker's original place.
        ...(wrap ? Array.from(wrap.children) : []),
        // Not moved yet (common.js hasn't run).
        ...(body ? Array.from(body.children) : []),
    ].filter((el) => el !== region && !region.contains(el) && isMovable(el));

    candidates.forEach((el) => region.appendChild(el));
};

/**
 * @return {JSX.Element} Notice region.
 */
export default function NoticeRegion() {
    const ref = useRef(null);

    useLayoutEffect(() => {
        adopt(ref.current);

        // Safety net for notices added just after load (e.g. by late
        // scripts) directly to #wpbody-content.
        const body = document.getElementById("wpbody-content");
        if (!body || typeof window.MutationObserver !== "function") {
            return undefined;
        }
        const observer = new window.MutationObserver(() => adopt(ref.current));
        observer.observe(body, { childList: true });
        const stop = window.setTimeout(() => observer.disconnect(), 5000);
        return () => {
            window.clearTimeout(stop);
            observer.disconnect();
        };
    }, []);

    return (
        <div
            ref={ref}
            className="eb-notice-region"
            role="region"
            aria-label={__("Notifications", "essential-blocks")}
        />
    );
}
