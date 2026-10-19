/**
 * Blocks tab: find, filter and enable/disable blocks.
 */
/**
 * WordPress dependencies
 */
import { __, _n, sprintf } from "@wordpress/i18n";
import * as wpElement from "@wordpress/element";

/**
 * Internal dependencies
 */
import PageHeader from "../ui/PageHeader";
import SearchInput from "../ui/SearchInput";
import FilterChips from "../ui/FilterChips";
import Segmented from "../ui/Segmented";
import EmptyState from "../ui/EmptyState";
import Button from "../ui/Button";
import BlockCard from "./BlockCard";
import ProUpgradeModal from "../ProUpgradeModal";
import { useBlocks, getBlockItems } from "./BlocksContext";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../ui/ConfirmDialog";
import useSectionNav from "../../hooks/useSectionNav";

const CATEGORY_LABELS = {
    content: () => __("Content Blocks", "essential-blocks"),
    creative: () => __("Creative Blocks", "essential-blocks"),
    dynamic: () => __("Dynamic Blocks", "essential-blocks"),
    form: () => __("Form Blocks", "essential-blocks"),
    layout: () => __("Layout Blocks", "essential-blocks"),
    marketing: () => __("Marketing Blocks", "essential-blocks"),
    social: () => __("Social Blocks", "essential-blocks"),
    woocommerce: () => __("WooCommerce Blocks", "essential-blocks"),
};

const categoryLabel = (category) =>
    CATEGORY_LABELS[category]?.() ??
    sprintf(
        /* translators: %s: block category name. */
        __("%s Blocks", "essential-blocks"),
        category.charAt(0).toUpperCase() + category.slice(1)
    );

// Chip labels drop the trailing "Blocks" to keep the row compact.
const CHIP_LABELS = {
    content: () => __("Content", "essential-blocks"),
    creative: () => __("Creative", "essential-blocks"),
    dynamic: () => __("Dynamic", "essential-blocks"),
    form: () => __("Form", "essential-blocks"),
    layout: () => __("Layout", "essential-blocks"),
    marketing: () => __("Marketing", "essential-blocks"),
    social: () => __("Social", "essential-blocks"),
    woocommerce: () => __("WooCommerce", "essential-blocks"),
};

const { useCallback, useMemo, useState } = wpElement;
// React 18 (WP 6.2+); identity fallback keeps older runtimes working.
const useDeferredValue = wpElement.useDeferredValue ?? ((value) => value);

const SearchIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
    </svg>
);

