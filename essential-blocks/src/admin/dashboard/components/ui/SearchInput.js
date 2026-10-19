/**
 * Labelled search field with a clear button. Esc clears it.
 */
import { __ } from "@wordpress/i18n";
import { useInstanceId } from "@wordpress/compose";
import classnames from "classnames";

/**
 * @param {Object}   props
 * @param {string}   props.value
 * @param {Function} props.onChange    Receives the new string.
 * @param {string}   props.label       Accessible label (visually hidden).
 * @param {string=}  props.placeholder
 * @param {string=}  props.className
 * @return {JSX.Element} Search input.
 */
export default function SearchInput({ value, onChange, label, placeholder, className }) {
    const id = `eb-search-${useInstanceId(SearchInput)}`;

    return (
        <div className={classnames("eb-search", className)}>
            <label className="eb-visually-hidden" htmlFor={id}>
                {label}
            </label>
            <svg className="eb-search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
            </svg>
            <input
                id={id}
                type="search"
                className="eb-search__input"
                value={value}
                placeholder={placeholder}
                autoComplete="off"
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Escape" && value) {
                        event.preventDefault();
                        onChange("");
                    }
                }}
            />
            {value && (
                <button
                    type="button"
                    className="eb-search__clear"
                    aria-label={__("Clear search", "essential-blocks")}
                    onClick={() => onChange("")}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" focusable="false">
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}
