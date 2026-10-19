/**
 * Accessible on/off switch (rc-switch renders <button role="switch">).
 */
import Switch from "rc-switch";
import classnames from "classnames";

import "../../scss/switch.css";

/**
 * @param {Object}    props
 * @param {boolean}   props.checked
 * @param {Function}  props.onChange      Receives the next checked value.
 * @param {string=}   props.label         Accessible name (when there is no visible label).
 * @param {string=}   props.labelledBy    id of a visible label element.
 * @param {string=}   props.describedBy   id of a description element.
 * @param {boolean=}  props.disabled
 * @param {boolean=}  props.loading       Keeps the switch inert while saving.
 * @param {string=}   props.id
 * @param {string=}   props.className
 * @return {JSX.Element} Toggle.
 */
export default function Toggle({
    checked,
    onChange,
    label,
    labelledBy,
    describedBy,
    disabled = false,
    loading = false,
    id,
    className,
}) {
    return (
        <Switch
            id={id}
            className={classnames("eb-toggle", className)}
            prefixCls="rc-switch"
            checked={!!checked}
            disabled={disabled}
            onChange={(next) => !loading && onChange(next)}
            aria-label={labelledBy ? undefined : label}
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            aria-busy={loading || undefined}
        />
    );
}
