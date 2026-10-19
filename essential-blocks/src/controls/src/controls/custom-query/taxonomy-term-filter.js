/**
 * WordPress Core Dependencies
 */
import { PanelRow } from "@wordpress/components";
import { memo } from "@wordpress/element";

/**
 * Internal Dependencies
 */
import { ButtonGroupControl } from "../button-group-control";
import EBSelect from "../eb-select";
import { INCLUDE_EXCLUDE } from "./constants";

/**
 * Saved `value` / `exclude` JSON string -> react-select value ("" when empty).
 *
 * @param {string} savedTerms
 * @return {Array|string}
 */
const parseSavedTerms = (savedTerms) => {
    if (!savedTerms) {
        return "";
    }

    try {
        return JSON.parse(savedTerms);
    } catch (error) {
        return "";
    }
};

/**
 * One taxonomy's Include/Exclude filter in the CustomQuery panel: the mode
 * toggle plus a single term select for the current mode.
 *
 * @param {Object}   props
 * @param {Object}   props.taxonomy      { name, slug, rest_base, rest_namespace, values }.
 * @param {Object}   props.queryTaxonomy queryData.taxonomies[slug] ({ value, exclude } JSON strings).
 * @param {string}   props.mode          "include" or "exclude".
 * @param {boolean}  props.isDisabled
 * @param {Function} props.onModeChange  (mode) => void
 * @param {Function} props.onChange      (mode, selectedTerms) => void
 * @param {Function} props.loadOptions   react-select async loadOptions.
 */
function TaxonomyTermFilter({
    taxonomy,
    queryTaxonomy,
    mode,
    isDisabled,
    onModeChange,
    onChange,
    loadOptions,
}) {
    const isExclude = mode === "exclude";

    return (
        <>
            <ButtonGroupControl
                label={taxonomy.name}
                options={INCLUDE_EXCLUDE}
                currentValue={mode}
                onChange={onModeChange}
            />
            <div className="eb-control-item-wrapper">
                <PanelRow>{isExclude ? "Exclude" : "Include"} {taxonomy.name}</PanelRow>
                <EBSelect
                    // A separate select per mode, as before: switching mode starts with a fresh input and option cache.
                    key={mode}
                    variant="async"
                    cacheOptions
                    name={isExclude ? "exclude-categories" : "select-categories"}
                    value={parseSavedTerms(isExclude ? queryTaxonomy.exclude : queryTaxonomy.value)}
                    defaultOptions={taxonomy.values}
                    placeholder={`Search for ${taxonomy.name}`}
                    onChange={(selected) => onChange(mode, selected)}
                    isMulti="true"
                    isDisabled={isDisabled}
                    loadOptions={loadOptions}
                />
            </div>
        </>
    );
}

export default memo(TaxonomyTermFilter);
