/**
 * Segmented control (radiogroup). Arrow keys move the selection.
 */
import { useRef } from "@wordpress/element";
import classnames from "classnames";

/**
 * @param {Object}   props
 * @param {Array<{value: string, label: string}>} props.options
 * @param {string}   props.value
 * @param {Function} props.onChange
 * @param {string}   props.label     Group accessible name.
 * @param {string=}  props.className
 * @return {JSX.Element} Segmented control.
 */
export default function Segmented({ options, value, onChange, label, className }) {
    const refs = useRef([]);

    const onKeyDown = (event, index) => {
        const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        if (!(event.key in keys)) {
            return;
        }
        event.preventDefault();
        const next = (index + keys[event.key] + options.length) % options.length;
        onChange(options[next].value);
        refs.current[next]?.focus();
    };

    return (
        <div className={classnames("eb-segmented", className)} role="radiogroup" aria-label={label}>
            {options.map((option, index) => {
                const selected = value === option.value;
                return (
                    <button
                        key={option.value}
                        ref={(el) => (refs.current[index] = el)}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        tabIndex={selected ? 0 : -1}
                        className="eb-segmented__option"
                        onClick={() => onChange(option.value)}
                        onKeyDown={(event) => onKeyDown(event, index)}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
