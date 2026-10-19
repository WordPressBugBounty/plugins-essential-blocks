/**
 * Mobile top bar (≤782px): Menu button + current page title, opening the
 * sidebar navigation in an off-canvas drawer. Rendered always and hidden
 * above 782px with CSS.
 */

/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useEffect, useRef, useState } from "@wordpress/element";

/**
 * Internal dependencies
 */
import Drawer from "../components/ui/Drawer";
import Sidebar from "./Sidebar";
import { findNavItem } from "../navigation/registry";

const MenuIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
        <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

/**
 * @param {Object}   props
 * @param {Array}    props.navigation buildNavigation() output.
 * @param {Object}   props.badges     useNavBadges() output.
 * @param {string}   props.activeId   Current tab id.
 * @param {Function} props.onNavigate (id) tab switch.
 * @return {JSX.Element} Top bar + drawer.
 */
export default function ShellTopBar({ navigation, badges, activeId, onNavigate }) {
    const [open, setOpen] = useState(false);
    const activeLinkRef = useRef(null);
    const current = findNavItem(navigation, activeId);

    // Close if the viewport grows past the mobile breakpoint while open.
    useEffect(() => {
        if (!open || typeof window.matchMedia !== "function") {
            return undefined;
        }
        const query = window.matchMedia("(max-width: 782px)");
        const onChange = () => {
            if (!query.matches) {
                setOpen(false);
            }
        };
        if (typeof query.addEventListener === "function") {
            query.addEventListener("change", onChange);
            return () => query.removeEventListener("change", onChange);
        }
        query.addListener(onChange);
        return () => query.removeListener(onChange);
    }, [open]);

    return (
        <>
            <div className="eb-topbar">
                <button
                    type="button"
                    className="eb-topbar__menu"
                    aria-expanded={open}
                    aria-controls="eb-nav-drawer"
                    aria-label={__("Open menu", "essential-blocks")}
                    onClick={() => setOpen(true)}
                >
                    <MenuIcon />
                </button>
                <span className="eb-topbar__title" aria-hidden="true">
                    {current?.label}
                </span>
            </div>
            <Drawer
                id="eb-nav-drawer"
                isOpen={open}
                onClose={() => setOpen(false)}
                title={__("Essential Blocks", "essential-blocks")}
                width="min(320px, 86vw)"
                initialFocusRef={activeLinkRef}
                className="eb-nav-drawer"
            >
                <Sidebar
                    navigation={navigation}
                    badges={badges}
                    activeId={activeId}
                    variant="drawer"
                    activeLinkRef={activeLinkRef}
                    onNavigate={(id) => {
                        onNavigate(id);
                        setOpen(false);
                    }}
                />
            </Drawer>
        </>
    );
}
