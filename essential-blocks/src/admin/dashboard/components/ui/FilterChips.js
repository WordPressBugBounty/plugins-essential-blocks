/**
 * Row of filter chips (single select). Each chip is a toggle button.
 */
import classnames from "classnames";

/**
 * @param {Object}   props
 * @param {Array<{value: string, label: string, count?: number, disabled?: boolean}>} props.options
 * @param {string}   props.value     Selected value.
 * @param {Function} props.onChange  Receives the chosen value.
 * @param {string}   props.label     Group accessible name.
 * @param {string=}  props.className
 * @return {JSX.Element} Chips.
 */
export default function FilterChips({ options, value, onChange, label, className }) {
    return (
        <div className={classnames("eb-chips", className)} role="group" aria-label={label}>
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    className="eb-chip"
                    aria-pressed={value === option.value}
                    disabled={option.disabled}
                    onClick={() => onChange(option.value)}
                >
                    <span>{option.label}</span>
                    {typeof option.count === "number" && (
                        <span className="eb-chip__count">{option.count}</span>
                    )}
                </button>
            ))}
        </div>
    );
}
