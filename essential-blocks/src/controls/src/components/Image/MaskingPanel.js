/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import {
    ToggleControl,
    SelectControl,
    TextControl,
    RangeControl,
    ExternalLink,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
    __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
} from "@wordpress/components";
import { useState, useEffect, useRef } from "@wordpress/element";
import { applyFilters } from "@wordpress/hooks";
import { crop, image as imageIcon, update } from "@wordpress/icons";

/**
 * Internal dependencies
 */
import {
    IMAGE_MASK_TYPES,
    IMAGE_MASK_CLIP_PRESETS,
    IMAGE_MASK_SVG_PRESETS,
    IMAGE_MASK_SIZE_OPTIONS,
    IMAGE_MASK_POSITION_OPTIONS,
    IMAGE_MASK_REPEAT_OPTIONS,
    getMaskAssetUrl,
} from "./constants";
import { useBlockAttributes, useBlockSetAttributes } from "../../index";
import { InspectorPanel } from "../inspector";
import EBTextareaControl from "../../controls/textarea-control";
import CustomUploadControl from "./CustomUpload";
import PanelDocLinks from "../PanelDocLinks";
import { EB_LINKS } from "../../helpers/ebLinks";

/**
 * Filter contract for Essential Blocks Pro
 * -----------------------------------------------------------------------------
 * This panel emits three filter points where Pro injects controls without
 * forking this file. Each filter receives a single `props` object so Pro
 * can read/write the same prefixed attribute set as the Free panel.
 *
 * Filter points:
 *   • eb_image_mask_custom_upload(default, props)
 *       Rendered next to the SVG-mask preset picker (Normal state).
 *       default: free's <CustomUploadControl> (custom SVG mask is free).
 *       props: { getAttrName, attrValue, setAttributes, state: "normal" }
 *
 *   • eb_image_mask_custom_upload_hover(default, props)
 *       Same, for the Hover state (state: "hover").
 *
 *   • eb_image_mask_morphing(default, props)
 *       Rendered when type === "morphing".
 *       props: { getAttrName, attrValue, setAttributes }
 *
 * Pro registers via `addFilter` from "@wordpress/hooks":
 *   import { addFilter } from "@wordpress/hooks";
 *   addFilter(
 *     "eb_image_mask_custom_upload",
 *     "essential-blocks/pro",
 *     (defaultContent, props) => <MyControl {...props} />,
 *     10,
 *     2
 *   );
 *
 * This matches the convention used by every other Pro control extension
 * (shape-divider, dynamic-field, group-controls/*).
 */

/**
 * Visual grid picker for mask shapes. Each tile renders the SVG thumbnail
 * loaded from /assets/images/masks/<folder>/<value>.svg.
 */
const MaskShapeGrid = ({ presets, value, onChange, folder }) => {
    const gridStyle = {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "6px",
        margin: "8px 0 16px",
    };

    const tileStyle = (active) => ({
        aspectRatio: "1",
        padding: "8px",
        background: "#fff",
        border: active ? "2px solid #007cba" : "1px solid #ddd",
        borderRadius: "4px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
    });

    const imgStyle = {
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit: "contain",
    };

    return (
        <div style={gridStyle} className="eb-mask-shape-grid">
            {presets.map((p) => (
                <button
                    key={p.value}
                    type="button"
                    title={p.label}
                    aria-label={p.label}
                    aria-pressed={value === p.value}
                    style={tileStyle(value === p.value)}
                    onClick={() => onChange(p.value)}
                >
                    <img
                        src={getMaskAssetUrl(folder, p.value)}
                        alt={p.label}
                        style={imgStyle}
                    />
                </button>
            ))}
        </div>
    );
};

// Full-width "Custom" tile rendered below the SVG mask shape grid. Its click
// opens the WP Media Library (CustomUpload wraps it in MediaUpload).
const renderCustomShapeTile = ({ active, onClick, label }) => (
    <button
        type="button"
        title={label}
        aria-label={label}
        aria-pressed={active}
        className="eb-mask-shape-custom-tile"
        style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            padding: "8px",
            margin: "0 0 16px",
            background: "#fff",
            border: active ? "2px solid #007cba" : "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
            boxSizing: "border-box",
        }}
        onClick={onClick}
    >
        <img
            src={getMaskAssetUrl("svg-shapes", "custom")}
            alt={label}
            style={{ maxWidth: "32px", maxHeight: "32px", objectFit: "contain" }}
        />
        <span style={{ fontSize: "11px", lineHeight: 1.2, color: "#555" }}>
            {label}
        </span>
    </button>
);