export default function BlocksManager() {
    const { all_blocks_default: blockMeta = {} } = EssentialBlocksLocalize;
    const { blocks, setVisibility, setMany, isProActive } = useBlocks();
    const { show } = useToast();
    const confirm = useConfirm();

    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("all");
    const [showUpgrade, setShowUpgrade] = useState(false);
    const deferredQuery = useDeferredValue(query);

    const items = useMemo(
        () => getBlockItems(blocks, blockMeta, isProActive),
        [blocks, blockMeta, isProActive]
    );

    const manageable = items.filter((item) => !item.locked);
    const enabledCount = manageable.filter((item) => item.enabled).length;
    const lockedCount = items.length - manageable.length;

    const searchMatches = useMemo(() => {
        const q = deferredQuery.trim().toLowerCase();
        if (!q) {
            return items;
        }
        return items.filter(
            (item) =>
                item.label.toLowerCase().includes(q) ||
                item.key.toLowerCase().includes(q)
        );
    }, [items, deferredQuery]);

    const statusMatches = useMemo(
        () =>
            searchMatches.filter((item) => {
                if (status === "enabled") {
                    return !item.locked && item.enabled;
                }
                if (status === "disabled") {
                    return !item.locked && !item.enabled;
                }
                if (status === "pro") {
                    return item.isPro;
                }
                return true;
            }),
        [searchMatches, status]
    );

    const categories = useMemo(
        () => [...new Set(items.map((item) => item.category))].sort(),
        [items]
    );

    const categoryOptions = [
        { value: "all", label: __("All", "essential-blocks"), count: statusMatches.length },
        ...categories.map((cat) => {
            const count = statusMatches.filter((item) => item.category === cat).length;
            return {
                value: cat,
                label: CHIP_LABELS[cat]?.() ?? categoryLabel(cat),
                count,
                disabled: count === 0,
            };
        }),
    ];

    // Category chips jump to a section; only search and status filter.
    const visible = statusMatches;

    const groups = categories
        .map((cat) => ({ cat, items: visible.filter((item) => item.category === cat) }))
        .filter((group) => group.items.length);

    const { toolbarRef, active: activeCategory, goTo: goToCategory } = useSectionNav(
        groups.map((group) => group.cat),
        "eb-blocks-group-"
    );

    const onToggle = useCallback(
        (key, enabled) => {
            const label = blockMeta[key]?.label || key;
            setVisibility(key, enabled).then((ok) =>
                show(
                    ok
                        ? {
                              message: enabled
                                  ? /* translators: %s: block name. */
                                    sprintf(__("%s enabled", "essential-blocks"), label)
                                  : /* translators: %s: block name. */
                                    sprintf(__("%s disabled", "essential-blocks"), label),
                          }
                        : {
                              type: "error",
                              message: sprintf(
                                  /* translators: %s: block name. */
                                  __("Couldn't save %s. Please try again.", "essential-blocks"),
                                  label
                              ),
                          }
                )
            );
        },
        [setVisibility, show, blockMeta]
    );

    const onUnlock = useCallback(() => setShowUpgrade(true), []);

    // Bulk actions act on every block that can be managed (locked Pro
    // blocks are never switched on while Pro is inactive).
    const setAll = (enabled) => {
        const changes = {};
        manageable.forEach((item) => {
            changes[item.key] = enabled;
        });
        setMany(changes).then((ok) =>
            show(
                ok
                    ? {
                          message: enabled
                              ? sprintf(
                                    /* translators: %d: number of blocks. */
                                    _n("%d block enabled", "%d blocks enabled", manageable.length, "essential-blocks"),
                                    manageable.length
                                )
                              : sprintf(
                                    /* translators: %d: number of blocks. */
                                    _n("%d block disabled", "%d blocks disabled", manageable.length, "essential-blocks"),
                                    manageable.length
                                ),
                      }
                    : {
                          type: "error",
                          message: __("Couldn't save your changes. Please try again.", "essential-blocks"),
                      }
            )
        );
    };

    // Disabling every block breaks pages built with them: confirm first.
    const disableAll = async () => {
        const ok = await confirm({
            title: __("Disable all blocks?", "essential-blocks"),
            message: __(
                "Disabled blocks are removed from the editor and never load on your site, so pages built with them will stop displaying that content. You can turn them back on with Enable All.",
                "essential-blocks"
            ),
            confirmLabel: __("Disable All", "essential-blocks"),
            tone: "danger",
        });
        if (ok) {
            setAll(false);
        }
    };

    const clearFilters = () => {
        setQuery("");
        setStatus("all");
    };

    const resultsText = sprintf(
        /* translators: %d: number of blocks. */
        _n("%d block found", "%d blocks found", visible.length, "essential-blocks"),
        visible.length
    );

    return (
        <div className="eb-blocks-manager">
            <PageHeader
                title={__("Blocks", "essential-blocks")}
                description={
                    lockedCount
                        ? sprintf(
                              /* translators: 1: enabled blocks, 2: total blocks, 3: PRO blocks that need Essential Blocks PRO. */
                              __("%1$d of %2$d blocks enabled (%3$d PRO). Disabled blocks are removed from the editor and never load on your site.", "essential-blocks"),
                              enabledCount,
                              items.length,
                              lockedCount
                          )
                        : sprintf(
                              /* translators: 1: enabled blocks, 2: total blocks. */
                              __("%1$d of %2$d blocks enabled. Disabled blocks are removed from the editor and never load on your site.", "essential-blocks"),
                              enabledCount,
                              items.length
                          )
                }
                actions={
                    <div
                        className="eb-bulk-actions"
                        role="group"
                        aria-label={__("Bulk actions", "essential-blocks")}
                    >
                        <Button variant="secondary" onClick={disableAll}>
                            {__("Disable All", "essential-blocks")}
                        </Button>
                        <Button onClick={() => setAll(true)}>
                            {__("Enable All", "essential-blocks")}
                        </Button>
                    </div>
                }
            />

            <div className="eb-dash-toolbar" role="search" ref={toolbarRef}>
                <div className="eb-dash-toolbar__row">
                    <SearchInput
                        value={query}
                        onChange={setQuery}
                        label={__("Search blocks", "essential-blocks")}
                        placeholder={__("Search blocks…", "essential-blocks")}
                    />
                    <Segmented
                        label={__("Filter by status", "essential-blocks")}
                        value={status}
                        onChange={setStatus}
                        options={[
                            { value: "all", label: __("All", "essential-blocks") },
                            { value: "enabled", label: __("Enabled", "essential-blocks") },
                            { value: "disabled", label: __("Disabled", "essential-blocks") },
                            { value: "pro", label: __("Pro", "essential-blocks") },
                        ]}
                    />
                </div>
                <FilterChips
                    label={__("Jump to category", "essential-blocks")}
                    value={activeCategory}
                    onChange={goToCategory}
                    options={categoryOptions}
                />
            </div>

            <p className="eb-visually-hidden" role="status">
                {resultsText}
            </p>

            {groups.length === 0 ? (
                <EmptyState
                    icon={<SearchIcon />}
                    title={
                        deferredQuery.trim()
                            ? sprintf(
                                  /* translators: %s: search text. */
                                  __("No blocks match “%s”", "essential-blocks"),
                                  deferredQuery.trim()
                              )
                            : __("No blocks match these filters", "essential-blocks")
                    }
                    description={__("Try a different name or clear the filters.", "essential-blocks")}
                    action={
                        <Button variant="secondary" onClick={clearFilters}>
                            {__("Clear filters", "essential-blocks")}
                        </Button>
                    }
                />
            ) : (
                groups.map((group) => (
                    <section
                        key={group.cat}
                        className="eb-dash-section"
                        aria-labelledby={`eb-blocks-group-${group.cat}`}
                    >
                        <div className="eb-dash-section__header">
                            <h2
                                className="eb-dash-section__title"
                                id={`eb-blocks-group-${group.cat}`}
                                tabIndex={-1}
                            >
                                {categoryLabel(group.cat)}
                                <span className="eb-dash-section__count">{group.items.length}</span>
                            </h2>
                        </div>
                        <div className="eb-card-grid eb-card-grid--blocks">
                            {group.items.map((item) => (
                                <BlockCard
                                    key={item.key}
                                    blockKey={item.key}
                                    meta={item.meta}
                                    enabled={item.enabled}
                                    locked={item.locked}
                                    onToggle={onToggle}
                                    onUnlock={onUnlock}
                                />
                            ))}
                        </div>
                    </section>
                ))
            )}

            {showUpgrade && <ProUpgradeModal onClose={() => setShowUpgrade(false)} />}
        </div>
    );
}
