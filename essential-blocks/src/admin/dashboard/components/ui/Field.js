/**
 * Form field primitives: a labelled, described control with an error slot.
 *
 * - `Field` does layout and ARIA wiring for any control (render prop).
 * - `TextField`, `NumberField`, `SecretField` and `Select` are native
 *   controls built on it.
 *
 * `onChange` always receives the raw `event.target.value` string: callers
 * keep their own Number()/trim logic, so saved value types never change.
 */

/**
 * WordPress dependencies
 */
import { __, sprintf } from "@wordpress/i18n";
import { useState } from "@wordpress/element";
import { useInstanceId } from "@wordpress/compose";

/**
 * External dependencies
 */
import classnames from "classnames";

const ErrorIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
    </svg>
);

/**
 * Layout and wiring for one control.
 *
 * @param {Object}   props
 * @param {string}   props.id               Control id (generated when omitted).
 * @param {*}        props.label            Label (always rendered as <label for>).
 * @param {boolean}  props.hideLabel        Visually hide the label (name kept).
 * @param {*}        props.description      Help text.
 * @param {*}        props.error            Error text; sets aria-invalid.
 * @param {boolean}  props.required         Native required + visible "*".
 * @param {boolean}  props.disabled         Disabled.
 * @param {string}   props.className        Wrapper class.
 * @param {string}   props.extraDescribedBy Extra ids for aria-describedby.
 * @param {Function} props.children         (controlProps) => node.
 * @return {JSX.Element} Field.
 */
export default function Field({
    id: idProp,
    label,
    hideLabel = false,
    description,
    error,
    required = false,
    disabled = false,
    className,
    extraDescribedBy,
    children,
}) {
    const id = useInstanceId(Field, "eb-field", idProp);
    const descriptionId = description ? `${id}-description` : null;
    const errorId = `${id}-error`;

    const describedBy = [descriptionId, extraDescribedBy, error ? errorId : null]
        .filter(Boolean)
        .join(" ");

    const controlProps = {
        id,
        "aria-describedby": describedBy || undefined,
        "aria-invalid": error ? true : undefined,
        required: required || undefined,
        disabled: disabled || undefined,
    };

    return (
        <div
            className={classnames("eb-field", className, {
                "has-error": !!error,
                "is-disabled": disabled,
            })}
        >
            <label
                htmlFor={id}
                className={classnames("eb-field__label", {
                    "eb-visually-hidden": hideLabel,
                })}
            >
                {label}
                {required && (
                    <span className="eb-field__required" aria-hidden="true">
                        {" *"}
                    </span>
                )}
            </label>
            {description && (
                <p id={descriptionId} className="eb-field__description">
                    {description}
                </p>
            )}
            {children(controlProps)}
            <p id={errorId} className="eb-field__error" aria-live="polite">
                {error && (
                    <>
                        <ErrorIcon />
                        <span>{error}</span>
                    </>
                )}
            </p>
        </div>
    );
}

const pickFieldProps = (props) => {
    const {
        id,
        label,
        hideLabel,
        description,
        error,
        required,
        disabled,
        className,
        ...rest
    } = props;
    return {
        field: { id, label, hideLabel, description, error, required, disabled, className },
        rest,
    };
};

/**
 * Single-line text input.
 *
 * @param {Object} props Field props + value, onChange(string), type, placeholder, autoComplete.
 * @return {JSX.Element} Field.
 */
export function TextField(props) {
    const { field, rest } = pickFieldProps(props);
    const { value, onChange, type = "text", ...controlRest } = rest;
    return (
        <Field {...field}>
            {(controlProps) => (
                <input
                    {...controlRest}
                    {...controlProps}
                    type={type}
                    className="eb-input eb-input"
                    value={value ?? ""}
                    onChange={(event) => onChange?.(event.target.value)}
                />
            )}
        </Field>
    );
}

/**
 * Number input with an optional unit suffix.
 *
 * @param {Object} props Field props + value, onChange(rawString), min, max, step, unit.
 * @return {JSX.Element} Field.
 */