const CLIP_PRESET_OPTIONS = Object.entries(IMAGE_MASK_CLIP_PRESETS).map(
    ([key, preset]) => ({ value: key, label: preset.label })
);

// Icon mapping for the Mask Type toggle. Lives here (not in constants.js) so
// the constants module remains pure data without JSX/icon imports.
const MASK_TYPE_ICONS = {
    svg: imageIcon,
    clip: crop,
    morphing: update,
};

const ProUpsell = ({ message }) => (
    <div className="eb-is-pro-message">
        <span className="dashicons dashicons-lock"></span>
        <span>
            <a
                href={EssentialBlocksLocalize?.upgrade_pro_url}
                target="_blank"
                rel="noopener noreferrer"
            >
                {__("Upgrade to Pro", "essential-blocks")}
            </a>{" "}
            {message}
        </span>
    </div>
);

/**
 * Caret-stable textarea for the Custom Clip Path field.
 *
 * `EBTextareaControl` works fine in callers that pass `attributes` and
 * `setAttributes` straight through Gutenberg props (e.g. interactive-promo).
 * It misbehaves here because `MaskingPanel` reads/writes attributes via
 * `useBlockAttributes` / `useBlockSetAttributes`, which dispatch through the
 * controls library's `useContextSelector` Provider. That path produces a
 * second render — after the Provider's `useLayoutEffect` notifies its
 * subscribers — on the same React commit cycle as the user's input event,
 * and WP's `TextareaControl` does not preserve the caret across that
 * round-trip; deleting from the middle snaps the cursor to the end.
 *
 * Buffering the value in this small wrapper while the user is typing makes
 * the textarea immune to the value-prop ping-pong: `internalValue` is the
 * source of truth during interaction, the parent attribute update still
 * fires so style.js can regenerate CSS live, and `userTypedRef` discards
 * the echo back through `value` (the typed character coming back through
 * `setAttributes` → context → render) so we never re-sync from it. Genuine
 * external updates (block switch, undo, AI fill) reach us with the ref
 * clear and refresh `internalValue` normally.
 */
