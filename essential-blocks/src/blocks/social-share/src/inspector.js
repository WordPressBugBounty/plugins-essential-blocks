/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useEffect, useState } from "@wordpress/element";
import {
    SelectControl,
    ToggleControl,
    BaseControl,
    Button,
    TextControl,
    __experimentalDivider as Divider,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

import { TITLE_TYPOGRAPHY } from "./constants/typographyPrefixConstants";

/**
 * Internal dependencies
 */

import {
    ResponsiveDimensionsControl,
    ResponsiveRangeController,
    ColorControl,
    BorderShadowControl,
    TypographyDropdown,
    SortControl,
    EBIconPicker,
    InspectorPanel,
    EBTextControl,
    socialShareIcons,
} from "@essential-blocks/controls";

import {
    rangeIconSize,
    rangeIconMargin,
    rangeIconDistance,
    rangeIconRowGap,
    rangeIconHeight,
    rangeIconWidth,
    rangeFloatingWidth,
    rangeFloatingHeight,
} from "./constants/rangeNames";

import {
    iconsPadding,
    tmbWrapMarginConst,
    tmbWrapPaddingConst,
} from "./constants/dimensionsConstants";

import { WrpBgConst } from "./constants/backgroundsConstants";

import {
    WrpBdShadowConst,
    prefixSocialBdShadow,
} from "./constants/borderShadowConstants";

import { IconsHzAligns, HOVER_EFFECT, ICON_SHAPE } from "./constants";

// Networks with a server-side share URL (see
// SocialShare::eb_social_share_name_link()). `key` is matched against the
// icon class, `name` becomes the button text.
const SHARE_NETWORKS = [
    { key: "facebook", name: __("Facebook", "essential-blocks") },
    { key: "x-twitter", name: __("X", "essential-blocks") },
    { key: "twitter", name: __("Twitter", "essential-blocks") },
    { key: "linkedin", name: __("LinkedIn", "essential-blocks") },
    { key: "whatsapp", name: __("WhatsApp", "essential-blocks") },
    { key: "pinterest", name: __("Pinterest", "essential-blocks") },
    { key: "reddit", name: __("Reddit", "essential-blocks") },
    { key: "tumblr", name: __("Tumblr", "essential-blocks") },
    { key: "telegram", name: __("Telegram", "essential-blocks") },
    { key: "threads", name: __("Threads", "essential-blocks") },
    { key: "pocket", name: __("Pocket", "essential-blocks") },
    { key: "envelope", name: __("Email", "essential-blocks") },
    { key: "xing", name: __("Xing", "essential-blocks") },
    { key: "fa-vk", name: __("VK", "essential-blocks") },
];

const getShareNetwork = (icon = "") =>
    SHARE_NETWORKS.find(({ key }) => icon.includes(key));

// Only offer icons that produce a working share link on the frontend.
const ADDABLE_SHARE_ICONS = {
    fontAwesome: [
        ...socialShareIcons.fontAwesome,
        "fab fa-get-pocket",
        "fab fa-threads",
        "fab fa-square-threads",
        "fas fa-envelope",
        "far fa-envelope",
    ].filter((icon) => getShareNetwork(icon)),
    dashIcon: socialShareIcons.dashicons.filter((icon) =>
        getShareNetwork(icon),
    ),
};

function Inspector({ attributes, setAttributes }) {
    const {
        resOption,
        socialDetails,
        iconsJustify,
        hvIcnColor,
        hvIcnBgc,
        icnEffect,
        iconShape,
        showTitle,
        isFloating,
    } = attributes;

    //
    useEffect(() => {
        const newSclDtails = socialDetails.map((item) => ({
            ...item,
            isExpanded: false,
        }));
        setAttributes({ socialDetails: newSclDtails });
    }, []);

    useEffect(() => {
        onShapeChange(iconShape);
    }, []);

    const onShapeChange = (value) => {
        switch (value) {
            case "rounded":
                setAttributes({
                    iconShape: value,
                    sclBdSd_Rds_Bottom: "10",
                    sclBdSd_Rds_Left: "10",
                    sclBdSd_Rds_Right: "10",
                    sclBdSd_Rds_Top: "10",
                    sclBdSd_Rds_Unit: "px",
                    sclBdSd_Rds_isLinked: true,
                });
                break;

            case "circular":
                setAttributes({
                    iconShape: value,
                    sclBdSd_Rds_Bottom: "50",
                    sclBdSd_Rds_Left: "50",
                    sclBdSd_Rds_Right: "50",
                    sclBdSd_Rds_Top: "50",
                    sclBdSd_Rds_Unit: "%",
                    sclBdSd_Rds_isLinked: true,
                });
                break;

            case "square":
                setAttributes({
                    iconShape: value,
                    sclBdSd_Rds_Bottom: undefined,
                    sclBdSd_Rds_Left: undefined,
                    sclBdSd_Rds_Right: undefined,
                    sclBdSd_Rds_Top: undefined,
                    sclBdSd_Rds_Unit: "px",
                    sclBdSd_Rds_isLinked: true,
                });
                break;

            default:
                break;
        }
    };

    // "Social Media" picker + "+" button above the list: pick a network
    // icon, then click "+" to append it as a new share button.
    // With Font Awesome disabled the picker only lists Dashicons, so start
    // from the Dashicons Facebook icon there.
    const [newShareIcon, setNewShareIcon] = useState(
        EssentialBlocksLocalize?.fontAwesome == "true"
            ? "fab fa-facebook-f"
            : ADDABLE_SHARE_ICONS.dashIcon[0] || "fab fa-facebook-f",
    );

    const onShareButtonAdd = () => {
        const network = getShareNetwork(newShareIcon);
        if (!network) {
            return;
        }

        setAttributes({
            socialDetails: [
                ...(attributes.socialDetails || []),
                {
                    icon: newShareIcon,
                    iconText: network.name,
                    isExpanded: false,
                },
            ],
        });
    };

    const getSocialDetailsComponents = () => {
        const onProfileChange = (key, value, position) => {
            const newSocialDetail = { ...attributes.socialDetails[position] };
            const newSocialDetails = [...attributes.socialDetails];
            newSocialDetails[position] = newSocialDetail;

            if (Array.isArray(key)) {
                key.map((item, index) => {
                    newSocialDetails[position][item] = value[index];
                });
            } else {
                newSocialDetails[position][key] = value;
            }

            setAttributes({ socialDetails: newSocialDetails });
        };

        return attributes.socialDetails.map((each, i) => (
            <div key={i}>
                <EBIconPicker
                    title={__("Social Media", "essential-blocks")}
                    value={each.icon || null}
                    onChange={(value) => onProfileChange('icon', value, i)}
                    enableSvgUpload={false}
                    icons={ADDABLE_SHARE_ICONS}
                />
                <EBTextControl
                    label={__("Text", "essential-blocks")}
                    className="social-share-name-input"
                    value={each.iconText || ""}
                    onChange={(value) => onProfileChange("iconText", value, i)}
                    enableAi={true}
                />
                <ColorControl
                    label={__("Icon Color", "essential-blocks")}
                    color={each.color || ""}
                    onChange={(value) => onProfileChange("color", value, i)}
                />
                <ColorControl
                    label={__("Icon Background Color", "essential-blocks")}
                    color={each.backgroundColor}
                    onChange={(value) =>
                        onProfileChange("backgroundColor", value, i)
                    }
                />
                <ColorControl
                    label={__("Separator Color", "essential-blocks")}
                    color={each.separatorColor}
                    onChange={(value) =>
                        onProfileChange("separatorColor", value, i)
                    }
                />
            </div>
        ));
    };

    return (
        <InspectorPanel
            advancedControlProps={{
                marginPrefix: tmbWrapMarginConst,
                paddingPrefix: tmbWrapPaddingConst,
                backgroundPrefix: WrpBgConst,
                borderPrefix: WrpBdShadowConst,
                hasMargin: true,
            }}
        >
            <InspectorPanel.General>
                <InspectorPanel.PanelBody
                    title={__("Share Buttons", "essential-blocks")}
                    initialOpen={true}
                >
                    <>
                        <ToggleControl
                            label={__("Show Title", "essential-blocks")}
                            checked={showTitle}
                            onChange={() =>
                                setAttributes({
                                    showTitle: !showTitle,
                                })
                            }
                            __nextHasNoMarginBottom
                        />
                        <ToggleControl
                            label={__("Floating", "essential-blocks")}
                            checked={isFloating}
                            onChange={() =>
                                setAttributes({
                                    isFloating: !isFloating,
                                })
                            }
                            __nextHasNoMarginBottom
                        />
                        <Divider />
                        <div className="eb-social-share-add-row">
                            <EBIconPicker
                                title={__("Social Media", "essential-blocks")}
                                value={newShareIcon || null}
                                onChange={(value) => setNewShareIcon(value)}
                                enableSvgUpload={false}
                                hasReset={false}
                                icons={ADDABLE_SHARE_ICONS}
                            />
                            <Button
                                className="eb-social-share-add-button"
                                icon="plus-alt2"
                                label={__("Add Share Button", "essential-blocks")}
                                showTooltip={true}
                                variant="secondary"
                                disabled={!getShareNetwork(newShareIcon)}
                                onClick={onShareButtonAdd}
                            />
                        </div>
                        <SortControl
                            items={attributes.socialDetails}
                            labelKey={"iconText"}
                            onSortEnd={(socialDetails) =>
                                setAttributes({ socialDetails })
                            }
                            onDeleteItem={(index) => {
                                setAttributes({
                                    socialDetails:
                                        attributes.socialDetails.filter(
                                            (each, i) => i !== index,
                                        ),
                                });
                            }}
                            hasSettings={true}
                            settingsComponents={getSocialDetailsComponents()}
                            hasAddButton={false}
                        />
                    </>
                </InspectorPanel.PanelBody>
            </InspectorPanel.General>
            <InspectorPanel.Style>
                <>
                    <InspectorPanel.PanelBody
                        title={__("Icons Styles", "essential-blocks")}
                        initialOpen={true}
                    >
                        <ToggleGroupControl
                            label={__("Icon Shape", "essential-blocks")}

                            value={iconShape}
                            onChange={(value) => onShapeChange(value)}
                            isBlock
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        >
                            {ICON_SHAPE.map((item, index) => (
                                <ToggleGroupControlOption
                                    key={index}
                                    value={item.value}
                                    label={item.label}
                                />
                            ))}
                        </ToggleGroupControl>

                        <BaseControl
                            id="eb-team-icons-alignments"
                            label="Social Icons Horizontal Alignments"
                            __nextHasNoMarginBottom
                        >
                            <SelectControl
                                value={iconsJustify}
                                options={IconsHzAligns}
                                onChange={(iconsJustify) =>
                                    setAttributes({
                                        iconsJustify,
                                    })
                                }
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                        </BaseControl>

                        {showTitle && (
                            <TypographyDropdown
                                baseLabel={__("Typography", "essential-blocks")}
                                typographyPrefixConstant={TITLE_TYPOGRAPHY}
                            />
                        )}

                        <ResponsiveRangeController
                            noUnits
                            baseLabel={__("Size", "essential-blocks")}
                            controlName={rangeIconSize}
                            min={5}
                            max={300}
                            step={1}
                        />

                        {iconShape === "circular" && (
                            <>
                                <ResponsiveRangeController
                                    noUnits
                                    baseLabel={__("Height", "essential-blocks")}
                                    controlName={rangeIconHeight}
                                    min={0}
                                    max={800}
                                    step={1}
                                />
                                <ResponsiveRangeController
                                    noUnits
                                    baseLabel={__("Width", "essential-blocks")}
                                    controlName={rangeIconWidth}
                                    min={0}
                                    max={800}
                                    step={1}
                                />
                            </>
                        )}

                        {isFloating && (
                            <>
                                <ResponsiveRangeController
                                    noUnits
                                    baseLabel={__(
                                        "Floating Width",
                                        "essential-blocks",
                                    )}
                                    controlName={rangeFloatingWidth}
                                    min={0}
                                    max={800}
                                    step={1}
                                />
                                <ResponsiveRangeController
                                    noUnits
                                    baseLabel={__(
                                        "Floating Height",
                                        "essential-blocks",
                                    )}
                                    controlName={rangeFloatingHeight}
                                    min={0}
                                    max={2000}
                                    step={1}
                                />
                            </>
                        )}

                        <ResponsiveRangeController
                            noUnits
                            baseLabel={__("Margin", "essential-blocks")}
                            controlName={rangeIconMargin}
                            min={0}
                            max={250}
                            step={1}
                        />

                        {iconShape !== "circular" && (
                            <ResponsiveDimensionsControl
                                controlName={iconsPadding}
                                baseLabel="Padding"
                            />
                        )}
                        {!isFloating && (
                            <>
                                <ResponsiveRangeController
                                    noUnits
                                    baseLabel={__(
                                        "Spacing",
                                        "essential-blocks",
                                    )}
                                    controlName={rangeIconDistance}
                                    min={0}
                                    max={100}
                                    step={1}
                                />
                                <ResponsiveRangeController
                                    noUnits
                                    baseLabel={__(
                                        "Rows Gap",
                                        "essential-blocks",
                                    )}
                                    controlName={rangeIconRowGap}
                                    min={0}
                                    max={100}
                                    step={1}
                                />

                                <label
                                    style={{
                                        display: "block",
                                        margin: "-20px 0 20px",
                                    }}
                                >
                                    <i>
                                        N.B. 'Rows Gap' is used when you have
                                        multiple rows of social profiles.
                                        Normally in case of only one row, it's
                                        not needed
                                    </i>
                                </label>
                            </>
                        )}

                        <ColorControl
                            label={__("Hover Color", "essential-blocks")}
                            color={hvIcnColor}
                            attributeName={"hvIcnColor"}
                        />

                        <ColorControl
                            label={__("Hover Background", "essential-blocks")}
                            color={hvIcnBgc}
                            attributeName={"hvIcnBgc"}
                        />

                        <SelectControl
                            label={__("Icon Hover Effect", "essential-blocks")}
                            value={icnEffect}
                            options={HOVER_EFFECT}
                            onChange={(icnEffect) => {
                                setAttributes({ icnEffect });
                            }}
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                    </InspectorPanel.PanelBody>

                    <InspectorPanel.PanelBody
                        title={__("Icons Border & Box-Shadow")}
                        initialOpen={false}
                    >
                        <BorderShadowControl
                            controlName={prefixSocialBdShadow}
                        />
                    </InspectorPanel.PanelBody>
                </>
            </InspectorPanel.Style>
        </InspectorPanel>
    );
}
export default Inspector;
