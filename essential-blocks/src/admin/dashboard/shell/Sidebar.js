/**
 * Dashboard sidebar navigation (desktop + drawer variants).
 *
 * Links are real `?page=essential-blocks&tab=` URLs: a plain left click
 * switches tabs in place, modified clicks open natively. On desktop the
 * sidebar can collapse to a 64px icon rail (stored per browser in
 * localStorage['eb-sidebar']); at 783–1023px it is always a rail (CSS).
 */

/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useCallback, useEffect, useState } from "@wordpress/element";

/**
 * External dependencies
 */
import classnames from "classnames";

/**
 * Internal dependencies
 */
import eblogo from "../../../assets/images/eb-logo.svg";
import EBLogoWordmark from "../icons/EBLogoWordmark";
import Tooltip from "../components/ui/Tooltip";
import { onTabLinkClick } from "../routing";

const STORAGE_KEY = "eb-sidebar";
const WRAPPER_SELECTOR = ".eb-settings-wrap";

// Fallback when localStorage is unavailable: keep the choice for this page.
let memoryState = null;

const readCollapsed = () => {
    try {
        return window.localStorage.getItem(STORAGE_KEY) === "collapsed";
    } catch (e) {
        return memoryState === "collapsed";
    }
};

const writeCollapsed = (collapsed) => {
    const value = collapsed ? "collapsed" : "expanded";
    try {
        window.localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
        memoryState = value;
    }
};

const stampWrapper = (collapsed) => {
    document
        .querySelectorAll(WRAPPER_SELECTOR)
        .forEach((el) =>
            el.setAttribute("data-eb-sidebar", collapsed ? "collapsed" : "expanded")
        );
};

/**
 * Collapsed state of the desktop sidebar, persisted per browser and kept
 * in sync across open dashboard tabs.
 *
 * @return {Array} [collapsed, setCollapsed]
 */
