const DEFAULT_TAB = "general";

// Tab-scoped params: dropped on every tab switch.
const SCOPED_PARAMS = ["section", "focus"];
const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;

// WP's own admin title (e.g. "Essential Blocks ‹ Site — WordPress"),
// captured once so a filtered admin_title is respected.
const BASE_TITLE = typeof document !== "undefined" ? document.title : "";

const safeId = (value) => (value && SAFE_ID.test(value) ? value : null);

/**
 * URL for a dashboard tab. Keeps any other query params and always
 * includes page + tab, so the link also works when opened in a new tab.
 * `section` / `focus` are tab-scoped: removed, then set only if passed.
 *
 * @param {string} tab            Tab id.
 * @param {Object} [opts]         Optional params.
 * @param {string} [opts.section] Section id within the tab.
 * @param {string} [opts.focus]   Element id to focus once.
 * @return {string} Relative admin URL.
 */
export const getTabUrl = (tab, { section, focus } = {}) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", "essential-blocks");
    params.set("tab", tab);
    SCOPED_PARAMS.forEach((name) => params.delete(name));
    if (safeId(section)) {
        params.set("section", section);
    }
    if (safeId(focus)) {
        params.set("focus", focus);
    }
    return `${window.location.pathname}?${params.toString()}`;
};

/**
 * Tab ids are a public contract (deep links from notices, docs and Pro).
 * Unknown ids fall back to the Dashboard tab instead of rendering nothing.
 *
 * @param {Array<{id: string}>} menus Registered tabs.
 * @return {string} Active tab id.
 */
export const getTabFromUrl = (menus) => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    return (menus || []).some((menu) => menu && menu.id === tab) ? tab : DEFAULT_TAB;
};

/**
 * Current route params. `section` / `focus` must be simple ids (anything
 * else is ignored, so they can't be used as selectors).
 *
 * @return {{tab: (string|null), section: (string|null), focus: (string|null)}} Params.
 */
export const getRouteParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
        tab: params.get("tab"),
        section: safeId(params.get("section")),
        focus: safeId(params.get("focus")),
    };
};

/**
 * Set or remove `section` without a new history entry.
 *
 * @param {string|null} section Section id, or null to remove.
 */
export const setSectionParam = (section) => {
    const params = new URLSearchParams(window.location.search);
    if (safeId(section)) {
        params.set("section", section);
    } else {
        params.delete("section");
    }
    window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}?${params.toString()}`
    );
};

/**
 * Read `focus` once and remove it from the URL (one-shot).
 *
 * @return {string|null} Element id.
 */
export const consumeFocusParam = () => {
    const { focus } = getRouteParams();
    if (new URLSearchParams(window.location.search).has("focus")) {
        const params = new URLSearchParams(window.location.search);
        params.delete("focus");
        window.history.replaceState(
            window.history.state,
            "",
            `${window.location.pathname}?${params.toString()}`
        );
    }
    return focus;
};

/**
 * Switch tabs. The single navigation path: pushes the URL and fires
 * popstate, which the app shell listens to.
 *
 * @param {string} tab    Tab id.
 * @param {Object} [opts] { section, focus }.
 */
export const navigateToTab = (tab, opts = {}) => {
    const url = getTabUrl(tab, opts);
    const current = `${window.location.pathname}${window.location.search}`;
    if (url !== current) {
        window.history.pushState({ ebTab: tab }, "", url);
        window.dispatchEvent(new PopStateEvent("popstate", { state: { ebTab: tab } }));
    }
    window.scrollTo({ top: 0 });
};

/**
 * Click handler for in-app tab links: plain left-clicks switch in place,
 * modified clicks (new tab/window) keep the browser default.
 *
 * @param {string} tab    Tab id.
 * @param {Object} [opts] { section, focus }.
 * @return {Function} onClick handler.
 */
export const onTabLinkClick = (tab, opts) => (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
    }
    event.preventDefault();
    navigateToTab(tab, opts);
};

/**
 * Document title for the current page: "<Page> ‹ <WP admin title>".
 *
 * @param {string} label Page label.
 */
export const setDocumentTitle = (label) => {
    document.title = label ? `${label} ‹ ${BASE_TITLE}` : BASE_TITLE;
};

/**
 * Move focus to the page h1 (or the tab container), retrying for a few
 * frames while the tab renders.
 *
 * @param {number} [tries] Remaining frames.
 */
export const focusPageHeading = (tries = 10) => {
    const main = document.getElementById("eb-dash-main");
    const heading = main?.querySelector("h1");
    if (heading) {
        if (!heading.hasAttribute("tabindex")) {
            heading.setAttribute("tabindex", "-1");
        }
        heading.focus({ preventScroll: true });
        return;
    }
    if (tries > 0) {
        window.requestAnimationFrame(() => focusPageHeading(tries - 1));
        return;
    }
    main?.focus({ preventScroll: true });
};

/**
 * Handle a one-shot `&focus=<id>`: scroll to the element, focus it and
 * flash it briefly. Retries for up to ~3s while the tab loads its data.
 *
 * @param {string} id      Element id.
 * @param {number} [tries] Remaining frames.
 * @return {boolean} Whether a target was scheduled/handled.
 */
export const focusTarget = (id, tries = 180) => {
    const main = document.getElementById("eb-dash-main");
    const target = id && main ? document.getElementById(id) : null;
    if (target && main.contains(target)) {
        target.scrollIntoView({ block: "center" });
        if (target.tabIndex < 0 && !target.hasAttribute("tabindex")) {
            target.setAttribute("tabindex", "-1");
        }
        target.focus({ preventScroll: true });
        target.classList.add("eb-focus-flash");
        window.setTimeout(() => target.classList.remove("eb-focus-flash"), 1500);
        // The tab may re-render once its data arrives and replace the node:
        // if so, focus the new one.
        window.setTimeout(() => {
            if (!target.isConnected && tries > 0) {
                focusTarget(id, tries - 1);
            }
        }, 400);
        return true;
    }
    if (id && tries > 0) {
        window.requestAnimationFrame(() => focusTarget(id, tries - 1));
    }
    return false;
};
