/**
 * Dashboard app shell: skip link, sidebar, and the main column.
 *
 * The notice region sits above the shell, full width under the WP admin
 * bar. Main column slot order is fixed: topBar (≤782px) → #eb-dash-main.
 * Only `children` change on a tab switch, so the notice region is never
 * remounted. #eb-dash-main stays a div: WP's #wpbody is already the main
 * landmark.
 */

/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";

/**
 * External dependencies
 */
import classnames from "classnames";

/**
 * Internal dependencies
 */
import Sidebar, { useSidebarState } from "./Sidebar";
import ShellTopBar from "./ShellTopBar";
import NoticeRegion from "./NoticeRegion";

/**
 * @param {Object}   props
 * @param {Array}    props.navigation   buildNavigation() output.
 * @param {Object}   props.badges       useNavBadges() output.
 * @param {string}   props.activeId     Current tab id.
 * @param {Function} props.onNavigate   (id) for plain left clicks.
 * @param {*}        props.topBar       Override for the mobile top bar.
 * @param {*}        props.noticeRegion Notice region (T32).
 * @param {*}        props.children     Active tab.
 * @return {JSX.Element} Shell.
 */
export default function Shell({
    navigation,
    badges,
    activeId,
    onNavigate,
    topBar = null,
    noticeRegion = null,
    children,
}) {
    const [collapsed, setCollapsed] = useSidebarState();

    return (
        <>
            {noticeRegion || <NoticeRegion />}
            <div
                className={classnames("eb-settings-container", "eb-shell", {
                    "is-collapsed": collapsed,
                })}
                data-collapsed={collapsed ? "true" : undefined}
            >
                <a className="eb-skip-link" href="#eb-dash-main">
                    {__("Skip to tab content", "essential-blocks")}
                </a>
                <Sidebar
                    navigation={navigation}
                    badges={badges}
                    activeId={activeId}
                    onNavigate={onNavigate}
                    variant="desktop"
                    collapsed={collapsed}
                    onToggleCollapsed={() => setCollapsed((value) => !value)}
                />
                <div className="eb-shell__main">
                    {topBar || (
                        <ShellTopBar
                            navigation={navigation}
                            badges={badges}
                            activeId={activeId}
                            onNavigate={onNavigate}
                        />
                    )}
                    <div id="eb-dash-main" className="eb-dash-main" tabIndex={-1}>
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
