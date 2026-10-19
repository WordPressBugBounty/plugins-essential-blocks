/**
 * WordPress dependencies
 */
import { createRoot, useEffect, useMemo } from "@wordpress/element"
/**
 * External dependencies
 */
import React, { useRef, useState } from "react";

/**
 * Internal dependencies
 */
import Shell from "./shell/Shell";
import { buildNavigation, findNavItem } from "./navigation/registry";
import useNavBadges from "./navigation/useNavBadges";
import getTabMenus from './menuList';
import { initTheme } from "./theme";
import {
    getTabFromUrl,
    navigateToTab,
    setDocumentTitle,
    focusPageHeading,
    consumeFocusParam,
    focusTarget,
} from "./routing";
import { SettingsProvider } from "./context/SettingsContext";
import { ToastProvider } from "./context/ToastContext";
import { BlocksProvider } from "./components/blocks/BlocksContext";
import { ConfirmProvider } from "./components/ui/ConfirmDialog";

import "./scss/index.scss";

/**
 * Shell + active tab. Inside the providers, so sidebar badges read the same
 * blocks/settings state as the tabs.
 *
 * @param {Object}   props
 * @param {Array}    props.menuList   Filtered tab list.
 * @param {string}   props.tabState   Active tab id.
 * @param {Function} props.onNavigate Tab switch handler.
 * @return {JSX.Element} App shell.
 */
const AppShell = ({ menuList, tabState, onNavigate }) => {
    const navigation = useMemo(() => buildNavigation(menuList), [menuList]);
    const badges = useNavBadges();
    const firstRender = useRef(true);

    // Title on every tab; focus moves to the new page h1 after a switch
    // (not on page load); a one-shot &focus= target wins over the h1.
    useEffect(() => {
        setDocumentTitle(findNavItem(navigation, tabState)?.label);
        const focusId = consumeFocusParam();
        const isFirst = firstRender.current;
        firstRender.current = false;
        if (focusId) {
            focusTarget(focusId);
            return;
        }
        if (!isFirst) {
            focusPageHeading();
        }
    }, [tabState, navigation]);

    return (
        <Shell
            navigation={navigation}
            badges={badges}
            activeId={tabState}
            onNavigate={onNavigate}
        >
            {menuList.map((menu) => (
                <React.Fragment key={menu.id}>
                    {tabState === menu.id && menu.comp}
                </React.Fragment>
            ))}
        </Shell>
    );
};

const EssentialAdmin = () => {
    // Drop malformed filter entries (null, missing id) so they can't crash the shell.
    const menuList = useMemo(
        () =>
            (getTabMenus() || []).filter(
                (menu) => menu && typeof menu === "object" && typeof menu.id === "string"
            ),
        []
    );
    const [tabState, setTabState] = useState(() => getTabFromUrl(menuList));

    useEffect(() => {
        const onPopState = () => setTabState(getTabFromUrl(menuList));
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, [menuList]);

    // Single navigation path (pushState + popstate → setTabState).
    const handleClick = (tab) => {
        if (tab === tabState) {
            return;
        }
        navigateToTab(tab);
    };

    return (
        <SettingsProvider>
            <ToastProvider>
                <ConfirmProvider>
                <BlocksProvider>
                    <AppShell
                        menuList={menuList}
                        tabState={tabState}
                        onNavigate={handleClick}
                    />
                </BlocksProvider>
                </ConfirmProvider>
            </ToastProvider>
        </SettingsProvider>
    );
};

document.addEventListener("DOMContentLoaded", () => {
    initTheme();

    const container = document.getElementById("eb-settings")
    const root = createRoot(container);
    root.render(<EssentialAdmin />);
});
