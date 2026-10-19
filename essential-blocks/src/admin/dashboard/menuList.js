import { applyFilters } from "@wordpress/hooks";
import { __ } from "@wordpress/i18n";

import { HomeIcon, BlocksIcon, ExtensionsIcon, TemplatesIcon, OptionsIcon, IntegrationsIcon, WriteWithAiIcon } from "./icons";
import {
    TabGeneral,
    Blocks,
    TabTemplates,
    TabOptions,
    TabIntegrations,
    TabAISuite,
    TabExtensions
} from "./components";

/**
 * Dashboard tabs.
 *
 * The filter is applied when called (at mount), not at module load, so
 * scripts that load after this bundle (e.g. Pro, which depends on it)
 * can still add or modify tabs. Ids are a public contract (?tab=...).
 *
 * The sidebar groups come from navigation/registry.js: core tabs have fixed
 * groups; filter-added items may set an optional `group` key
 * ('main' | 'build' | 'connect' | 'manage'), otherwise they go to 'manage'.
 */
const getTabMenus = () => applyFilters('essential_blocks_settings_menu_list', [
    {
        id: 'general',
        icon: <HomeIcon />,
        label: __("Dashboard", "essential-blocks"),
        comp: <TabGeneral />

    },
    {
        id: 'blocks',
        icon: <BlocksIcon />,
        label: __("Blocks", "essential-blocks"),
        comp: <Blocks />
    },
    {
        id: 'extensions',
        icon: <ExtensionsIcon />,
        label: __("Extensions", "essential-blocks"),
        comp: <TabExtensions />
    },
    {
        id: 'templates',
        icon: <TemplatesIcon />,
        label: __("Templates", "essential-blocks"),
        comp: <TabTemplates />
    },
    {
        id: 'ai-suite',
        icon: <WriteWithAiIcon />,
        label: __("AI Suite", "essential-blocks"),
        comp: <TabAISuite />
    },
    {
        id: 'options',
        icon: <OptionsIcon />,
        label: __("Settings", "essential-blocks"),
        comp: <TabOptions />
    },
    {
        id: 'integrations',
        icon: <IntegrationsIcon />,
        label: __("Integrations", "essential-blocks"),
        comp: <TabIntegrations />
    },
]);

export default getTabMenus;
