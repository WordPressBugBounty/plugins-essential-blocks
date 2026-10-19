/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { ToggleControl } from "@wordpress/components";

/**
 * Internal dependencies
 */
import OverlayControl from "./overlayControl";
import BgControl from "./bgControl";
import { useBlockSetAttributes, useBlockAttributes } from "../../hooks";

export default function BackgroundControl({
    controlName,
    noOverlay = false,
    noMainBgi = false,
    noOverlayBgi = false,
    noTransition = false,
    hasVideo = false,

    //
    forButton = false,
    onColorChange = undefined
}) {
    const attributes = useBlockAttributes();
    const setAttributes = useBlockSetAttributes();

    const {
        [`${controlName}isBgOverlay`]: isBgOverlay,
        [`${controlName}backgroundType`]: backgroundType,
    } = attributes;

    // Video is a Pro type with its own dedicated overlay. The Free classic /
    // gradient overlay is meaningless there, so the whole "Enable Overlay"
    // section is hidden when Video is active — each background type shows only
    // its own settings. The attribute is untouched, so switching back to
    // Classic restores whatever overlay was configured.
    const isVideoType = hasVideo === true && backgroundType === "video";

    return (
        <>
            <BgControl
                controlName={controlName}
                noMainBgi={forButton === true ? true : noMainBgi}
                noTransition={noTransition}
                onColorChange={onColorChange}
                hasVideo={forButton === true ? false : hasVideo}
            />

            {noOverlay === false && forButton == false && !isVideoType && (
                <>
                    <hr />

                    <ToggleControl
                        label={__("Enable Overlay", "essential-blocks")}
                        checked={isBgOverlay}
                        onChange={() =>
                            setAttributes({
                                [`${controlName}isBgOverlay`]: !isBgOverlay,
                            })
                        }
                        __nextHasNoMarginBottom
                    />

                    {isBgOverlay && (
                        <OverlayControl
                            controlName={controlName}
                            noOverlayBgi={noOverlayBgi}
                            noTransition={noTransition}
                        />
                    )}
                </>
            )}
        </>
    );
}