const ClipPathTextarea = ({ value, onChange, help, label }) => {
    const [internalValue, setInternalValue] = useState(value || "");
    const userTypedRef = useRef(false);

    useEffect(() => {
        if (userTypedRef.current) {
            userTypedRef.current = false;
            return;
        }
        if ((value || "") !== internalValue) {
            setInternalValue(value || "");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleChange = (v) => {
        const next = v || "";
        userTypedRef.current = true;
        setInternalValue(next);
        if (next !== (value || "")) {
            onChange(next);
        }
    };

    // Defence-in-depth alongside the generation-time strip in
    // `style-js.js#clipMaskValue`: scrub `{`/`}` from the stored attribute so
    // a poisoned legacy value can't sit on disk waiting for any future code
    // path to forget the strip. Done on blur, not on each keystroke, because
    // mid-edit mutation breaks the caret-stability this textarea was
    // explicitly rebuilt for (see header comment).
    const handleBlur = () => {
        const cleaned = internalValue.replace(/[{}]/g, "");
        if (cleaned === internalValue) {
            return;
        }
        userTypedRef.current = true;
        setInternalValue(cleaned);
        if (cleaned !== (value || "")) {
            onChange(cleaned);
        }
    };

    return (
        <EBTextareaControl
            label={label}
            help={help}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            enableAi={false}
        />
    );
};

/**
 * Renders the Image Masking controls.
 *
 * Designed to drop into a block's `InspectorPanel.General` with zero props —
 * it self-wraps in an `InspectorPanel.PanelBody` and pulls attributes via
 * the block-context hooks. Override props are still accepted so the panel
 * can be reused inside `ImageComponent.GeneralTab`, Pro filter handlers,
 * or any context that already drives its own attribute scheme.
 *
 * UX model: the Mask Type chooser picks clip / svg / morphing. For clip + svg,
 * a Normal / Hover ToggleGroupControl decides which state's controls are
 * shown. The hover opt-in (`imageMaskHoverEnable`) lives inside the Hover tab
 * as a contextual "Enable Hover Mask" toggle — no global hover toggle that
 * could disagree with the visible controls.
 *
 * @param {Object}        [props]
 * @param {Function}      [props.getAttrName]    Optional attr-name resolver (for prefixed schemas)
 * @param {Function}      [props.attrValue]      Optional attribute reader (defaults to block context)
 * @param {Function}      [props.setAttributes]  Optional attribute writer (defaults to block context)
 * @param {boolean}       [props.wrapInPanel=true]  Whether to wrap in InspectorPanel.PanelBody
 * @param {string}        [props.title]          Panel title (defaults to "Image Masking")
 * @param {boolean}       [props.initialOpen=false] Panel collapsed state
 */
export const MaskingPanel = ({
    getAttrName: getAttrNameProp,
    attrValue: attrValueProp,
    setAttributes: setAttributesProp,
    wrapInPanel = true,
    title,
    initialOpen = false,
}) => {
    // Resolve attribute helpers from the block context when callers don't
    // pass overrides. This keeps the common case (`<MaskingPanel />`) free
    // of boilerplate while still letting GeneralTab + Pro filters inject
    // their own prefixed schemes.
    const contextAttributes = useBlockAttributes();
    const contextSetAttributes = useBlockSetAttributes();

    const getAttrName = getAttrNameProp || ((k) => k);
    const attrValue =
        attrValueProp ||
        ((k) => (contextAttributes ? contextAttributes[getAttrName(k)] : undefined));
    const setAttributes = setAttributesProp || contextSetAttributes;

    const enabled = attrValue("imageMaskEnable");
    const type = attrValue("imageMaskType");
    const hoverEnabled = attrValue("imageMaskHoverEnable");
    const isPro = EssentialBlocksLocalize?.is_pro_active === "true";

    // Custom mask-size value/unit (used only when "Mask Size" === "custom").
    // The schema/style generator already read this object; the UI to edit it
    // was missing — add a unit + range pair below the Mask Size dropdown.
    const maskCustomSize = attrValue("imageMaskCustomSize") || {
        size: 100,
        unit: "%",
    };
    const maskSizeUnitMax = (unit) => (unit === "px" ? 1000 : 100);

    // Local UI state — which tab (Normal / Hover) is active. Not persisted;
    // the panel always opens on Normal which is the most common entry point.
    const [activeState, setActiveState] = useState("normal");

    // Click-triggered upsell visibility. We don't write `imageMaskSvgPreset`
    // = "custom" when Pro is inactive (it would persist as a broken state
    // with no asset URL), so the upsell can't key off the attribute. This
    // local flag flips true only when the user clicks the Custom tile in
    // the current session and resets when they pick a different shape.

    const set = (key, value) =>
        setAttributes({ [getAttrName(key)]: value });

    // Renders the clip-path picker + custom-textarea pair, parameterised by
    // the attribute prefix so it works for both base ("imageMask") and hover
    // ("imageMaskHover") states.
    const renderClipControls = (prefix) => {
        const useCustomKey = prefix + "UseClipCustom";
        const presetKey = prefix + "ClipPreset";
        const customKey = prefix + "ClipCustom";
        const useCustom = attrValue(useCustomKey);
        return (
            <>
                {!useCustom && (
                    <MaskShapeGrid
                        presets={CLIP_PRESET_OPTIONS}
                        value={attrValue(presetKey)}
                        onChange={(v) => set(presetKey, v)}
                        folder="clip-paths"
                    />
                )}
                <ToggleControl
                    label={__("Use Custom Clip Path", "essential-blocks")}
                    checked={useCustom}
                    onChange={() => set(useCustomKey, !useCustom)}
                    __nextHasNoMarginBottom
                />
                {useCustom && (
                    <ClipPathTextarea
                        label={__("Custom Clip Path", "essential-blocks")}
                        help={
                            <>
                                {__(
                                    "Enter your custom clip path value. You can use ",
                                    "essential-blocks"
                                )}
                                <ExternalLink href="https://bennettfeely.com/clippy/">
                                    {__("Clippy", "essential-blocks")}
                                </ExternalLink>
                                {__(
                                    " to generate your custom clip path.",
                                    "essential-blocks"
                                )}
                            </>
                        }
                        value={attrValue(customKey) || ""}
                        onChange={(v) => set(customKey, v)}
                    />
                )}
            </>
        );
    };

    // Renders the SVG preset picker plus Pro's custom-upload filter slot.
    // `state` switches the filter target between "normal" and "hover" which
    // also drives Pro's read/write attribute pair.
    //
    // The "custom" preset is special: it's rendered as a full-width tile
    // BELOW the grid (not in the loop) so its click handler can branch on
    // the upload gate. The tile itself is wired to MediaUpload (CustomUpload)
    // so a single click opens the media library — no separate "Upload Custom
    // SVG" button.
    const renderSvgPicker = (prefix, state) => {
        const presetKey = prefix + "SvgPreset";
        const filterName =
            state === "hover"
                ? "eb_image_mask_custom_upload_hover"
                : "eb_image_mask_custom_upload";

        // Strip "custom" from the regular grid — rendered separately below.
        const regularPresets = IMAGE_MASK_SVG_PRESETS.filter(
            (p) => p.value !== "custom"
        );
        const customPreset = IMAGE_MASK_SVG_PRESETS.find(
            (p) => p.value === "custom"
        );
        const isCustomActive = attrValue(presetKey) === "custom";

        return (
            <>
                <MaskShapeGrid
                    presets={regularPresets}
                    value={attrValue(presetKey)}
                    onChange={(v) => {
                        set(presetKey, v);
                    }}
                    folder="svg-shapes"
                />

                {/* Custom SVG upload. Free owns it (free renders the mask);
                    it is passed as the filter's default so Pro 3.3.0, which
                    still hooks this filter with its own copy, replaces it
                    rather than rendering a second tile. */}
                {customPreset &&
                    applyFilters(
                        filterName,
                        <CustomUploadControl
                            getAttrName={getAttrName}
                            attrValue={attrValue}
                            setAttributes={setAttributes}
                            state={state}
                            customPreset={customPreset}
                            isCustomActive={isCustomActive}
                            renderCustomShapeTile={renderCustomShapeTile}
                        />,
                        {
                            getAttrName,
                            attrValue,
                            setAttributes,
                            state,
                            customPreset,
                            isCustomActive,
                            renderCustomShapeTile,
                        }
                    )}
            </>
        );
    };

    const body = (
        <>
            <ToggleControl
                label={__("Enable Image Masking", "essential-blocks")}
                checked={enabled}
                onChange={() => set("imageMaskEnable", !enabled)}
                __nextHasNoMarginBottom
            />

            {enabled && (
                <>
                    <p
                        style={{
                            fontStyle: "italic",
                            fontSize: "12px",
                            color: "#757575",
                            margin: "8px 0 12px",
                        }}
                    >
                        {__(
                            "Note: Height, Width, and Radius settings may not apply as expected.",
                            "essential-blocks"
                        )}
                    </p>
                    <ToggleGroupControl
                        label={__("Mask Type", "essential-blocks")}
                        value={type}
                        onChange={(v) => set("imageMaskType", v)}
                        isBlock
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    >
                        {IMAGE_MASK_TYPES.map((opt) => (
                            <ToggleGroupControlOptionIcon
                                key={opt.value}
                                value={opt.value}
                                icon={MASK_TYPE_ICONS[opt.value]}
                                label={
                                    opt.isPro && !isPro
                                        ? `${opt.label} ${__("(Pro)", "essential-blocks")}`
                                        : opt.label
                                }
                            />
                        ))}
                    </ToggleGroupControl>

                    {(type === "clip" || type === "svg") && (
                        <>
                            <ToggleGroupControl
                                // label={__("State", "essential-blocks")}
                                value={activeState}
                                onChange={setActiveState}
                                isBlock
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            >
                                <ToggleGroupControlOption
                                    value="normal"
                                    label={__("Normal", "essential-blocks")}
                                />
                                <ToggleGroupControlOption
                                    value="hover"
                                    label={__("Hover", "essential-blocks")}
                                />
                            </ToggleGroupControl>

                            {activeState === "normal" && (
                                <>
                                    {type === "clip" &&
                                        renderClipControls("imageMask")}
                                    {type === "svg" &&
                                        renderSvgPicker("imageMask", "normal")}
                                </>
                            )}

                            {activeState === "hover" && (
                                <>
                                    <ToggleControl
                                        label={__(
                                            "Enable Hover Mask",
                                            "essential-blocks"
                                        )}
                                        checked={hoverEnabled}
                                        onChange={() =>
                                            set(
                                                "imageMaskHoverEnable",
                                                !hoverEnabled
                                            )
                                        }
                                        __nextHasNoMarginBottom
                                    />
                                    {hoverEnabled && (
                                        <>
                                            {type === "clip" &&
                                                renderClipControls(
                                                    "imageMaskHover"
                                                )}
                                            {type === "svg" &&
                                                renderSvgPicker(
                                                    "imageMaskHover",
                                                    "hover"
                                                )}
                                            <RangeControl
                                                label={__(
                                                    "Hover Transition (ms)",
                                                    "essential-blocks"
                                                )}
                                                value={attrValue(
                                                    "imageMaskHoverTransition"
                                                )}
                                                min={0}
                                                max={2000}
                                                step={50}
                                                onChange={(v) =>
                                                    set(
                                                        "imageMaskHoverTransition",
                                                        v
                                                    )
                                                }
                                                __nextHasNoMarginBottom
                                                __next40pxDefaultSize
                                            />
                                            <TextControl
                                                label={__(
                                                    "Hover Selector",
                                                    "essential-blocks"
                                                )}
                                                value={
                                                    attrValue(
                                                        "imageMaskHoverSelector"
                                                    ) || ""
                                                }
                                                placeholder=".not-masked-element, #not-masked-element"
                                                help={__(
                                                    "Enter the selector for the element you want to apply the hover effect on. If you leave this field empty, the hover effect will be applied on hover for the full block.",
                                                    "essential-blocks"
                                                )}
                                                onChange={(v) =>
                                                    set(
                                                        "imageMaskHoverSelector",
                                                        v
                                                    )
                                                }
                                                __nextHasNoMarginBottom
                                                __next40pxDefaultSize
                                            />
                                        </>
                                    )}
                                </>
                            )}

                            {/* Size / Position / Repeat are shared between
                                Normal and Hover for SVG masks (matches EA's
                                layout — these controls live below the tabs). */}
                            {type === "svg" && (
                                <>
                                    <SelectControl
                                        label={__(
                                            "Mask Size",
                                            "essential-blocks"
                                        )}
                                        value={attrValue("imageMaskSize")}
                                        options={IMAGE_MASK_SIZE_OPTIONS}
                                        onChange={(v) =>
                                            set("imageMaskSize", v)
                                        }
                                        __next40pxDefaultSize
                                        __nextHasNoMarginBottom
                                    />
                                    {attrValue("imageMaskSize") ===
                                        "custom" && (
                                            <>
                                                <SelectControl
                                                    label={__(
                                                        "Custom Size Unit",
                                                        "essential-blocks"
                                                    )}
                                                    value={
                                                        maskCustomSize.unit || "px"
                                                    }
                                                    options={[
                                                        {
                                                            label: "%",
                                                            value: "%",
                                                        },
                                                        {
                                                            label: "px",
                                                            value: "px",
                                                        },
                                                    ]}
                                                    onChange={(unit) =>
                                                        set(
                                                            "imageMaskCustomSize",
                                                            {
                                                                ...maskCustomSize,
                                                                unit,
                                                            }
                                                        )
                                                    }
                                                    __next40pxDefaultSize
                                                    __nextHasNoMarginBottom
                                                />
                                                <RangeControl
                                                    label={__(
                                                        "Custom Size",
                                                        "essential-blocks"
                                                    )}
                                                    value={
                                                        maskCustomSize.size ?? 100
                                                    }
                                                    min={0}
                                                    max={maskSizeUnitMax(
                                                        maskCustomSize.unit || "px"
                                                    )}
                                                    onChange={(size) =>
                                                        set(
                                                            "imageMaskCustomSize",
                                                            {
                                                                ...maskCustomSize,
                                                                size:
                                                                    size ?? 100,
                                                            }
                                                        )
                                                    }
                                                    __next40pxDefaultSize
                                                    __nextHasNoMarginBottom
                                                />
                                            </>
                                        )}
                                    <SelectControl
                                        label={__(
                                            "Mask Position",
                                            "essential-blocks"
                                        )}
                                        value={attrValue("imageMaskPosition")}
                                        options={IMAGE_MASK_POSITION_OPTIONS}
                                        onChange={(v) =>
                                            set("imageMaskPosition", v)
                                        }
                                        __next40pxDefaultSize
                                        __nextHasNoMarginBottom
                                    />
                                    <SelectControl
                                        label={__(
                                            "Mask Repeat",
                                            "essential-blocks"
                                        )}
                                        value={attrValue("imageMaskRepeat")}
                                        options={IMAGE_MASK_REPEAT_OPTIONS}
                                        onChange={(v) =>
                                            set("imageMaskRepeat", v)
                                        }
                                        __next40pxDefaultSize
                                        __nextHasNoMarginBottom
                                    />
                                </>
                            )}
                        </>
                    )}

                    {type === "morphing" && (
                        <>
                            {/* Pro injects morphing controls (frames, duration,
                                easing, loop) via this filter. */}
                            {applyFilters("eb_image_mask_morphing", null, {
                                getAttrName,
                                attrValue,
                                setAttributes,
                            })}
                            {!isPro && (
                                <ProUpsell
                                    message={__(
                                        "for this premium feature!",
                                        "essential-blocks"
                                    )}
                                />
                            )}
                        </>
                    )}
                </>
            )}
            <PanelDocLinks
                doc={EB_LINKS.docs.imageMasking}
                demo={EB_LINKS.demos.imageMasking}
            />
        </>
    );

    if (!wrapInPanel) {
        return body;
    }

    return (
        <InspectorPanel.PanelBody
            title={title || __("Image Masking", "essential-blocks")}
            initialOpen={initialOpen}
        >
            {body}
        </InspectorPanel.PanelBody>
    );
};

export default MaskingPanel;
