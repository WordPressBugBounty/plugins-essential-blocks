/**
 * Sidebar badges:
 * - Blocks: "enabled/all" count. The total always includes Pro blocks, so
 *   it is the same with or without Pro; locked Pro blocks count as not enabled.
 * - AI Suite: "Set up" dot while no OpenAI API key is saved. The option is
 *   loaded once with the shell (shared cache), so the dot shows on every tab
 *   and goes away as soon as a key is saved from AI Suite.
 */

/**
 * WordPress dependencies
 */
import { __, sprintf } from "@wordpress/i18n";
import { useMemo } from "@wordpress/element";

/**
 * Internal dependencies
 */
import { useBlocks, getBlockItems } from "../components/blocks/BlocksContext";
import { useEbOption } from "../context/SettingsContext";

/**
 * @return {Object} { [itemId]: { kind, text?, label?, srText } }
 */
export default function useNavBadges() {
    const { blocks, isProActive } = useBlocks();
    const { data: ai, status: aiStatus } = useEbOption("eb_write_with_ai");

    const blocksBadge = useMemo(() => {
        const items = getBlockItems(
            blocks,
            window.EssentialBlocksLocalize?.all_blocks_default || {},
            isProActive
        );
        const enabled = items.filter((item) => !item.locked && item.enabled).length;
        const total = items.length;
        return {
            kind: "count",
            text: `${enabled}/${total}`,
            srText: sprintf(
                /* translators: 1: enabled blocks, 2: total blocks. */
                __("%1$d of %2$d enabled", "essential-blocks"),
                enabled,
                total
            ),
        };
    }, [blocks, isProActive]);

    const badges = { blocks: blocksBadge };

    // Not loaded yet or failed to load: no badge, don't guess.
    if (aiStatus === "ready" && !String(ai?.apiKey || "").trim()) {
        badges["ai-suite"] = {
            kind: "dot",
            label: __("Set up", "essential-blocks"),
            srText: __("Needs setup", "essential-blocks"),
        };
    }

    return badges;
}
