/**
 * @deprecated Since the dashboard shell (T28) the header's navigation,
 * logo, versions and theme switcher live in the sidebar (shell/Sidebar.js).
 * Kept as a thin adapter so any stray import keeps working.
 */
/**
 * Internal dependencies
 */
import Sidebar from "../shell/Sidebar";
import { buildNavigation } from "../navigation/registry";

/**
 * @param {Object}   props
 * @param {Array}    props.menuList       Tab list.
 * @param {string}   props.tabState       Active tab id.
 * @param {Function} props.handleNavClick Tab switch handler.
 * @return {JSX.Element} Sidebar.
 */
export default function Header({ menuList, tabState, handleNavClick }) {
    return (
        <Sidebar
            navigation={buildNavigation(menuList)}
            badges={{}}
            activeId={tabState}
            onNavigate={handleNavClick}
        />
    );
}