export function NumberField(props) {
    const { field, rest } = pickFieldProps(props);
    const { value, onChange, unit, inputMode = "numeric", ...controlRest } = rest;
    const instanceId = useInstanceId(NumberField, "eb-field-unit");
    const unitId = unit ? `${field.id || instanceId}-unit` : null;
    return (
        <Field {...field} extraDescribedBy={unitId}>
            {(controlProps) => (
                <div className="eb-field__row">
                    <input
                        {...controlRest}
                        {...controlProps}
                        type="number"
                        inputMode={inputMode}
                        className="eb-input eb-input"
                        value={value ?? ""}
                        onChange={(event) => onChange?.(event.target.value)}
                    />
                    {unit && (
                        <>
                            <span className="eb-field__unit" aria-hidden="true">
                                {unit}
                            </span>
                            <span id={unitId} className="eb-visually-hidden">
                                {unit}
                            </span>
                        </>
                    )}
                </div>
            )}
        </Field>
    );
}

/**
 * Masked input (API keys) with a Show/Hide toggle.
 *
 * @param {Object} props Field props + value, onChange(string), showText, hideText.
 * @return {JSX.Element} Field.
 */
export function SecretField(props) {
    const { field, rest } = pickFieldProps(props);
    const {
        value,
        onChange,
        showText,
        hideText,
        ...controlRest
    } = rest;
    // Toggle names default to "Show/Hide <label>". `hideLabel` stays the
    // Field prop (visually hide the label), so the toggle uses *Text props.
    const [visible, setVisible] = useState(false);
    const labelText = typeof field.label === "string" ? field.label : "";

    const showName =
        showText ||
        (labelText
            ? /* translators: %s: field label, e.g. "API key". */
              sprintf(__("Show %s", "essential-blocks"), labelText)
            : __("Show", "essential-blocks"));
    const hideName =
        hideText ||
        (labelText
            ? /* translators: %s: field label, e.g. "API key". */
              sprintf(__("Hide %s", "essential-blocks"), labelText)
            : __("Hide", "essential-blocks"));

    return (
        <Field {...field}>
            {(controlProps) => (
                <div className="eb-field__row eb-field__row--secret">
                    <input
                        autoComplete="off"
                        spellCheck={false}
                        autoCapitalize="off"
                        data-1p-ignore=""
                        data-lpignore="true"
                        {...controlRest}
                        {...controlProps}
                        type={visible ? "text" : "password"}
                        className="eb-input eb-input"
                        value={value ?? ""}
                        onChange={(event) => onChange?.(event.target.value)}
                    />
                    <button
                        type="button"
                        className="eb-field__toggle"
                        aria-controls={controlProps.id}
                        aria-pressed={visible}
                        aria-label={visible ? hideName : showName}
                        disabled={controlProps.disabled}
                        onClick={() => setVisible((v) => !v)}
                    >
                        {visible
                            ? __("Hide", "essential-blocks")
                            : __("Show", "essential-blocks")}
                    </button>
                </div>
            )}
        </Field>
    );
}

/**
 * Native select.
 *
 * @param {Object} props Field props + value, onChange(value), options [{value,label,disabled}] or children.
 * @return {JSX.Element} Field.
 */
export function Select(props) {
    const { field, rest } = pickFieldProps(props);
    const { value, onChange, options, children, ...controlRest } = rest;
    return (
        <Field {...field}>
            {(controlProps) => (
                <select
                    {...controlRest}
                    {...controlProps}
                    className="eb-input eb-input eb-input--select"
                    value={value ?? ""}
                    onChange={(event) => onChange?.(event.target.value)}
                >
                    {options
                        ? options.map((option) => (
                              <option
                                  key={option.value}
                                  value={option.value}
                                  disabled={option.disabled}
                              >
                                  {option.label}
                              </option>
                          ))
                        : children}
                </select>
            )}
        </Field>
    );
}
