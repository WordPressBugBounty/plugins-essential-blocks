import { __ } from "@wordpress/i18n";
import { MediaUpload } from "@wordpress/block-editor";
import {
    SelectControl,
    RangeControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

/**
 * Internal dependencies
 */
import GradientColorControl from "../gradient-color-controller";
import UnitControl from "../unit-control";
import ColorControl from "../color-control";
import ImageAvatar from "../image-avatar";
import WithResButtons from "../withResButtons";
import { BgAttachmentControl, getBgDevicePrefix } from "./responsiveSelect";
import { WithResponsiveOptions } from "../../components";
import { useBlockAttributes, useBlockSetAttributes, useDeviceType } from "../../hooks";

import { ImageComponent } from "../../components/Image";

export default function bgControl({
    controlName,
    noMainBgi,
    noTransition,
    hasVideo = false
}) {
    const setAttributes = useBlockSetAttributes();
    const attributes = useBlockAttributes();
    const resOption = useDeviceType();

    const {
        [`${controlName}bg_hoverType`]: bg_hoverType = "normal",
        [`${controlName}bg_transition`]: bg_transition,

        //  attributes for bg_hoverType normal start  ⬇
        [`${controlName}backgroundType`]: backgroundType = "classic",
        [`${controlName}backgroundColor`]: backgroundColor,
        [`${controlName}gradientColor`]: gradientColor,
        [`${controlName}bgImageURL`]: bgImageURL,
        [`${controlName}bgImageID`]: bgImageID,

        [`${controlName}backgroundSize`]: backgroundSize,
        [`${controlName}bgImgCustomSize`]: bgImgCustomSize,
        [`${controlName}bgImgCustomSizeUnit`]: bgImgCustomSizeUnit,
        [`${controlName}bgImgPos`]: bgImgPos,
        [`${controlName}bgImgcustomPosX`]: bgImgcustomPosX,
        [`${controlName}bgImgcustomPosXUnit`]: bgImgcustomPosXUnit,
        [`${controlName}bgImgcustomPosY`]: bgImgcustomPosY,
        [`${controlName}bgImgcustomPosYUnit`]: bgImgcustomPosYUnit,
        [`${controlName}bgImgRepeat`]: bgImgRepeat,

        [`TAB${controlName}backgroundSize`]: TABbackgroundSize,
        [`TAB${controlName}bgImgCustomSize`]: TABbgImgCustomSize,
        [`TAB${controlName}bgImgCustomSizeUnit`]: TABbgImgCustomSizeUnit,
        [`TAB${controlName}bgImgPos`]: TABbgImgPos,
        [`TAB${controlName}bgImgcustomPosX`]: TABbgImgcustomPosX,
        [`TAB${controlName}bgImgcustomPosXUnit`]: TABbgImgcustomPosXUnit,
        [`TAB${controlName}bgImgcustomPosY`]: TABbgImgcustomPosY,
        [`TAB${controlName}bgImgcustomPosYUnit`]: TABbgImgcustomPosYUnit,
        [`TAB${controlName}bgImgRepeat`]: TABbgImgRepeat,

        [`MOB${controlName}backgroundSize`]: MOBbackgroundSize,
        [`MOB${controlName}bgImgCustomSize`]: MOBbgImgCustomSize,
        [`MOB${controlName}bgImgCustomSizeUnit`]: MOBbgImgCustomSizeUnit,
        [`MOB${controlName}bgImgPos`]: MOBbgImgPos,
        [`MOB${controlName}bgImgcustomPosX`]: MOBbgImgcustomPosX,
        [`MOB${controlName}bgImgcustomPosXUnit`]: MOBbgImgcustomPosXUnit,
        [`MOB${controlName}bgImgcustomPosY`]: MOBbgImgcustomPosY,
        [`MOB${controlName}bgImgcustomPosYUnit`]: MOBbgImgcustomPosYUnit,
        [`MOB${controlName}bgImgRepeat`]: MOBbgImgRepeat,
        //  attributes for bg_hoverType normal end

        //  attributes for bg_hoverType hover start  ⬇
        [`hov_${controlName}backgroundType`]: hov_backgroundType,
        [`hov_${controlName}backgroundColor`]: hov_backgroundColor,
        [`hov_${controlName}gradientColor`]: hov_gradientColor,
        [`hov_${controlName}bgImageURL`]: hov_bgImageURL,
        [`hov_${controlName}bgImageID`]: hov_bgImageID,

        [`hov_${controlName}backgroundSize`]: hov_backgroundSize,
        [`hov_${controlName}bgImgCustomSize`]: hov_bgImgCustomSize,
        [`hov_${controlName}bgImgCustomSizeUnit`]: hov_bgImgCustomSizeUnit,
        [`hov_${controlName}bgImgPos`]: hov_bgImgPos,
        [`hov_${controlName}bgImgcustomPosX`]: hov_bgImgcustomPosX,
        [`hov_${controlName}bgImgcustomPosXUnit`]: hov_bgImgcustomPosXUnit,
        [`hov_${controlName}bgImgcustomPosY`]: hov_bgImgcustomPosY,
        [`hov_${controlName}bgImgcustomPosYUnit`]: hov_bgImgcustomPosYUnit,
        [`hov_${controlName}bgImgRepeat`]: hov_bgImgRepeat,

        [`hov_TAB${controlName}backgroundSize`]: hov_TABbackgroundSize,
        [`hov_TAB${controlName}bgImgCustomSize`]: hov_TABbgImgCustomSize,
        [`hov_TAB${controlName}bgImgCustomSizeUnit`]:
        hov_TABbgImgCustomSizeUnit,
        [`hov_TAB${controlName}bgImgPos`]: hov_TABbgImgPos,
        [`hov_TAB${controlName}bgImgcustomPosX`]: hov_TABbgImgcustomPosX,
        [`hov_TAB${controlName}bgImgcustomPosXUnit`]:
        hov_TABbgImgcustomPosXUnit,
        [`hov_TAB${controlName}bgImgcustomPosY`]: hov_TABbgImgcustomPosY,
        [`hov_TAB${controlName}bgImgcustomPosYUnit`]:
        hov_TABbgImgcustomPosYUnit,
        [`hov_TAB${controlName}bgImgRepeat`]: hov_TABbgImgRepeat,

        [`hov_MOB${controlName}backgroundSize`]: hov_MOBbackgroundSize,
        [`hov_MOB${controlName}bgImgCustomSize`]: hov_MOBbgImgCustomSize,
        [`hov_MOB${controlName}bgImgCustomSizeUnit`]:
        hov_MOBbgImgCustomSizeUnit,
        [`hov_MOB${controlName}bgImgPos`]: hov_MOBbgImgPos,
        [`hov_MOB${controlName}bgImgcustomPosX`]: hov_MOBbgImgcustomPosX,
        [`hov_MOB${controlName}bgImgcustomPosXUnit`]:
        hov_MOBbgImgcustomPosXUnit,
        [`hov_MOB${controlName}bgImgcustomPosY`]: hov_MOBbgImgcustomPosY,
        [`hov_MOB${controlName}bgImgcustomPosYUnit`]:
        hov_MOBbgImgcustomPosYUnit,
        [`hov_MOB${controlName}bgImgRepeat`]: hov_MOBbgImgRepeat,
        //  attributes for bg_hoverType hover end
    } = attributes;

    // Background image is responsive: the picker edits the active device's key
    // and Tablet/Mobile fall back to the next larger device when unset.
    const devicePrefix = getBgDevicePrefix(resOption);
    const bgImageURLKey = `${devicePrefix}${controlName}bgImageURL`;
    const bgImageIDKey = `${devicePrefix}${controlName}bgImageID`;
    const hov_bgImageURLKey = `hov_${devicePrefix}${controlName}bgImageURL`;
    const hov_bgImageIDKey = `hov_${devicePrefix}${controlName}bgImageID`;
    const getEffectiveImage = (desktop, tab, mob) =>
        resOption === "Mobile"
            ? mob || tab || desktop
            : resOption === "Tablet"
                ? tab || desktop
                : desktop;
    const effectiveBgImageURL = getEffectiveImage(
        bgImageURL,
        attributes[`TAB${controlName}bgImageURL`],
        attributes[`MOB${controlName}bgImageURL`]
    );
    const hov_effectiveBgImageURL = getEffectiveImage(
        hov_bgImageURL,
        attributes[`hov_TAB${controlName}bgImageURL`],
        attributes[`hov_MOB${controlName}bgImageURL`]
    );

    return (
        <>
            <ToggleGroupControl

                value={bg_hoverType}
                onChange={(newValue) =>
                    setAttributes({
                        [`${controlName}bg_hoverType`]: newValue,
                    })
                }
                isBlock
__next40pxDefaultSize
__nextHasNoMarginBottom
            >
                {[
                    {
                        label: __("Normal", "essential-blocks"),
                        value: "normal",
                    },
                    {
                        label: __("Hover", "essential-blocks"),
                        value: "hover",
                    },
                ].map(({ value, label }, index) => (
                    <ToggleGroupControlOption
                        key={index}
                        value={value}
                        label={label}
                    />
                ))}
            </ToggleGroupControl>

            {bg_hoverType === "normal" && (
                <>
                    <ToggleGroupControl
                        label={__("Background Type", "essential-blocks")}

                        value={backgroundType}
                        onChange={(newValue) =>
                            setAttributes({
                                [`${controlName}backgroundType`]: newValue,
                            })
                        }
                        isBlock
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    >
                        {[
                            {
                                label: __("Classic", "essential-blocks"),
                                value: "classic",
                            },
                            {
                                label: __("Gradient", "essential-blocks"),
                                value: "gradient",
                            },
                            ...(hasVideo === true
                                ? [
                                      {
                                          label:
                                              EssentialBlocksLocalize?.is_pro_active === "false"
                                                  ? __("Video (Pro)", "essential-blocks")
                                                  : __("Video", "essential-blocks"),
                                          value: "video",
                                      },
                                  ]
                                : []),
                        ].map(({ value, label }, index) => (
                            <ToggleGroupControlOption
                                key={index}
                                value={value}
                                label={label}
                            />
                        ))}
                    </ToggleGroupControl>

                    {backgroundType === "classic" && (
                        <>
                            <ColorControl
                                label={__(
                                    "Background Color",
                                    "essential-blocks"
                                )}
                                color={backgroundColor}
                                isGradient={true}
                                attributeName={`${controlName}backgroundColor`}
                            />

                            {noMainBgi === false && (
                                <>
                                    <WithResButtons
                                        label={__(
                                            "Background Image",
                                            "essential-blocks"
                                        )}
                                    />

                                    <ImageComponent.GeneralTab
                                        onSelect={({ url, id }) =>
                                            setAttributes({
                                                [bgImageURLKey]:
                                                    url,
                                                // The ID is written as a string:
                                                // the attribute schema is
                                                // `type: "string"`, and the parser
                                                // drops a comment attribute whose
                                                // type does not match its schema,
                                                // so a numeric ID would not
                                                // survive a reload — and the media
                                                // modal could then no longer
                                                // preselect the current image.
                                                [bgImageIDKey]: id
                                                    ? String(id)
                                                    : "",
                                            })
                                        }
                                        onRemove={() =>
                                            setAttributes({
                                                [bgImageURLKey]: "",
                                                [bgImageIDKey]: "",
                                            })
                                        }
                                        value={attributes[bgImageURLKey]}
                                        imageAttrProps={{
                                            imageUrl: bgImageURLKey,
                                            imageId: bgImageIDKey,
                                        }}
                                        hasTag={false}
                                        hasCaption={false}
                                        hasStyle={false}
                                        hasLink={false}
                                        showInPanel={false}
                                    />

                                    {!attributes[bgImageURLKey] && effectiveBgImageURL && (
                                        <p style={{ marginTop: "-10px", paddingBottom: "10px" }}>
                                            <i>
                                                {__(
                                                    "Inherited from a larger device. Select an image to override it here.",
                                                    "essential-blocks"
                                                )}
                                            </i>
                                        </p>
                                    )}

                                    {effectiveBgImageURL && (
                                        <>
                                            {resOption === "Desktop" && (
                                                <>
                                                    <WithResponsiveOptions
                                                        label="Position"
                                                    >
                                                        <SelectControl
                                                            value={bgImgPos}
                                                            options={[
                                                                {
                                                                    label: __(
                                                                        "Default",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Center Center",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "center center",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Center Left",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "center left",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Center Right",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "center right",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Top Center",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "top center",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Top Left",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "top left",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Top Right",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "top right",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Bottom Center",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "bottom center",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Bottom Left",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "bottom left",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Bottom Right",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "bottom right",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Custom",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "custom",
                                                                },
                                                            ]}
                                                            onChange={(
                                                                bgImgPos
                                                            ) =>
                                                                setAttributes({
                                                                    [`${controlName}bgImgPos`]:
                                                                        bgImgPos,
                                                                })
                                                            }
                                                            __next40pxDefaultSize
                                                            __nextHasNoMarginBottom
                                                        />
                                                    </WithResponsiveOptions>

                                                    {bgImgPos === "custom" && (
                                                        <>
                                                            <UnitControl
                                                                selectedUnit={
                                                                    bgImgcustomPosXUnit
                                                                }
                                                                unitTypes={[
                                                                    {
                                                                        label: "px",
                                                                        value: "px",
                                                                    },
                                                                    {
                                                                        label: "em",
                                                                        value: "em",
                                                                    },
                                                                    {
                                                                        label: "%",
                                                                        value: "%",
                                                                    },
                                                                ]}
                                                                onClick={(
                                                                    bgImgcustomPosXUnit
                                                                ) =>
                                                                    setAttributes(
                                                                        {
                                                                            [`${controlName}bgImgcustomPosXUnit`]:
                                                                                bgImgcustomPosXUnit,
                                                                        }
                                                                    )
                                                                }
                                                            />

                                                            <WithResponsiveOptions
                                                                label="X Position">
                                                                <RangeControl
                                                                    value={
                                                                        bgImgcustomPosX
                                                                    }
                                                                    min={-2000}
                                                                    max={
                                                                        // bgImgcustomPosXUnit === "px" ?
                                                                        2000
                                                                        //  : 100
                                                                    }
                                                                    onChange={(
                                                                        bgImgcustomPosX
                                                                    ) =>
                                                                        setAttributes(
                                                                            {
                                                                                [`${controlName}bgImgcustomPosX`]:
                                                                                    bgImgcustomPosX,
                                                                            }
                                                                        )
                                                                    }
                                                                    __nextHasNoMarginBottom
                                                                    __next40pxDefaultSize
                                                                />
                                                            </WithResponsiveOptions>

                                                            <UnitControl
                                                                selectedUnit={
                                                                    bgImgcustomPosYUnit
                                                                }
                                                                unitTypes={[
                                                                    {
                                                                        label: "px",
                                                                        value: "px",
                                                                    },
                                                                    {
                                                                        label: "em",
                                                                        value: "em",
                                                                    },
                                                                    {
                                                                        label: "%",
                                                                        value: "%",
                                                                    },
                                                                ]}
                                                                onClick={(
                                                                    bgImgcustomPosYUnit
                                                                ) =>
                                                                    setAttributes(
                                                                        {
                                                                            [`${controlName}bgImgcustomPosYUnit`]:
                                                                                bgImgcustomPosYUnit,
                                                                        }
                                                                    )
                                                                }
                                                            />
                                                            <WithResponsiveOptions
                                                                label="Y Position">
                                                                <RangeControl
                                                                    value={
                                                                        bgImgcustomPosY
                                                                    }
                                                                    min={-2000}
                                                                    max={
                                                                        // bgImgcustomPosYUnit === "px" ?
                                                                        2000
                                                                        // : 100
                                                                    }
                                                                    step={
                                                                        bgImgcustomPosYUnit ===
                                                                            "px"
                                                                            ? 1
                                                                            : 0.1
                                                                    }
                                                                    onChange={(
                                                                        bgImgcustomPosY
                                                                    ) =>
                                                                        setAttributes(
                                                                            {
                                                                                [`${controlName}bgImgcustomPosY`]:
                                                                                    bgImgcustomPosY,
                                                                            }
                                                                        )
                                                                    }
                                                                    __nextHasNoMarginBottom
                                                                    __next40pxDefaultSize
                                                                />
                                                            </WithResponsiveOptions>
                                                        </>
                                                    )}

                                                    <BgAttachmentControl
                                                        name={`${controlName}bgImgAttachment`}
                                                    />

                                                    <WithResponsiveOptions
                                                        label="Repeat">
                                                        <SelectControl
                                                            value={bgImgRepeat}
                                                            options={[
                                                                {
                                                                    label: __(
                                                                        "Default",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "No-repeat",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "no-repeat",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Repeat",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "repeat",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Repeat-x",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "repeat-x",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Repeat-y",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "repeat-y",
                                                                },
                                                            ]}
                                                            onChange={(
                                                                bgImgRepeat
                                                            ) =>
                                                                setAttributes({
                                                                    [`${controlName}bgImgRepeat`]:
                                                                        bgImgRepeat,
                                                                })
                                                            }
                                                            __next40pxDefaultSize
                                                            __nextHasNoMarginBottom
                                                        />
                                                    </WithResponsiveOptions>

                                                    <WithResButtons
                                                        label="Size">
                                                        <SelectControl
                                                            value={
                                                                backgroundSize
                                                            }
                                                            options={[
                                                                {
                                                                    label: __(
                                                                        "Default",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Auto",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "auto",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Cover",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "cover",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Contain",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "contain",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Custom",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "custom",
                                                                },
                                                            ]}
                                                            onChange={(
                                                                backgroundSize
                                                            ) =>
                                                                setAttributes({
                                                                    [`${controlName}backgroundSize`]:
                                                                        backgroundSize,
                                                                })
                                                            }
                                                            __next40pxDefaultSize
                                                            __nextHasNoMarginBottom
                                                        />
                                                    </WithResButtons>

                                                    {backgroundSize ===
                                                        "custom" && (
                                                            <>
                                                                <UnitControl
                                                                    selectedUnit={
                                                                        bgImgCustomSizeUnit
                                                                    }
                                                                    unitTypes={[
                                                                        {
                                                                            label: "px",
                                                                            value: "px",
                                                                        },
                                                                        {
                                                                            label: "em",
                                                                            value: "em",
                                                                        },
                                                                        {
                                                                            label: "%",
                                                                            value: "%",
                                                                        },
                                                                    ]}
                                                                    onClick={(
                                                                        bgImgCustomSizeUnit
                                                                    ) =>
                                                                        setAttributes(
                                                                            {
                                                                                [`${controlName}bgImgCustomSizeUnit`]:
                                                                                    bgImgCustomSizeUnit,
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <WithResButtons
                                                                    label="Width">
                                                                    <RangeControl
                                                                        value={
                                                                            bgImgCustomSize
                                                                        }
                                                                        min={0}
                                                                        max={
                                                                            bgImgCustomSizeUnit ===
                                                                                "px"
                                                                                ? 2000
                                                                                : 100
                                                                        }
                                                                        step={
                                                                            bgImgCustomSizeUnit ===
                                                                                "px"
                                                                                ? 1
                                                                                : 0.1
                                                                        }
                                                                        onChange={(
                                                                            bgImgCustomSize
                                                                        ) =>
                                                                            setAttributes(
                                                                                {
                                                                                    [`${controlName}bgImgCustomSize`]:
                                                                                        bgImgCustomSize,
                                                                                }
                                                                            )
                                                                        }
                                                                        __nextHasNoMarginBottom
                                                                        __next40pxDefaultSize
                                                                    />
                                                                </WithResButtons>
                                                            </>
                                                        )}
                                                </>
                                            )}

                                            {resOption === "Tablet" && (
                                                <>
                                                    <WithResButtons
                                                        label="Position">
                                                        <SelectControl
                                                            value={TABbgImgPos}
                                                            options={[
                                                                {
                                                                    label: __(
                                                                        "Default",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Center Center",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "center center",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Center Left",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "center left",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Center Right",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "center right",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Top Center",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "top center",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Top Left",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "top left",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Top Right",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "top right",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Bottom Center",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "bottom center",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Bottom Left",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "bottom left",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Bottom Right",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "bottom right",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Custom",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "custom",
                                                                },
                                                            ]}
                                                            onChange={(
                                                                TABbgImgPos
                                                            ) =>
                                                                setAttributes({
                                                                    [`TAB${controlName}bgImgPos`]:
                                                                        TABbgImgPos,
                                                                })
                                                            }
                                                            __next40pxDefaultSize
                                                            __nextHasNoMarginBottom
                                                        />
                                                    </WithResButtons>

                                                    {TABbgImgPos ===
                                                        "custom" && (
                                                            <>
                                                                <UnitControl
                                                                    selectedUnit={
                                                                        TABbgImgcustomPosXUnit
                                                                    }
                                                                    unitTypes={[
                                                                        {
                                                                            label: "px",
                                                                            value: "px",
                                                                        },
                                                                        {
                                                                            label: "em",
                                                                            value: "em",
                                                                        },
                                                                        {
                                                                            label: "%",
                                                                            value: "%",
                                                                        },
                                                                    ]}
                                                                    onClick={(
                                                                        TABbgImgcustomPosXUnit
                                                                    ) =>
                                                                        setAttributes(
                                                                            {
                                                                                [`TAB${controlName}bgImgcustomPosXUnit`]:
                                                                                    TABbgImgcustomPosXUnit,
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <WithResButtons
                                                                    label="X Position">
                                                                    <RangeControl
                                                                        value={
                                                                            TABbgImgcustomPosX
                                                                        }
                                                                        min={0}
                                                                        max={
                                                                            TABbgImgcustomPosXUnit ===
                                                                                "px"
                                                                                ? 2000
                                                                                : 100
                                                                        }
                                                                        onChange={(
                                                                            TABbgImgcustomPosX
                                                                        ) =>
                                                                            setAttributes(
                                                                                {
                                                                                    [`TAB${controlName}bgImgcustomPosX`]:
                                                                                        TABbgImgcustomPosX,
                                                                                }
                                                                            )
                                                                        }
                                                                        __nextHasNoMarginBottom
                                                                        __next40pxDefaultSize
                                                                    />
                                                                </WithResButtons>

                                                                <UnitControl
                                                                    selectedUnit={
                                                                        TABbgImgcustomPosYUnit
                                                                    }
                                                                    unitTypes={[
                                                                        {
                                                                            label: "px",
                                                                            value: "px",
                                                                        },
                                                                        {
                                                                            label: "em",
                                                                            value: "em",
                                                                        },
                                                                        {
                                                                            label: "%",
                                                                            value: "%",
                                                                        },
                                                                    ]}
                                                                    onClick={(
                                                                        TABbgImgcustomPosYUnit
                                                                    ) =>
                                                                        setAttributes(
                                                                            {
                                                                                [`TAB${controlName}bgImgcustomPosYUnit`]:
                                                                                    TABbgImgcustomPosYUnit,
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <WithResButtons
                                                                    label="Y Position">
                                                                    <RangeControl
                                                                        value={
                                                                            TABbgImgcustomPosY
                                                                        }
                                                                        min={0}
                                                                        max={
                                                                            TABbgImgcustomPosYUnit ===
                                                                                "px"
                                                                                ? 2000
                                                                                : 100
                                                                        }
                                                                        step={
                                                                            TABbgImgcustomPosYUnit ===
                                                                                "px"
                                                                                ? 1
                                                                                : 0.1
                                                                        }
                                                                        onChange={(
                                                                            TABbgImgcustomPosY
                                                                        ) =>
                                                                            setAttributes(
                                                                                {
                                                                                    [`TAB${controlName}bgImgcustomPosY`]:
                                                                                        TABbgImgcustomPosY,
                                                                                }
                                                                            )
                                                                        }
                                                                        __nextHasNoMarginBottom
                                                                        __next40pxDefaultSize
                                                                    />
                                                                </WithResButtons>
                                                            </>
                                                        )}

                                                    <BgAttachmentControl
                                                        name={`${controlName}bgImgAttachment`}
                                                    />

                                                    <WithResButtons
                                                        label="Repeat">
                                                        <SelectControl
                                                            value={
                                                                TABbgImgRepeat
                                                            }
                                                            options={[
                                                                {
                                                                    label: __(
                                                                        "Default",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "No-repeat",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "no-repeat",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Repeat",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "repeat",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Repeat-x",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "repeat-x",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Repeat-y",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "repeat-y",
                                                                },
                                                            ]}
                                                            onChange={(
                                                                TABbgImgRepeat
                                                            ) =>
                                                                setAttributes({
                                                                    [`TAB${controlName}bgImgRepeat`]:
                                                                        TABbgImgRepeat,
                                                                })
                                                            }
                                                            __next40pxDefaultSize
                                                            __nextHasNoMarginBottom
                                                        />
                                                    </WithResButtons>

                                                    <WithResButtons
                                                        label="Size">
                                                        <SelectControl
                                                            value={
                                                                TABbackgroundSize
                                                            }
                                                            options={[
                                                                {
                                                                    label: __(
                                                                        "Default",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Auto",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "auto",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Cover",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "cover",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Contain",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "contain",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Custom",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "custom",
                                                                },
                                                            ]}
                                                            onChange={(
                                                                TABbackgroundSize
                                                            ) =>
                                                                setAttributes({
                                                                    [`TAB${controlName}backgroundSize`]:
                                                                        TABbackgroundSize,
                                                                })
                                                            }
                                                            __next40pxDefaultSize
                                                            __nextHasNoMarginBottom
                                                        />
                                                    </WithResButtons>

                                                    {TABbackgroundSize ===
                                                        "custom" && (
                                                            <>
                                                                <UnitControl
                                                                    selectedUnit={
                                                                        TABbgImgCustomSizeUnit
                                                                    }
                                                                    unitTypes={[
                                                                        {
                                                                            label: "px",
                                                                            value: "px",
                                                                        },
                                                                        {
                                                                            label: "em",
                                                                            value: "em",
                                                                        },
                                                                        {
                                                                            label: "%",
                                                                            value: "%",
                                                                        },
                                                                    ]}
                                                                    onClick={(
                                                                        TABbgImgCustomSizeUnit
                                                                    ) =>
                                                                        setAttributes(
                                                                            {
                                                                                [`TAB${controlName}bgImgCustomSizeUnit`]:
                                                                                    TABbgImgCustomSizeUnit,
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <WithResButtons
                                                                    label="Width">
                                                                    <RangeControl
                                                                        value={
                                                                            TABbgImgCustomSize
                                                                        }
                                                                        min={0}
                                                                        max={
                                                                            TABbgImgCustomSizeUnit ===
                                                                                "px"
                                                                                ? 2000
                                                                                : 100
                                                                        }
                                                                        step={
                                                                            TABbgImgCustomSizeUnit ===
                                                                                "px"
                                                                                ? 1
                                                                                : 0.1
                                                                        }
                                                                        onChange={(
                                                                            TABbgImgCustomSize
                                                                        ) =>
                                                                            setAttributes(
                                                                                {
                                                                                    [`TAB${controlName}bgImgCustomSize`]:
                                                                                        TABbgImgCustomSize,
                                                                                }
                                                                            )
                                                                        }
                                                                        __nextHasNoMarginBottom
                                                                        __next40pxDefaultSize
                                                                    />
                                                                </WithResButtons>
                                                            </>
                                                        )}
                                                </>
                                            )}

                                            {resOption === "Mobile" && (
                                                <>
                                                    <WithResButtons
                                                        label="Position">
                                                        <SelectControl
                                                            value={MOBbgImgPos}
                                                            options={[
                                                                {
                                                                    label: __(
                                                                        "Default",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Center Center",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "center center",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Center Left",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "center left",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Center Right",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "center right",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Top Center",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "top center",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Top Left",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "top left",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Top Right",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "top right",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Bottom Center",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "bottom center",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Bottom Left",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "bottom left",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Bottom Right",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "bottom right",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Custom",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "custom",
                                                                },
                                                            ]}
                                                            onChange={(
                                                                MOBbgImgPos
                                                            ) =>
                                                                setAttributes({
                                                                    [`MOB${controlName}bgImgPos`]:
                                                                        MOBbgImgPos,
                                                                })
                                                            }
                                                            __next40pxDefaultSize
                                                            __nextHasNoMarginBottom
                                                        />
                                                    </WithResButtons>

                                                    {MOBbgImgPos ===
                                                        "custom" && (
                                                            <>
                                                                <UnitControl
                                                                    selectedUnit={
                                                                        MOBbgImgcustomPosXUnit
                                                                    }
                                                                    unitTypes={[
                                                                        {
                                                                            label: "px",
                                                                            value: "px",
                                                                        },
                                                                        {
                                                                            label: "em",
                                                                            value: "em",
                                                                        },
                                                                        {
                                                                            label: "%",
                                                                            value: "%",
                                                                        },
                                                                    ]}
                                                                    onClick={(
                                                                        MOBbgImgcustomPosXUnit
                                                                    ) =>
                                                                        setAttributes(
                                                                            {
                                                                                [`MOB${controlName}bgImgcustomPosXUnit`]:
                                                                                    MOBbgImgcustomPosXUnit,
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <WithResButtons
                                                                    label="X Position">
                                                                    <RangeControl
                                                                        value={
                                                                            MOBbgImgcustomPosX
                                                                        }
                                                                        min={0}
                                                                        max={
                                                                            MOBbgImgcustomPosXUnit ===
                                                                                "px"
                                                                                ? 2000
                                                                                : 100
                                                                        }
                                                                        onChange={(
                                                                            MOBbgImgcustomPosX
                                                                        ) =>
                                                                            setAttributes(
                                                                                {
                                                                                    [`MOB${controlName}bgImgcustomPosX`]:
                                                                                        MOBbgImgcustomPosX,
                                                                                }
                                                                            )
                                                                        }
                                                                        __nextHasNoMarginBottom
                                                                        __next40pxDefaultSize
                                                                    />
                                                                </WithResButtons>

                                                                <UnitControl
                                                                    selectedUnit={
                                                                        MOBbgImgcustomPosYUnit
                                                                    }
                                                                    unitTypes={[
                                                                        {
                                                                            label: "px",
                                                                            value: "px",
                                                                        },
                                                                        {
                                                                            label: "em",
                                                                            value: "em",
                                                                        },
                                                                        {
                                                                            label: "%",
                                                                            value: "%",
                                                                        },
                                                                    ]}
                                                                    onClick={(
                                                                        MOBbgImgcustomPosYUnit
                                                                    ) =>
                                                                        setAttributes(
                                                                            {
                                                                                [`MOB${controlName}bgImgcustomPosYUnit`]:
                                                                                    MOBbgImgcustomPosYUnit,
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <WithResButtons
                                                                    label="Y Position">
                                                                    <RangeControl
                                                                        value={
                                                                            MOBbgImgcustomPosY
                                                                        }
                                                                        min={0}
                                                                        max={
                                                                            MOBbgImgcustomPosYUnit ===
                                                                                "px"
                                                                                ? 2000
                                                                                : 100
                                                                        }
                                                                        step={
                                                                            MOBbgImgcustomPosYUnit ===
                                                                                "px"
                                                                                ? 1
                                                                                : 0.1
                                                                        }
                                                                        onChange={(
                                                                            MOBbgImgcustomPosY
                                                                        ) =>
                                                                            setAttributes(
                                                                                {
                                                                                    [`MOB${controlName}bgImgcustomPosY`]:
                                                                                        MOBbgImgcustomPosY,
                                                                                }
                                                                            )
                                                                        }
                                                                        __nextHasNoMarginBottom
                                                                        __next40pxDefaultSize
                                                                    />
                                                                </WithResButtons>
                                                            </>
                                                        )}

                                                    <BgAttachmentControl
                                                        name={`${controlName}bgImgAttachment`}
                                                    />

                                                    <WithResButtons
                                                        label="Repeat">
                                                        <SelectControl
                                                            value={
                                                                MOBbgImgRepeat
                                                            }
                                                            options={[
                                                                {
                                                                    label: __(
                                                                        "Default",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "No-repeat",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "no-repeat",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Repeat",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "repeat",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Repeat-x",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "repeat-x",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Repeat-y",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "repeat-y",
                                                                },
                                                            ]}
                                                            onChange={(
                                                                MOBbgImgRepeat
                                                            ) =>
                                                                setAttributes({
                                                                    [`MOB${controlName}bgImgRepeat`]:
                                                                        MOBbgImgRepeat,
                                                                })
                                                            }
                                                            __next40pxDefaultSize
                                                            __nextHasNoMarginBottom
                                                        />
                                                    </WithResButtons>

                                                    <WithResButtons
                                                        label="Size">
                                                        <SelectControl
                                                            value={
                                                                MOBbackgroundSize
                                                            }
                                                            options={[
                                                                {
                                                                    label: __(
                                                                        "Default",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Auto",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "auto",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Cover",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "cover",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Contain",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "contain",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Custom",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "custom",
                                                                },
                                                            ]}
                                                            onChange={(
                                                                MOBbackgroundSize
                                                            ) =>
                                                                setAttributes({
                                                                    [`MOB${controlName}backgroundSize`]:
                                                                        MOBbackgroundSize,
                                                                })
                                                            }
                                                            __next40pxDefaultSize
                                                            __nextHasNoMarginBottom
                                                        />
                                                    </WithResButtons>

                                                    {MOBbackgroundSize ===
                                                        "custom" && (
                                                            <>
                                                                <UnitControl
                                                                    selectedUnit={
                                                                        MOBbgImgCustomSizeUnit
                                                                    }
                                                                    unitTypes={[
                                                                        {
                                                                            label: "px",
                                                                            value: "px",
                                                                        },
                                                                        {
                                                                            label: "em",
                                                                            value: "em",
                                                                        },
                                                                        {
                                                                            label: "%",
                                                                            value: "%",
                                                                        },
                                                                    ]}
                                                                    onClick={(
                                                                        MOBbgImgCustomSizeUnit
                                                                    ) =>
                                                                        setAttributes(
                                                                            {
                                                                                [`MOB${controlName}bgImgCustomSizeUnit`]:
                                                                                    MOBbgImgCustomSizeUnit,
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <WithResButtons
                                                                    label="Width">
                                                                    <RangeControl
                                                                        value={
                                                                            MOBbgImgCustomSize
                                                                        }
                                                                        min={0}
                                                                        max={
                                                                            MOBbgImgCustomSizeUnit ===
                                                                                "px"
                                                                                ? 2000
                                                                                : 100
                                                                        }
                                                                        step={
                                                                            MOBbgImgCustomSizeUnit ===
                                                                                "px"
                                                                                ? 1
                                                                                : 0.1
                                                                        }
                                                                        onChange={(
                                                                            MOBbgImgCustomSize
                                                                        ) =>
                                                                            setAttributes(
                                                                                {
                                                                                    [`MOB${controlName}bgImgCustomSize`]:
                                                                                        MOBbgImgCustomSize,
                                                                                }
                                                                            )
                                                                        }
                                                                        __nextHasNoMarginBottom
                                                                        __next40pxDefaultSize
                                                                    />
                                                                </WithResButtons>
                                                            </>
                                                        )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {backgroundType === "gradient" && (
                        <GradientColorControl
                            gradientColor={gradientColor}
                            onChange={(gradientColor) =>
                                setAttributes({
                                    [`${controlName}gradientColor`]:
                                        gradientColor,
                                })
                            }
                        />
                    )}
                </>
            )}

            {bg_hoverType === "hover" && (
                <>
                    <ToggleGroupControl
                        label={__("Background Type", "essential-blocks")}

                        value={hov_backgroundType}
                        onChange={(newValue) =>
                            setAttributes({
                                [`hov_${controlName}backgroundType`]: newValue,
                            })
                        }
                        isBlock
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    >
                        {[
                            {
                                label: __("Classic", "essential-blocks"),
                                value: "classic",
                            },
                            {
                                label: __("Gradient", "essential-blocks"),
                                value: "gradient",
                            },
                        ].map(({ value, label }, index) => (
                            <ToggleGroupControlOption
                                key={index}
                                value={value}
                                label={label}
                            />
                        ))}
                    </ToggleGroupControl>

                    {hov_backgroundType === "classic" && (
                        <>
                            <ColorControl
                                label={__(
                                    "Background Color",
                                    "essential-blocks"
                                )}
                                color={hov_backgroundColor}
                                onChange={(hov_backgroundColor) =>
                                    setAttributes({
                                        [`hov_${controlName}backgroundColor`]:
                                            hov_backgroundColor,
                                    })
                                }
                            />

                            {noMainBgi === false && (
                                <>
                                    <WithResButtons
                                        label={__(
                                            "Background Image",
                                            "essential-blocks"
                                        )}
                                    />

                                    <ImageComponent.GeneralTab
                                        onSelect={({ url, id }) =>
                                            setAttributes({
                                                [hov_bgImageURLKey]:
                                                    url,
                                                // String — see the normal control
                                                // above.
                                                [hov_bgImageIDKey]:
                                                    id ? String(id) : "",
                                            })
                                        }
                                        onRemove={() =>
                                            setAttributes({
                                                [hov_bgImageURLKey]:
                                                    "",
                                                [hov_bgImageIDKey]:
                                                    "",
                                            })
                                        }
                                        value={attributes[hov_bgImageURLKey]}
                                        imageAttrProps={{
                                            imageUrl: hov_bgImageURLKey,
                                            imageId: hov_bgImageIDKey,
                                        }}
                                        hasTag={false}
                                        hasCaption={false}
                                        hasStyle={false}
                                        hasLink={false}
                                        showInPanel={false}
                                    />

                                    {!attributes[hov_bgImageURLKey] && hov_effectiveBgImageURL && (
                                        <p style={{ marginTop: "-10px", paddingBottom: "10px" }}>
                                            <i>
                                                {__(
                                                    "Inherited from a larger device. Select an image to override it here.",
                                                    "essential-blocks"
                                                )}
                                            </i>
                                        </p>
                                    )}

                                    {hov_effectiveBgImageURL && (
                                        <>
                                            {resOption === "Desktop" && (
                                                <>
                                                    <WithResButtons
                                                        label="Position">
                                                        <SelectControl
                                                            value={hov_bgImgPos}
                                                            options={[
                                                                {
                                                                    label: __(
                                                                        "Default",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Center Center",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "center center",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Center Left",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "center left",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Center Right",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "center right",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Top Center",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "top center",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Top Left",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "top left",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Top Right",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "top right",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Bottom Center",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "bottom center",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Bottom Left",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "bottom left",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Bottom Right",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "bottom right",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Custom",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "custom",
                                                                },
                                                            ]}
                                                            onChange={(
                                                                hov_bgImgPos
                                                            ) =>
                                                                setAttributes({
                                                                    [`hov_${controlName}bgImgPos`]:
                                                                        hov_bgImgPos,
                                                                })
                                                            }
                                                            __next40pxDefaultSize
                                                            __nextHasNoMarginBottom
                                                        />
                                                    </WithResButtons>

                                                    {hov_bgImgPos ===
                                                        "custom" && (
                                                            <>
                                                                <UnitControl
                                                                    selectedUnit={
                                                                        hov_bgImgcustomPosXUnit
                                                                    }
                                                                    unitTypes={[
                                                                        {
                                                                            label: "px",
                                                                            value: "px",
                                                                        },
                                                                        {
                                                                            label: "em",
                                                                            value: "em",
                                                                        },
                                                                        {
                                                                            label: "%",
                                                                            value: "%",
                                                                        },
                                                                    ]}
                                                                    onClick={(
                                                                        hov_bgImgcustomPosXUnit
                                                                    ) =>
                                                                        setAttributes(
                                                                            {
                                                                                [`hov_${controlName}bgImgcustomPosXUnit`]:
                                                                                    hov_bgImgcustomPosXUnit,
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <WithResButtons
                                                                    label="X Position">
                                                                    <RangeControl
                                                                        value={
                                                                            hov_bgImgcustomPosX
                                                                        }
                                                                        min={0}
                                                                        max={
                                                                            hov_bgImgcustomPosXUnit ===
                                                                                "px"
                                                                                ? 2000
                                                                                : 100
                                                                        }
                                                                        onChange={(
                                                                            hov_bgImgcustomPosX
                                                                        ) =>
                                                                            setAttributes(
                                                                                {
                                                                                    [`hov_${controlName}bgImgcustomPosX`]:
                                                                                        hov_bgImgcustomPosX,
                                                                                }
                                                                            )
                                                                        }
                                                                        __nextHasNoMarginBottom
                                                                        __next40pxDefaultSize
                                                                    />
                                                                </WithResButtons>

                                                                <UnitControl
                                                                    selectedUnit={
                                                                        hov_bgImgcustomPosYUnit
                                                                    }
                                                                    unitTypes={[
                                                                        {
                                                                            label: "px",
                                                                            value: "px",
                                                                        },
                                                                        {
                                                                            label: "em",
                                                                            value: "em",
                                                                        },
                                                                        {
                                                                            label: "%",
                                                                            value: "%",
                                                                        },
                                                                    ]}
                                                                    onClick={(
                                                                        hov_bgImgcustomPosYUnit
                                                                    ) =>
                                                                        setAttributes(
                                                                            {
                                                                                [`hov_${controlName}bgImgcustomPosYUnit`]:
                                                                                    hov_bgImgcustomPosYUnit,
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <WithResButtons
                                                                    label="Y Position">
                                                                    <RangeControl
                                                                        value={
                                                                            hov_bgImgcustomPosY
                                                                        }
                                                                        min={0}
                                                                        max={
                                                                            hov_bgImgcustomPosYUnit ===
                                                                                "px"
                                                                                ? 2000
                                                                                : 100
                                                                        }
                                                                        step={
                                                                            hov_bgImgcustomPosYUnit ===
                                                                                "px"
                                                                                ? 1
                                                                                : 0.1
                                                                        }
                                                                        onChange={(
                                                                            hov_bgImgcustomPosY
                                                                        ) =>
                                                                            setAttributes(
                                                                                {
                                                                                    [`hov_${controlName}bgImgcustomPosY`]:
                                                                                        hov_bgImgcustomPosY,
                                                                                }
                                                                            )
                                                                        }
                                                                        __nextHasNoMarginBottom
                                                                        __next40pxDefaultSize
                                                                    />
                                                                </WithResButtons>
                                                            </>
                                                        )}

                                                    <BgAttachmentControl
                                                        name={`${controlName}bgImgAttachment`}
                                                        statePrefix="hov_"
                                                    />

                                                    <WithResButtons
                                                        label="Repeat">
                                                        <SelectControl
                                                            value={
                                                                hov_bgImgRepeat
                                                            }
                                                            options={[
                                                                {
                                                                    label: __(
                                                                        "Default",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "No-repeat",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "no-repeat",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Repeat",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "repeat",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Repeat-x",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "repeat-x",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Repeat-y",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "repeat-y",
                                                                },
                                                            ]}
                                                            onChange={(
                                                                hov_bgImgRepeat
                                                            ) =>
                                                                setAttributes({
                                                                    [`hov_${controlName}bgImgRepeat`]:
                                                                        hov_bgImgRepeat,
                                                                })
                                                            }
                                                            __next40pxDefaultSize
                                                            __nextHasNoMarginBottom
                                                        />
                                                    </WithResButtons>

                                                    <WithResButtons
                                                        label="Size">
                                                        <SelectControl
                                                            value={
                                                                hov_backgroundSize
                                                            }
                                                            options={[
                                                                {
                                                                    label: __(
                                                                        "Default",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Auto",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "auto",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Cover",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "cover",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Contain",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "contain",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Custom",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "custom",
                                                                },
                                                            ]}
                                                            onChange={(
                                                                hov_backgroundSize
                                                            ) =>
                                                                setAttributes({
                                                                    [`hov_${controlName}backgroundSize`]:
                                                                        hov_backgroundSize,
                                                                })
                                                            }
                                                            __next40pxDefaultSize
                                                            __nextHasNoMarginBottom
                                                        />
                                                    </WithResButtons>

                                                    {hov_backgroundSize ===
                                                        "custom" && (
                                                            <>
                                                                <UnitControl
                                                                    selectedUnit={
                                                                        hov_bgImgCustomSizeUnit
                                                                    }
                                                                    unitTypes={[
                                                                        {
                                                                            label: "px",
                                                                            value: "px",
                                                                        },
                                                                        {
                                                                            label: "em",
                                                                            value: "em",
                                                                        },
                                                                        {
                                                                            label: "%",
                                                                            value: "%",
                                                                        },
                                                                    ]}
                                                                    onClick={(
                                                                        hov_bgImgCustomSizeUnit
                                                                    ) =>
                                                                        setAttributes(
                                                                            {
                                                                                [`hov_${controlName}bgImgCustomSizeUnit`]:
                                                                                    hov_bgImgCustomSizeUnit,
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <WithResButtons
                                                                    label="Width">
                                                                    <RangeControl
                                                                        value={
                                                                            hov_bgImgCustomSize
                                                                        }
                                                                        min={0}
                                                                        max={
                                                                            hov_bgImgCustomSizeUnit ===
                                                                                "px"
                                                                                ? 2000
                                                                                : 100
                                                                        }
                                                                        step={
                                                                            hov_bgImgCustomSizeUnit ===
                                                                                "px"
                                                                                ? 1
                                                                                : 0.1
                                                                        }
                                                                        onChange={(
                                                                            hov_bgImgCustomSize
                                                                        ) =>
                                                                            setAttributes(
                                                                                {
                                                                                    [`hov_${controlName}bgImgCustomSize`]:
                                                                                        hov_bgImgCustomSize,
                                                                                }
                                                                            )
                                                                        }
                                                                        __nextHasNoMarginBottom
                                                                        __next40pxDefaultSize
                                                                    />
                                                                </WithResButtons>
                                                            </>
                                                        )}
                                                </>
                                            )}

                                            {resOption === "Tablet" && (
                                                <>
                                                    <WithResButtons
                                                        label="Position">
                                                        <SelectControl
                                                            value={
                                                                hov_TABbgImgPos
                                                            }
                                                            options={[
                                                                {
                                                                    label: __(
                                                                        "Default",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Center Center",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "center center",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Center Left",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "center left",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Center Right",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "center right",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Top Center",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "top center",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Top Left",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "top left",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Top Right",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "top right",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Bottom Center",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "bottom center",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Bottom Left",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "bottom left",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Bottom Right",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "bottom right",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Custom",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "custom",
                                                                },
                                                            ]}
                                                            onChange={(
                                                                hov_TABbgImgPos
                                                            ) =>
                                                                setAttributes({
                                                                    [`hov_TAB${controlName}bgImgPos`]:
                                                                        hov_TABbgImgPos,
                                                                })
                                                            }
                                                            __next40pxDefaultSize
                                                            __nextHasNoMarginBottom
                                                        />
                                                    </WithResButtons>

                                                    {hov_TABbgImgPos ===
                                                        "custom" && (
                                                            <>
                                                                <UnitControl
                                                                    selectedUnit={
                                                                        hov_TABbgImgcustomPosXUnit
                                                                    }
                                                                    unitTypes={[
                                                                        {
                                                                            label: "px",
                                                                            value: "px",
                                                                        },
                                                                        {
                                                                            label: "em",
                                                                            value: "em",
                                                                        },
                                                                        {
                                                                            label: "%",
                                                                            value: "%",
                                                                        },
                                                                    ]}
                                                                    onClick={(
                                                                        hov_TABbgImgcustomPosXUnit
                                                                    ) =>
                                                                        setAttributes(
                                                                            {
                                                                                [`hov_TAB${controlName}bgImgcustomPosXUnit`]:
                                                                                    hov_TABbgImgcustomPosXUnit,
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <WithResButtons
                                                                    label="X Position">
                                                                    <RangeControl
                                                                        value={
                                                                            hov_TABbgImgcustomPosX
                                                                        }
                                                                        min={0}
                                                                        max={
                                                                            hov_TABbgImgcustomPosXUnit ===
                                                                                "px"
                                                                                ? 2000
                                                                                : 100
                                                                        }
                                                                        onChange={(
                                                                            hov_TABbgImgcustomPosX
                                                                        ) =>
                                                                            setAttributes(
                                                                                {
                                                                                    [`hov_TAB${controlName}bgImgcustomPosX`]:
                                                                                        hov_TABbgImgcustomPosX,
                                                                                }
                                                                            )
                                                                        }
                                                                        __nextHasNoMarginBottom
                                                                        __next40pxDefaultSize
                                                                    />
                                                                </WithResButtons>

                                                                <UnitControl
                                                                    selectedUnit={
                                                                        hov_TABbgImgcustomPosYUnit
                                                                    }
                                                                    unitTypes={[
                                                                        {
                                                                            label: "px",
                                                                            value: "px",
                                                                        },
                                                                        {
                                                                            label: "em",
                                                                            value: "em",
                                                                        },
                                                                        {
                                                                            label: "%",
                                                                            value: "%",
                                                                        },
                                                                    ]}
                                                                    onClick={(
                                                                        hov_TABbgImgcustomPosYUnit
                                                                    ) =>
                                                                        setAttributes(
                                                                            {
                                                                                [`hov_TAB${controlName}bgImgcustomPosYUnit`]:
                                                                                    hov_TABbgImgcustomPosYUnit,
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <WithResButtons
                                                                    label="Y Position">
                                                                    <RangeControl
                                                                        value={
                                                                            hov_TABbgImgcustomPosY
                                                                        }
                                                                        min={0}
                                                                        max={
                                                                            hov_TABbgImgcustomPosYUnit ===
                                                                                "px"
                                                                                ? 2000
                                                                                : 100
                                                                        }
                                                                        step={
                                                                            hov_TABbgImgcustomPosYUnit ===
                                                                                "px"
                                                                                ? 1
                                                                                : 0.1
                                                                        }
                                                                        onChange={(
                                                                            hov_TABbgImgcustomPosY
                                                                        ) =>
                                                                            setAttributes(
                                                                                {
                                                                                    [`hov_TAB${controlName}bgImgcustomPosY`]:
                                                                                        hov_TABbgImgcustomPosY,
                                                                                }
                                                                            )
                                                                        }
                                                                        __nextHasNoMarginBottom
                                                                        __next40pxDefaultSize
                                                                    />
                                                                </WithResButtons>
                                                            </>
                                                        )}

                                                    <BgAttachmentControl
                                                        name={`${controlName}bgImgAttachment`}
                                                        statePrefix="hov_"
                                                    />

                                                    <WithResButtons
                                                        label="Repeat">
                                                        <SelectControl
                                                            value={
                                                                hov_TABbgImgRepeat
                                                            }
                                                            options={[
                                                                {
                                                                    label: __(
                                                                        "Default",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "No-repeat",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "no-repeat",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Repeat",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "repeat",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Repeat-x",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "repeat-x",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Repeat-y",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "repeat-y",
                                                                },
                                                            ]}
                                                            onChange={(
                                                                hov_TABbgImgRepeat
                                                            ) =>
                                                                setAttributes({
                                                                    [`hov_TAB${controlName}bgImgRepeat`]:
                                                                        hov_TABbgImgRepeat,
                                                                })
                                                            }
                                                            __next40pxDefaultSize
                                                            __nextHasNoMarginBottom
                                                        />
                                                    </WithResButtons>

                                                    <WithResButtons
                                                        label="Size">
                                                        <SelectControl
                                                            value={
                                                                hov_TABbackgroundSize
                                                            }
                                                            options={[
                                                                {
                                                                    label: __(
                                                                        "Default",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Auto",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "auto",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Cover",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "cover",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Contain",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "contain",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Custom",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "custom",
                                                                },
                                                            ]}
                                                            onChange={(
                                                                hov_TABbackgroundSize
                                                            ) =>
                                                                setAttributes({
                                                                    [`hov_TAB${controlName}backgroundSize`]:
                                                                        hov_TABbackgroundSize,
                                                                })
                                                            }
                                                            __next40pxDefaultSize
                                                            __nextHasNoMarginBottom
                                                        />
                                                    </WithResButtons>

                                                    {hov_TABbackgroundSize ===
                                                        "custom" && (
                                                            <>
                                                                <UnitControl
                                                                    selectedUnit={
                                                                        hov_TABbgImgCustomSizeUnit
                                                                    }
                                                                    unitTypes={[
                                                                        {
                                                                            label: "px",
                                                                            value: "px",
                                                                        },
                                                                        {
                                                                            label: "em",
                                                                            value: "em",
                                                                        },
                                                                        {
                                                                            label: "%",
                                                                            value: "%",
                                                                        },
                                                                    ]}
                                                                    onClick={(
                                                                        hov_TABbgImgCustomSizeUnit
                                                                    ) =>
                                                                        setAttributes(
                                                                            {
                                                                                [`hov_TAB${controlName}bgImgCustomSizeUnit`]:
                                                                                    hov_TABbgImgCustomSizeUnit,
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <WithResButtons
                                                                    label="Width">
                                                                    <RangeControl
                                                                        value={
                                                                            hov_TABbgImgCustomSize
                                                                        }
                                                                        min={0}
                                                                        max={
                                                                            hov_TABbgImgCustomSizeUnit ===
                                                                                "px"
                                                                                ? 2000
                                                                                : 100
                                                                        }
                                                                        step={
                                                                            hov_TABbgImgCustomSizeUnit ===
                                                                                "px"
                                                                                ? 1
                                                                                : 0.1
                                                                        }
                                                                        onChange={(
                                                                            hov_TABbgImgCustomSize
                                                                        ) =>
                                                                            setAttributes(
                                                                                {
                                                                                    [`hov_TAB${controlName}bgImgCustomSize`]:
                                                                                        hov_TABbgImgCustomSize,
                                                                                }
                                                                            )
                                                                        }
                                                                        __nextHasNoMarginBottom
                                                                        __next40pxDefaultSize
                                                                    />
                                                                </WithResButtons>
                                                            </>
                                                        )}
                                                </>
                                            )}

                                            {resOption === "Mobile" && (
                                                <>
                                                    <WithResButtons
                                                        label="Position">
                                                        <SelectControl
                                                            value={
                                                                hov_MOBbgImgPos
                                                            }
                                                            options={[
                                                                {
                                                                    label: __(
                                                                        "Default",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Center Center",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "center center",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Center Left",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "center left",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Center Right",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "center right",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Top Center",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "top center",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Top Left",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "top left",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Top Right",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "top right",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Bottom Center",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "bottom center",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Bottom Left",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "bottom left",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Bottom Right",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "bottom right",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Custom",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "custom",
                                                                },
                                                            ]}
                                                            onChange={(
                                                                hov_MOBbgImgPos
                                                            ) =>
                                                                setAttributes({
                                                                    [`hov_MOB${controlName}bgImgPos`]:
                                                                        hov_MOBbgImgPos,
                                                                })
                                                            }
                                                            __next40pxDefaultSize
                                                            __nextHasNoMarginBottom
                                                        />
                                                    </WithResButtons>

                                                    {hov_MOBbgImgPos ===
                                                        "custom" && (
                                                            <>
                                                                <UnitControl
                                                                    selectedUnit={
                                                                        hov_MOBbgImgcustomPosXUnit
                                                                    }
                                                                    unitTypes={[
                                                                        {
                                                                            label: "px",
                                                                            value: "px",
                                                                        },
                                                                        {
                                                                            label: "em",
                                                                            value: "em",
                                                                        },
                                                                        {
                                                                            label: "%",
                                                                            value: "%",
                                                                        },
                                                                    ]}
                                                                    onClick={(
                                                                        hov_MOBbgImgcustomPosXUnit
                                                                    ) =>
                                                                        setAttributes(
                                                                            {
                                                                                [`hov_MOB${controlName}bgImgcustomPosXUnit`]:
                                                                                    hov_MOBbgImgcustomPosXUnit,
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <WithResButtons
                                                                    label="X Position">
                                                                    <RangeControl
                                                                        value={
                                                                            hov_MOBbgImgcustomPosX
                                                                        }
                                                                        min={0}
                                                                        max={
                                                                            hov_MOBbgImgcustomPosXUnit ===
                                                                                "px"
                                                                                ? 2000
                                                                                : 100
                                                                        }
                                                                        onChange={(
                                                                            hov_MOBbgImgcustomPosX
                                                                        ) =>
                                                                            setAttributes(
                                                                                {
                                                                                    [`hov_MOB${controlName}bgImgcustomPosX`]:
                                                                                        hov_MOBbgImgcustomPosX,
                                                                                }
                                                                            )
                                                                        }
                                                                        __nextHasNoMarginBottom
                                                                        __next40pxDefaultSize
                                                                    />
                                                                </WithResButtons>

                                                                <UnitControl
                                                                    selectedUnit={
                                                                        hov_MOBbgImgcustomPosYUnit
                                                                    }
                                                                    unitTypes={[
                                                                        {
                                                                            label: "px",
                                                                            value: "px",
                                                                        },
                                                                        {
                                                                            label: "em",
                                                                            value: "em",
                                                                        },
                                                                        {
                                                                            label: "%",
                                                                            value: "%",
                                                                        },
                                                                    ]}
                                                                    onClick={(
                                                                        hov_MOBbgImgcustomPosYUnit
                                                                    ) =>
                                                                        setAttributes(
                                                                            {
                                                                                [`hov_MOB${controlName}bgImgcustomPosYUnit`]:
                                                                                    hov_MOBbgImgcustomPosYUnit,
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <WithResButtons
                                                                    label="Y Position">
                                                                    <RangeControl
                                                                        value={
                                                                            hov_MOBbgImgcustomPosY
                                                                        }
                                                                        min={0}
                                                                        max={
                                                                            hov_MOBbgImgcustomPosYUnit ===
                                                                                "px"
                                                                                ? 2000
                                                                                : 100
                                                                        }
                                                                        step={
                                                                            hov_MOBbgImgcustomPosYUnit ===
                                                                                "px"
                                                                                ? 1
                                                                                : 0.1
                                                                        }
                                                                        onChange={(
                                                                            hov_MOBbgImgcustomPosY
                                                                        ) =>
                                                                            setAttributes(
                                                                                {
                                                                                    [`hov_MOB${controlName}bgImgcustomPosY`]:
                                                                                        hov_MOBbgImgcustomPosY,
                                                                                }
                                                                            )
                                                                        }
                                                                        __nextHasNoMarginBottom
                                                                        __next40pxDefaultSize
                                                                    />
                                                                </WithResButtons>
                                                            </>
                                                        )}

                                                    <BgAttachmentControl
                                                        name={`${controlName}bgImgAttachment`}
                                                        statePrefix="hov_"
                                                    />

                                                    <WithResButtons
                                                        label="Repeat">
                                                        <SelectControl
                                                            value={
                                                                hov_MOBbgImgRepeat
                                                            }
                                                            options={[
                                                                {
                                                                    label: __(
                                                                        "Default",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "No-repeat",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "no-repeat",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Repeat",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "repeat",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Repeat-x",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "repeat-x",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Repeat-y",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "repeat-y",
                                                                },
                                                            ]}
                                                            onChange={(
                                                                hov_MOBbgImgRepeat
                                                            ) =>
                                                                setAttributes({
                                                                    [`hov_MOB${controlName}bgImgRepeat`]:
                                                                        hov_MOBbgImgRepeat,
                                                                })
                                                            }
                                                            __next40pxDefaultSize
                                                            __nextHasNoMarginBottom
                                                        />
                                                    </WithResButtons>

                                                    <WithResButtons
                                                        label="Size">
                                                        <SelectControl
                                                            value={
                                                                hov_MOBbackgroundSize
                                                            }
                                                            options={[
                                                                {
                                                                    label: __(
                                                                        "Default",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Auto",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "auto",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Cover",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "cover",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Contain",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "contain",
                                                                },
                                                                {
                                                                    label: __(
                                                                        "Custom",
                                                                        "essential-blocks"
                                                                    ),
                                                                    value: "custom",
                                                                },
                                                            ]}
                                                            onChange={(
                                                                hov_MOBbackgroundSize
                                                            ) =>
                                                                setAttributes({
                                                                    [`hov_MOB${controlName}backgroundSize`]:
                                                                        hov_MOBbackgroundSize,
                                                                })
                                                            }
                                                            __next40pxDefaultSize
                                                            __nextHasNoMarginBottom
                                                        />
                                                    </WithResButtons>

                                                    {hov_MOBbackgroundSize ===
                                                        "custom" && (
                                                            <>
                                                                <UnitControl
                                                                    selectedUnit={
                                                                        hov_MOBbgImgCustomSizeUnit
                                                                    }
                                                                    unitTypes={[
                                                                        {
                                                                            label: "px",
                                                                            value: "px",
                                                                        },
                                                                        {
                                                                            label: "em",
                                                                            value: "em",
                                                                        },
                                                                        {
                                                                            label: "%",
                                                                            value: "%",
                                                                        },
                                                                    ]}
                                                                    onClick={(
                                                                        hov_MOBbgImgCustomSizeUnit
                                                                    ) =>
                                                                        setAttributes(
                                                                            {
                                                                                [`hov_MOB${controlName}bgImgCustomSizeUnit`]:
                                                                                    hov_MOBbgImgCustomSizeUnit,
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                                <WithResButtons
                                                                    label="Width">
                                                                    <RangeControl
                                                                        value={
                                                                            hov_MOBbgImgCustomSize
                                                                        }
                                                                        min={0}
                                                                        max={
                                                                            hov_MOBbgImgCustomSizeUnit ===
                                                                                "px"
                                                                                ? 2000
                                                                                : 100
                                                                        }
                                                                        step={
                                                                            hov_MOBbgImgCustomSizeUnit ===
                                                                                "px"
                                                                                ? 1
                                                                                : 0.1
                                                                        }
                                                                        onChange={(
                                                                            hov_MOBbgImgCustomSize
                                                                        ) =>
                                                                            setAttributes(
                                                                                {
                                                                                    [`hov_MOB${controlName}bgImgCustomSize`]:
                                                                                        hov_MOBbgImgCustomSize,
                                                                                }
                                                                            )
                                                                        }
                                                                        __nextHasNoMarginBottom
                                                                        __next40pxDefaultSize
                                                                    />
                                                                </WithResButtons>
                                                            </>
                                                        )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {hov_backgroundType === "gradient" && (
                        <GradientColorControl
                            gradientColor={hov_gradientColor}
                            onChange={(hov_gradientColor) =>
                                setAttributes({
                                    [`hov_${controlName}gradientColor`]:
                                        hov_gradientColor,
                                })
                            }
                        />
                    )}
                    {!noTransition && (
                        <RangeControl
                            label={__(
                                "Background Transition",
                                "essential-blocks"
                            )}
                            value={bg_transition}
                            min={0}
                            max={5}
                            step={0.1}
                            onChange={(bg_transition) =>
                                setAttributes({
                                    [`${controlName}bg_transition`]:
                                        bg_transition,
                                })
                            }
                            __nextHasNoMarginBottom
                            __next40pxDefaultSize
                        />
                    )}
                </>
            )}
        </>
    );
}
