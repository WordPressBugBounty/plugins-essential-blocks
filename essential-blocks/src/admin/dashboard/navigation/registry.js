/**
 * Sidebar navigation registry.
 *
 * Builds the grouped sidebar from the tab list returned by
 * `essential_blocks_settings_menu_list` (menuList.js). Core tabs have fixed
 * groups; anything else (Pro, third parties) goes to its optional `group`
 * key if valid, otherwise to "manage". Pure: no hooks, no DOM.
 */

/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";

/**
 * Internal dependencies
 */
import { getTabUrl } from "../routing";

/**
 * Group definitions. Built in a function so __() runs after locale data
 * has loaded.
 *
 * @return {Array<{id: string, label: (string|null)}>} Groups in order.
 */
export const getNavGroups = () => [
    { id: "main", label: null },
    { id: "build", label: __("Build", "essential-blocks") },
    { id: "connect", label: __("Connect", "essential-blocks") },
    { id: "manage", label: __("Manage", "essential-blocks") },
];

export const NAV_GROUP_IDS = ["main", "build", "connect", "manage"];

export const CORE_GROUP_OF = {
    general: "main",
    blocks: "build",
    extensions: "build",
    templates: "build",
    "ai-suite": "build",
    integrations: "connect",
    options: "manage",
};

const isDev = () =>
    typeof process !== "undefined" &&
    process.env &&
    process.env.NODE_ENV !== "production";

// An icon such as Pro's legacy `<i></i>` renders nothing.
const iconIsVisible = (icon) =>
    !!icon && !(icon.type === "i" && !icon.props?.children);

/**
 * @param {Array} menuList Filtered tab list ({ id, icon, label, comp, group? }).
 * @return {Array<{id: string, label: (string|null), items: Array}>} Non-empty groups.
 */
export function buildNavigation(menuList) {
    const groups = getNavGroups().map((group) => ({ ...group, items: [] }));
    const byId = Object.fromEntries(groups.map((group) => [group.id, group]));
    const seen = new Set();

    (Array.isArray(menuList) ? menuList : []).forEach((item) => {
        if (
            !item ||
            typeof item !== "object" ||
            typeof item.id !== "string" ||
            !item.id ||
            typeof item.label !== "string" ||
            !item.label
        ) {
            if (isDev()) {
                // eslint-disable-next-line no-console
                console.warn("EB: skipped an invalid dashboard menu entry.", item);
            }
            return;
        }
        // Duplicate ids: the first one wins (same as getTabFromUrl).
        if (seen.has(item.id)) {
            return;
        }
        seen.add(item.id);

        let group = CORE_GROUP_OF[item.id];
        if (!group) {
            group = NAV_GROUP_IDS.includes(item.group) ? item.group : "manage";
        }

        byId[group].items.push({
            id: item.id,
            label: item.label,
            icon: item.icon,
            hasIcon: iconIsVisible(item.icon),
            comp: item.comp,
            group,
            href: getTabUrl(item.id),
        });
    });

    return groups.filter((group) => group.items.length > 0);
}

/**
 * @param {Array}  navigation Output of buildNavigation().
 * @param {string} id         Tab id.
 * @return {Object|null} Nav item.
 */
export function findNavItem(navigation, id) {
    for (const group of navigation || []) {
        const found = group.items.find((item) => item.id === id);
        if (found) {
            return found;
        }
    }
    return null;
}
