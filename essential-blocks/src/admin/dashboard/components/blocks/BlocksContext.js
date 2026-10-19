/**
 * App-level block visibility state, shared by the Blocks tab and the
 * Dashboard status card so counts stay in sync after toggling.
 */
/**
 * WordPress dependencies
 */
import { createContext, useContext } from "@wordpress/element";

/**
 * Internal dependencies
 */
import useBlocksStore from "./useBlocksStore";

const BlocksContext = createContext(null);

export function BlocksProvider({ children }) {
    const isProActive = EssentialBlocksLocalize?.is_pro_active === "true";
    const store = useBlocksStore(EssentialBlocksLocalize?.all_blocks);

    return <BlocksContext.Provider value={{ ...store, isProActive }}>{children}</BlocksContext.Provider>;
}

/**
 * @return {Object} { blocks, setVisibility, setMany, isProActive }
 */
export const useBlocks = () => useContext(BlocksContext);

const isOn = (visibility) => visibility === true || visibility === "true";

/**
 * Blocks shown in the dashboard (has a category, not hidden from admin),
 * with display metadata. Sorted by label.
 *
 * @param {Object}  blocks      Current visibility map.
 * @param {Object}  blockMeta   EssentialBlocksLocalize.all_blocks_default.
 * @param {boolean} isProActive
 * @return {Array} Items.
 */
export const getBlockItems = (blocks, blockMeta, isProActive) =>
    Object.keys(blocks)
        .filter((key) => {
            const meta = blockMeta[key];
            const category = blocks[key]?.category ?? meta?.category;
            return category && category !== "undefined" && meta?.show_in_admin !== false;
        })
        .map((key) => {
            const meta = blockMeta[key] || {};
            const isPro = !!(meta.is_pro || blocks[key]?.is_pro);
            const locked = isPro && !isProActive;
            return {
                key,
                meta: { ...meta, is_pro: isPro },
                label: meta.label || blocks[key]?.label || key,
                category: blocks[key]?.category ?? meta.category,
                isPro,
                locked,
                // A locked block never reads as enabled, whatever is stored.
                enabled: !locked && isOn(blocks[key]?.visibility),
            };
        })
        .sort((a, b) => a.label.localeCompare(b.label));
