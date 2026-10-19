/**
 * Extensions tab: discover extensions and switch the toggleable ones.
 */
/**
 * WordPress dependencies
 */
import { __, _n, sprintf } from "@wordpress/i18n";
import { useCallback, useMemo, useState } from "@wordpress/element";

/**
 * Internal dependencies
 */
import PageHeader from "./ui/PageHeader";
import SearchInput from "./ui/SearchInput";
import FilterChips from "./ui/FilterChips";
import Segmented from "./ui/Segmented";
import EmptyState from "./ui/EmptyState";
import Button from "./ui/Button";
import { SkeletonCards } from "./ui/Skeleton";
import LoadErrorState from "./ui/LoadErrorState";
import ExtensionCard from "./extensions/ExtensionCard";
import { getExtensions, EXTENSION_CATEGORIES, isExtensionActive } from "../data/extensions";
import { useEbSettings, usePeekOption } from "../context/SettingsContext";
import { useToast } from "../context/ToastContext";
import useSectionNav from "../hooks/useSectionNav";

const SearchIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
    </svg>
);

export default function TabExtensions() {
    const isProActive = EssentialBlocksLocalize?.is_pro_active === "true";
    const extensions = useMemo(getExtensions, []);
    const { settings, loading, status, retry, setSetting } = useEbSettings();
    const aiSettings = usePeekOption("eb_write_with_ai");
    const { show } = useToast();

    const [query, setQuery] = useState("");
    const [tier, setTier] = useState("all");

    const isActive = useCallback(
        (extension) => isExtensionActive(extension, settings, aiSettings),
        [settings, aiSettings]
    );

    const searchMatches = useMemo(() => {
        const q = query.trim().toLowerCase();
        return extensions.filter(
            (ext) =>
                (tier === "all" || ext.tier === tier) &&
                (!q ||
                    ext.title.toLowerCase().includes(q) ||
                    (ext.description || "").toLowerCase().includes(q))
        );
    }, [extensions, query, tier]);

    const categories = Object.keys(EXTENSION_CATEGORIES).filter((cat) =>
        extensions.some((ext) => ext.category === cat)
    );
    // Entries in a category that isn't registered still show, under "Other".
    const otherKey = "other";
    const categoryOf = (ext) => (EXTENSION_CATEGORIES[ext.category] ? ext.category : otherKey);
    if (extensions.some((ext) => categoryOf(ext) === otherKey)) {
        categories.push(otherKey);
    }
    const categoryLabel = (cat) =>
        cat === otherKey ? __("Other", "essential-blocks") : EXTENSION_CATEGORIES[cat]();

    // Category chips jump to a section; only search and plan filter.
    const visible = searchMatches;
    const groups = categories
        .map((cat) => ({ cat, items: visible.filter((ext) => categoryOf(ext) === cat) }))
        .filter((group) => group.items.length);

    const { toolbarRef, active: activeCategory, goTo: goToCategory } = useSectionNav(
        loading || status === "error" ? [] : groups.map((group) => group.cat),
        "eb-ext-group-"
    );

    const available = extensions.filter((ext) => !(ext.tier === "pro" && !isProActive));
    const activeCount = available.filter(isActive).length;

    const onToggle = useCallback(
        (extension, enabled) => {
            setSetting(extension.toggle.settingKey, enabled).then((ok) =>
                show(
                    ok
                        ? {
                              // Extensions apply on the next editor load.
                              message: `${
                                  enabled
                                      ? /* translators: %s: extension name. */
                                        sprintf(__("%s activated", "essential-blocks"), extension.title)
                                      : /* translators: %s: extension name. */
                                        sprintf(__("%s deactivated", "essential-blocks"), extension.title)
                              }. ${__("Reload open editor tabs to apply.", "essential-blocks")}`,
                              duration: 6000,
                          }
                        : {
                              type: "error",
                              message: sprintf(
                                  /* translators: %s: extension name. */
                                  __("Couldn't save %s. Please try again.", "essential-blocks"),
                                  extension.title
                              ),
                          }
                )
            );
        },
        [setSetting, show]
    );

    const clearFilters = () => {
        setQuery("");
        setTier("all");
    };

    const resultsText = sprintf(
        /* translators: %d: number of extensions. */
        _n("%d extension found", "%d extensions found", visible.length, "essential-blocks"),
        visible.length
    );

    let content;
    // A failed fetch must not look like a fresh install (defaults).
    if (status === "error") {
        content = <LoadErrorState onRetry={retry} />;
    } else if (loading) {
        content = <SkeletonCards count={8} />;
    } else if (groups.length === 0) {
        content = (
            <EmptyState
                icon={<SearchIcon />}
                title={
                    query.trim()
                        ? sprintf(
                              /* translators: %s: search text. */
                              __("No extensions match “%s”", "essential-blocks"),
                              query.trim()
                          )
                        : __("No extensions match these filters", "essential-blocks")
                }
                description={__("Try a different name or clear the filters.", "essential-blocks")}
                action={
                    <Button variant="secondary" onClick={clearFilters}>
                        {__("Clear filters", "essential-blocks")}
                    </Button>
                }
            />
        );
    } else {
        content = groups.map((group) => (
            <section
                key={group.cat}
                className="eb-dash-section"
                aria-labelledby={`eb-ext-group-${group.cat}`}
            >
                <div className="eb-dash-section__header">
                    <h2 className="eb-dash-section__title" id={`eb-ext-group-${group.cat}`} tabIndex={-1}>
                        {categoryLabel(group.cat)}
                        <span className="eb-dash-section__count">{group.items.length}</span>
                    </h2>
                </div>
                <div className="eb-card-grid">
                    {group.items.map((ext) => (
                        <ExtensionCard
                            key={ext.key}
                            extension={ext}
                            locked={ext.tier === "pro" && !isProActive}
                            active={isActive(ext)}
                            loading={loading}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            </section>
        ));
    }

    return (
        <div className="eb-extensions">
            <PageHeader
                title={__("Extensions", "essential-blocks")}
                description={sprintf(
                    /* translators: 1: active extensions, 2: available extensions. */
                    __("%1$d of %2$d extensions active. Extensions add features to every block and to the editor.", "essential-blocks"),
                    activeCount,
                    available.length
                )}
            />

            <div className="eb-dash-toolbar" role="search" ref={toolbarRef}>
                <div className="eb-dash-toolbar__row">
                    <SearchInput
                        value={query}
                        onChange={setQuery}
                        label={__("Search extensions", "essential-blocks")}
                        placeholder={__("Search extensions…", "essential-blocks")}
                    />
                    <Segmented
                        label={__("Filter by plan", "essential-blocks")}
                        value={tier}
                        onChange={setTier}
                        options={[
                            { value: "all", label: __("All", "essential-blocks") },
                            { value: "free", label: __("Free", "essential-blocks") },
                            { value: "pro", label: __("Pro", "essential-blocks") },
                        ]}
                    />
                </div>
                <FilterChips
                    label={__("Jump to category", "essential-blocks")}
                    value={activeCategory}
                    onChange={goToCategory}
                    options={[
                        { value: "all", label: __("All", "essential-blocks"), count: searchMatches.length },
                        ...categories.map((cat) => {
                            const count = searchMatches.filter((ext) => categoryOf(ext) === cat).length;
                            return { value: cat, label: categoryLabel(cat), count, disabled: count === 0 };
                        }),
                    ]}
                />
            </div>

            <p className="eb-visually-hidden" role="status">
                {resultsText}
            </p>

            {content}
        </div>
    );
}
