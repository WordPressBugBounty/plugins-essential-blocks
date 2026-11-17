/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useEffect, memo } from "@wordpress/element";
import { applyFilters } from "@wordpress/hooks";
import { RichText } from "@wordpress/block-editor";
/**
 * Internal dependencies
 */
import Inspector from "./inspector";
import Style from "./style";
import defaultAttributes from './attributes'

import {
    EBDisplayIconEdit,
    sanitizeURL,
    BlockProps,
    withBlockContext,
    useBlockSetAttributes
} from "@essential-blocks/controls";

// Inline formats offered on item text (#576). A linked item's title drops
// core/link: the whole title is already a link.
const TEXT_FORMATS = ["core/bold", "core/italic", "core/link", "core/strikethrough", "core/underline", "core/text-color"];
const LINKED_TITLE_FORMATS = TEXT_FORMATS.filter((f) => f !== "core/link");

const Edit = (props) => {
    const { attributes, isSelected, setAttributes } = props;

    const updateFeature = (index, key, value) => {
        const features = [...attributes.features];
        features[index] = { ...features[index], [key]: value };
        setAttributes({ features });
    };
    const {
        blockId,
        featureListAlign,
        features,
        iconPosition,
        iconShape,
        shapeView,
        showConnector,
        connectorStyle,
        classHook,
        useInlineDesign,
        iconLiquidGlass
    } = attributes;

    // const setAttributes = useBlockSetAttributes();

    const featureListAlignClass =
        featureListAlign === "center"
            ? " eb-feature-list-center"
            : featureListAlign === "right"
                ? " eb-feature-list-right"
                : " eb-feature-list-left";

    // you must declare this variable
    const enhancedProps = {
        ...props,
        blockPrefix: 'eb-feature-list',
        style: <Style {...props} />
    };

    const featureListWrapperClass =
        iconShape !== "none" ? ` ${iconShape} ${shapeView}` : " none";
    const inlineDesignClass = useInlineDesign ? " eb-inline-feature-list" : "";

    let iconStyle = {};

    let badgeStyle = {};

    return (
        <>
            {isSelected && (
                <Inspector attributes={attributes} setAttributes={setAttributes} />
            )}
            <BlockProps.Edit {...enhancedProps}>
                <div className={`eb-parent-wrapper eb-parent-${blockId} ${classHook}`}>
                    <div
                        className={`${blockId} eb-feature-list-wrapper eb-icon-position-${iconPosition} eb-tablet-icon-position-${iconPosition} eb-mobile-icon-position-${iconPosition}${featureListAlignClass} ${!useInlineDesign && showConnector
                            ? "connector-" + connectorStyle
                            : ""
                            }`}
                    >
                        <ul
                            className={`eb-feature-list-items ${featureListWrapperClass} ${inlineDesignClass}`}
                        >
                            {features.map(
                                (
                                    {
                                        title,
                                        iconType,
                                        featureImage,
                                        featureImageId,
                                        featureImageAlt,
                                        featureImageTitle,
                                        icon,
                                        iconColor,
                                        iconBackgroundColor,
                                        content,
                                        link,
                                        linkOpenNewTab,
                                        showBadge,
                                        badgeText,
                                        badgeBackgroundColor,
                                        badgeTextColor,
                                    },
                                    index
                                ) => {
                                    {
                                        iconStyle = {
                                            color: iconColor,
                                            backgroundColor: iconBackgroundColor,
                                        };

                                        badgeStyle = {
                                            color: badgeTextColor,
                                            backgroundColor: badgeBackgroundColor,
                                        };
                                    }
                                    return (
                                        <li
                                            key={index}
                                            className="eb-feature-list-item"
                                            data-new-tab={
                                                linkOpenNewTab ? linkOpenNewTab.toString() : "false"
                                            }
                                            data-icon-type={iconType}
                                            data-image={featureImage}
                                            data-image-id={featureImageId}
                                            data-alt={featureImageAlt}
                                            data-title={featureImageTitle}
                                            data-icon={icon}
                                            data-icon-color={iconColor}
                                            data-icon-background-color={iconBackgroundColor}
                                            data-link={link}
                                            data-show-badge={showBadge ? showBadge.toString() : "false"}
                                            data-badge-text={badgeText}
                                            data-badge-text-color={badgeTextColor}
                                            data-badge-background-color={badgeBackgroundColor}
                                        >
                                            {iconType !== "none" && (
                                                <div className="eb-feature-list-icon-box">
                                                    <div className={`eb-feature-list-icon-inner ${iconLiquidGlass.enable ? 'eb_liquid_glass-' + iconLiquidGlass.effect + ' ' + 'eb_liquid_glass_shadow-' + iconLiquidGlass.shadowEffect : ''}`}>
                                                        {applyFilters("eb_liquid_glass_effect_pro_content", "", attributes, "iconLiquidGlass")}
                                                        <span
                                                            className="eb-feature-list-icon"
                                                            style={iconStyle}
                                                        >
                                                            {iconType === "icon" && <EBDisplayIconEdit icon={icon} />}
                                                            {iconType === "image" && (
                                                                <img
                                                                    className="eb-feature-list-img"
                                                                    src={featureImage}
                                                                    alt={
                                                                        featureImageAlt
                                                                            ? featureImageAlt
                                                                            : featureImageTitle
                                                                    }
                                                                />
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="eb-feature-list-content-box">
                                                <div className="eb-feature-list-title-wrapper">
                                                    {link ? (
                                                        <attributes.titleTag className="eb-feature-list-title">
                                                            <a href={sanitizeURL(link)} onClick={(e) => e.preventDefault()}>
                                                                <RichText
                                                                    tagName="span"
                                                                    className="eb-feature-list-title-text"
                                                                    value={title}
                                                                    onChange={(value) => updateFeature(index, "title", value)}
                                                                    allowedFormats={LINKED_TITLE_FORMATS}
                                                                    placeholder={__("Feature title", "essential-blocks")}
                                                                />
                                                            </a>
                                                        </attributes.titleTag>
                                                    ) : (
                                                        <attributes.titleTag className="eb-feature-list-title">
                                                            <RichText
                                                                tagName="span"
                                                                className="eb-feature-list-title-text"
                                                                value={title}
                                                                onChange={(value) => updateFeature(index, "title", value)}
                                                                allowedFormats={TEXT_FORMATS}
                                                                placeholder={__("Feature title", "essential-blocks")}
                                                            />
                                                        </attributes.titleTag>
                                                    )}
                                                    {showBadge == "true" && badgeText && (
                                                        <span className="eb-feature-list-badge" style={badgeStyle}>
                                                            {badgeText}
                                                        </span>
                                                    )}
                                                </div>
                                                {!useInlineDesign && (
                                                    <RichText
                                                        tagName="p"
                                                        className="eb-feature-list-content"
                                                        value={content}
                                                        onChange={(value) => updateFeature(index, "content", value)}
                                                        allowedFormats={TEXT_FORMATS}
                                                        placeholder={__("Feature content", "essential-blocks")}
                                                    />
                                                )}
                                            </div>
                                        </li>
                                    );
                                }
                            )}
                        </ul>
                    </div>
                </div>
            </BlockProps.Edit>
        </>
    );
};

Edit.displayName = 'FeatureListEdit';

export default memo(withBlockContext(defaultAttributes)(Edit))