export function useSidebarState() {
    const [collapsed, setCollapsedState] = useState(readCollapsed);

    useEffect(() => {
        stampWrapper(collapsed);
    }, [collapsed]);

    useEffect(() => {
        const onStorage = (event) => {
            if (event.key === STORAGE_KEY) {
                setCollapsedState(readCollapsed());
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const setCollapsed = useCallback((next) => {
        setCollapsedState((prev) => {
            const value = typeof next === "function" ? next(prev) : next;
            writeCollapsed(value);
            return value;
        });
    }, []);

    return [collapsed, setCollapsed];
}

// 783–1023px: the sidebar is always a rail (CSS eb-only-rail).
const RAIL_QUERY = "(min-width: 783px) and (max-width: 1023px)";

const useForcedRail = () => {
    const [forced, setForced] = useState(
        () => typeof window.matchMedia === "function" && window.matchMedia(RAIL_QUERY).matches
    );
    useEffect(() => {
        if (typeof window.matchMedia !== "function") {
            return undefined;
        }
        const query = window.matchMedia(RAIL_QUERY);
        const onChange = () => setForced(query.matches);
        if (typeof query.addEventListener === "function") {
            query.addEventListener("change", onChange);
            return () => query.removeEventListener("change", onChange);
        }
        query.addListener(onChange);
        return () => query.removeListener(onChange);
    }, []);
    return forced;
};

const ChevronIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="m15 18-6-6 6-6" />
    </svg>
);

// Visible badge only; its screen-reader text is part of the link label.
const NavBadge = ({ badge }) => {
    if (!badge) {
        return null;
    }
    if (badge.kind === "count") {
        return (
            <span className="eb-sidebar__badge eb-sidebar__badge--count" aria-hidden="true">
                {badge.text}
            </span>
        );
    }
    return (
        <span className="eb-sidebar__badge eb-sidebar__badge--dot" aria-hidden="true">
            <span className="eb-sidebar__dot" />
            <span className="eb-sidebar__badge-label">{badge.label}</span>
        </span>
    );
};

/**
 * @param {Object}   props
 * @param {Array}    props.navigation        buildNavigation() output.
 * @param {Object}   props.badges            useNavBadges() output.
 * @param {string}   props.activeId          Current tab id.
 * @param {Function} props.onNavigate        (id) for plain left clicks.
 * @param {string}   props.variant           'desktop' | 'drawer'.
 * @param {boolean}  props.collapsed         Rail state (desktop only).
 * @param {Function} props.onToggleCollapsed Toggle handler (desktop only).
 * @param {Object}   props.activeLinkRef     Ref set on the active link (drawer focus).
 * @return {JSX.Element} Sidebar.
 */
export default function Sidebar({
    navigation = [],
    badges = {},
    activeId,
    onNavigate,
    variant = "desktop",
    collapsed = false,
    onToggleCollapsed,
    activeLinkRef,
}) {
    const isDesktop = variant === "desktop";
    const isPro = window.EssentialBlocksLocalize?.is_pro_active === "true";
    const proVersion = isPro && window.EssentialBlocksProLocalize?.eb_pro_version;
    const navId = isDesktop ? "eb-sidebar-nav" : "eb-drawer-nav";
    const forcedRail = useForcedRail();
    // Labels are hidden only in the rail: that's when the tooltips help.
    const isRail = isDesktop && (collapsed || forcedRail);

    const linkClick = (id) => (event) => {
        if (
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
        ) {
            return;
        }
        if (onNavigate) {
            event.preventDefault();
            onNavigate(id);
            return;
        }
        onTabLinkClick(id)(event);
    };

    const renderLink = (item) => {
        const isActive = item.id === activeId;
        const link = (
            <a
                href={item.href}
                ref={isActive && activeLinkRef ? activeLinkRef : undefined}
                className={classnames("eb-sidebar__link", { "is-active": isActive })}
                aria-current={isActive ? "page" : undefined}
                onClick={linkClick(item.id)}
            >
                <span className="eb-sidebar__icon" aria-hidden="true">
                    {item.hasIcon ? (
                        item.icon
                    ) : (
                        <span className="eb-sidebar__initial">
                            {item.label.charAt(0).toUpperCase()}
                        </span>
                    )}
                </span>
                <span className="eb-sidebar__label">
                    {item.label}
                    {badges[item.id] && (
                        <span className="eb-visually-hidden">{`, ${badges[item.id].srText}`}</span>
                    )}
                </span>
                <NavBadge badge={badges[item.id]} />
            </a>
        );

        return (
            <li key={item.id} className="eb-sidebar__item">
                {isDesktop ? (
                    // Visual hint for the rail only; the link already has its name.
                    <Tooltip
                        text={item.label}
                        placement="right"
                        describe={false}
                        disabled={!isRail}
                    >
                        {link}
                    </Tooltip>
                ) : (
                    link
                )}
            </li>
        );
    };

    return (
        <aside
            className={classnames("eb-sidebar", `eb-sidebar--${variant}`, {
                "is-collapsed": isDesktop && collapsed,
            })}
            aria-label={__("Essential Blocks", "essential-blocks")}
            data-collapsed={isDesktop && collapsed ? "true" : undefined}
        >
            {isDesktop && (
                <div className="eb-sidebar__brand">
                    {/* Full wordmark when expanded, the mark alone on the rail (CSS). */}
                    <img src={eblogo} alt="" className="eb-sidebar__logo" />
                    <EBLogoWordmark className="eb-sidebar__wordmark" />
                    <span className="eb-sidebar__brand-text">
                        {__("Essential Blocks", "essential-blocks")}
                    </span>
                    {/* Plan badge only on the free plan. */}
                    {!isPro && (
                        <span className="eb-sidebar__plan">
                            {__("Free", "essential-blocks")}
                        </span>
                    )}
                    {onToggleCollapsed && (
                        <button
                            type="button"
                            className="eb-sidebar__collapse"
                            aria-controls={navId}
                            aria-expanded={!collapsed}
                            aria-label={
                                collapsed
                                    ? __("Expand sidebar", "essential-blocks")
                                    : __("Collapse sidebar", "essential-blocks")
                            }
                            onClick={onToggleCollapsed}
                        >
                            <ChevronIcon />
                        </button>
                    )}
                </div>
            )}

            <nav
                id={navId}
                className="eb-sidebar__nav"
                aria-label={__("Essential Blocks dashboard", "essential-blocks")}
            >
                {navigation.map((group) => {
                    const labelId = `${navId}-group-${group.id}`;
                    return (
                        <div key={group.id} className="eb-sidebar__group">
                            {group.label && (
                                <p id={labelId} className="eb-sidebar__group-label">
                                    {group.label}
                                </p>
                            )}
                            <ul
                                className="eb-sidebar__list"
                                aria-labelledby={group.label ? labelId : undefined}
                            >
                                {group.items.map(renderLink)}
                            </ul>
                        </div>
                    );
                })}
            </nav>

            <div className="eb-sidebar__footer">
                <div className="eb-sidebar__versions">
                    <div>
                        {__("Free Version: ", "essential-blocks")}
                        <span>{window.EssentialBlocksLocalize?.eb_version}</span>
                    </div>
                    {proVersion && (
                        <div>
                            {__("Pro Version: ", "essential-blocks")}
                            <span>{proVersion}</span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
