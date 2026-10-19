/**
 * Custom SVG upload UI for the Image masking panel (Normal and Hover).
 *
 * Owns the Custom tile: the initial MediaUpload trigger, the
 * unfiltered-uploads security gate, the preview thumbnail after a mask URL
 * is set, and the Replace / Remove actions. `state` tells the component
 * which attribute pair to read/write.
 *
 * This is a free feature: free already renders the custom mask
 * (style-js.js). MaskingPanel passes it as the default value of the
 * `eb_image_mask_custom_upload(_hover)` filters, so Pro 3.3.0, which still
 * hooks those filters with its own copy, replaces it instead of doubling it.
 */
import { __ } from "@wordpress/i18n";
import { MediaUpload, MediaUploadCheck } from "@wordpress/block-editor";
import { Button } from "@wordpress/components";
import { useState } from "@wordpress/element";
import {
    SvgUploadWarningModal,
    isSvgUploadAllowed,
} from "./SvgUploadWarningModal";
import "./CustomUpload.scss";

// Attribute name resolvers — keeps the component agnostic about state.
const presetAttr = (state) =>
    state === "hover" ? "imageMaskHoverSvgPreset" : "imageMaskSvgPreset";
const urlAttr = (state) =>
    state === "hover" ? "imageMaskHoverSvgCustomUrl" : "imageMaskSvgCustomUrl";
const idAttr = (state) =>
    state === "hover" ? "imageMaskHoverSvgCustomId" : "imageMaskSvgCustomId";

const CustomUploadControl = ({
    getAttrName,
    attrValue,
    setAttributes,
    state,
    customPreset,
    isCustomActive,
    renderCustomShapeTile,
}) => {
    const url = attrValue(urlAttr(state));
    const id = attrValue(idAttr(state));
    const [showSvgWarning, setShowSvgWarning] = useState(false);

    const onSelect = (media) => {
        // Defence in depth: the media library may surface non-SVG items if a
        // sanitizer plugin remaps types. Reject anything that isn't an SVG so
        // the saved URL is always a vector mask.
        if (media?.mime && media.mime !== "image/svg+xml") {
            return;
        }
        setAttributes({
            // Lock the preset to "custom" so the rest of the UI (preset
            // grid highlight, save-time CSS) sees this as the active shape.
            [getAttrName(presetAttr(state))]: "custom",
            [getAttrName(urlAttr(state))]: media?.url || "",
            [getAttrName(idAttr(state))]: media?.id || 0,
        });
    };

    const onRemove = () => {
        setAttributes({
            [getAttrName(urlAttr(state))]: "",
            [getAttrName(idAttr(state))]: 0,
        });
    };

    // Wraps the MediaUpload `open` callback with the SVG security gate.
    // `EssentialBlocksLocalize.unfilteredFile` and `is_admin_user` are PHP
    // string booleans set by Free's Scripts.php — `isSvgUploadAllowed`
    // returns true only when both equal `"true"`.
    const guarded = (open) => () => {
        if (!isSvgUploadAllowed()) {
            setShowSvgWarning(true);
            return;
        }
        open();
    };

    return (
        <>
            <MediaUploadCheck>
                <MediaUpload
                    allowedTypes={["image/svg+xml"]}
                    value={id || undefined}
                    onSelect={onSelect}
                    render={({ open }) =>
                        url ? (
                            // Post-upload preview with Replace + Remove. The
                            // gate also runs on Replace — Remove just clears
                            // the saved value, no upload involved.
                            <div className="eb-mask-custom-upload">
                                <img
                                    className="eb-mask-custom-upload__preview"
                                    src={url}
                                    alt=""
                                />
                                <div className="eb-mask-custom-upload__actions">
                                    <Button
                                        variant="secondary"
                                        onClick={guarded(open)}
                                    >
                                        {__(
                                            "Replace SVG",
                                            "essential-blocks"
                                        )}
                                    </Button>
                                    <Button
                                        variant="tertiary"
                                        isDestructive
                                        onClick={onRemove}
                                    >
                                        {__("Remove", "essential-blocks")}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // No URL yet → render the initial Custom tile.
                            // Free passes its own renderCustomShapeTile through
                            // the filter so the UI stays visually identical to
                            // the preset grid above it.
                            renderCustomShapeTile?.({
                                active: !!isCustomActive,
                                onClick: guarded(open),
                                label:
                                    customPreset?.label ||
                                    __("Custom", "essential-blocks"),
                            }) || null
                        )
                    }
                />
            </MediaUploadCheck>
            <SvgUploadWarningModal
                isOpen={showSvgWarning}
                onClose={() => setShowSvgWarning(false)}
            />
        </>
    );
};

export default CustomUploadControl;
