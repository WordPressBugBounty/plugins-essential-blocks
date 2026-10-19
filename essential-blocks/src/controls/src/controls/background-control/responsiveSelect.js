import { __ } from "@wordpress/i18n";
import { SelectControl } from "@wordpress/components";

import WithResButtons from "../withResButtons";
import { useBlockAttributes, useBlockSetAttributes, useDeviceType } from "../../hooks";

/**
 * Device prefix used by the background control's responsive attributes.
 * Hover keys carry it after the state prefix: `hov_TAB${controlName}…`.
 */
export const getBgDevicePrefix = (resOption) =>
    resOption === "Tablet" ? "TAB" : resOption === "Mobile" ? "MOB" : "";

/**
 * Select bound to the active device's attribute (`name`, `TAB…`, `MOB…`).
 * An empty Tablet/Mobile value means "not configured" and falls back to the
 * wider breakpoint in the generated CSS.
 */
function BgResponsiveSelect({
    label,
    name,
    statePrefix = "",
    options,
    renderNote,
}) {
    const attributes = useBlockAttributes();
    const setAttributes = useBlockSetAttributes();
    const resOption = useDeviceType();

    const attrName = `${statePrefix}${getBgDevicePrefix(resOption)}${name}`;
    const value = attributes[attrName] || "";

    return (
        <>
            <WithResButtons label={label}>
                <SelectControl
                    value={value}
                    options={options}
                    onChange={(newValue) =>
                        setAttributes({ [attrName]: newValue })
                    }
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
            </WithResButtons>
            {renderNote && renderNote(value, resOption)}
        </>
    );
}

const ATTACHMENT_OPTIONS = [
    { label: __("Default", "essential-blocks"), value: "" },
    { label: __("Scroll", "essential-blocks"), value: "scroll" },
    { label: __("Fixed", "essential-blocks"), value: "fixed" },
];

/**
 * Responsive "Attachment" select. Tablet/Mobile left on Default keep the
 * generated `background-attachment: scroll` fallback for those breakpoints.
 */
export const BgAttachmentControl = ({ name, statePrefix = "" }) => (
    <BgResponsiveSelect
        label={__("Attachment", "essential-blocks")}
        name={name}
        statePrefix={statePrefix}
        options={ATTACHMENT_OPTIONS}
        renderNote={(value, resOption) =>
            value === "fixed" && (
                <p style={{ marginTop: "-10px", paddingBottom: "10px" }}>
                    <i>
                        {resOption === "Desktop"
                            ? __(
                                "Note: Attachment Fixed works only on desktop unless set for Tablet/Mobile.",
                                "essential-blocks"
                            )
                            : __(
                                "Note: Attachment Fixed is not supported by some mobile browsers.",
                                "essential-blocks"
                            )}
                    </i>
                </p>
            )
        }
    />
);

const BLEND_MODES = [
    { label: __("Multiply", "essential-blocks"), value: "multiply" },
    { label: __("Screen", "essential-blocks"), value: "screen" },
    { label: __("Overlay", "essential-blocks"), value: "overlay" },
    { label: __("Darken", "essential-blocks"), value: "darken" },
    { label: __("Lighten", "essential-blocks"), value: "lighten" },
    { label: __("Color Dodge", "essential-blocks"), value: "color-dodge" },
    { label: __("Saturation", "essential-blocks"), value: "saturation" },
    { label: __("Color", "essential-blocks"), value: "color" },
    { label: __("Luminosity", "essential-blocks"), value: "luminosity" },
];

/**
 * Responsive overlay "Blend Mode" select. Desktop keeps its original options
 * ("Normal" is stored as ""). On Tablet/Mobile "" means "inherit", so an
 * explicit "normal" is offered to reset a blend mode inherited from above.
 */
export const BgBlendModeControl = ({ name, statePrefix = "" }) => {
    const resOption = useDeviceType();
    const options =
        resOption === "Desktop"
            ? [{ label: __("Normal", "essential-blocks"), value: "" }, ...BLEND_MODES]
            : [
                { label: __("Default", "essential-blocks"), value: "" },
                { label: __("Normal", "essential-blocks"), value: "normal" },
                ...BLEND_MODES,
            ];

    return (
        <BgResponsiveSelect
            label={__("Blend Mode", "essential-blocks")}
            name={name}
            statePrefix={statePrefix}
            options={options}
        />
    );
};
