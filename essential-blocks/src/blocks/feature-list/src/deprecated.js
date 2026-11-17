/**
 * WordPress dependencies
 */
import { useBlockProps } from "@wordpress/block-editor";
import { omit } from "lodash";
import { sanitizeURL, EBDisplayIcon, EBDisplayIconSave, BlockProps } from "@essential-blocks/controls";
import { applyFilters } from "@wordpress/hooks";
import { escapeHTML } from "@wordpress/escape-html";
import attributes from "./attributes";

/**
 * Attributes as they were before Feature List text became rich text (6.5.4):
 * item `title` and `content` were plain text (`source: "text"`). Every entry
 * below parses saved markup with these, so they are frozen here rather than
 * following ./attributes.
 */
const legacyAttributes = {
    ...attributes,
    features: {
        ...attributes.features,
        query: {
            ...attributes.features.query,
            title: {
                type: "string",
                source: "text",
                selector: ".eb-feature-list-title",
            },
            content: {
                type: "string",
                source: "text",
                selector: ".eb-feature-list-content",
            },
        },
    },
};

/**
 * Plain text read by the legacy `source: "text"` attributes becomes HTML for
 * the rich-text attributes: escape it, so "A & B" or a literal "<b>" a user
 * typed keeps rendering as text instead of turning into markup.
 */
const migrateTextToHtml = (attrs) => ({
    ...attrs,
    features: (attrs.features || []).map((item) => ({
        ...item,
        title: typeof item.title === "string" ? escapeHTML(item.title) : item.title,
        content: typeof item.content === "string" ? escapeHTML(item.content) : item.content,
    })),
});

// Save output of 6.5.3: title and content as plain text, no title-text span.
const saveV653 = ({ attributes }) => {
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
        iconLiquidGlass,
    } = attributes;

    const featureListAlignClass =
        featureListAlign === "center"
            ? " eb-feature-list-center"
            : featureListAlign === "right"
                ? " eb-feature-list-right"
                : " eb-feature-list-left";

    const featureListWrapperClass =
        iconShape !== "none" ? ` ${iconShape} ${shapeView}` : " none";
    const inlineDesignClass = useInlineDesign ? " eb-inline-feature-list" : "";
    let iconStyle = {};
    let badgeStyle = {};

    return (
        <BlockProps.Save attributes={attributes}>
            <div className={`eb-parent-wrapper eb-parent-${blockId} ${classHook || ''}`}>
                <div
                    className={`${blockId} eb-feature-list-wrapper eb-icon-position-${iconPosition} eb-tablet-icon-position-${iconPosition} eb-mobile-icon-position-${iconPosition}${featureListAlignClass}${showConnector ? " connector-" + connectorStyle : ""
                        }`}
                >
                    <ul
                        className={`eb-feature-list-items${featureListWrapperClass}${inlineDesignClass}`}
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
                                    badgeTextColor,
                                    badgeBackgroundColor,
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
                                        data-icon={icon}
                                        data-icon-color={iconColor}
                                        data-icon-background-color={iconBackgroundColor}
                                        data-link={link}
                                        data-alt={featureImageAlt}
                                        data-title={featureImageTitle}
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
                                                        {iconType === "icon" && <EBDisplayIconSave icon={icon} />}
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
                                                        <a
                                                            href={sanitizeURL(link)}
                                                            target={
                                                                linkOpenNewTab == "true" ? "_blank" : "_self"
                                                            }
                                                            rel="noopener"
                                                        >
                                                            {title}
                                                        </a>
                                                    </attributes.titleTag>
                                                ) : (
                                                    <attributes.titleTag className="eb-feature-list-title">
                                                        {title}
                                                    </attributes.titleTag>
                                                )}
                                                {showBadge == "true" && badgeText && (
                                                    <span className="eb-feature-list-badge" style={badgeStyle}>
                                                        {badgeText}
                                                    </span>
                                                )}
                                            </div>
                                            {!useInlineDesign && (
                                                <p className="eb-feature-list-content">{content}</p>
                                            )}
                                        </div>
                                    </li>
                                );
                            }
                        )}
                    </ul>
                </div>
            </div>
        </BlockProps.Save>
        // edit view end
    );
};

const deprecated = [
    {
        attributes: { ...legacyAttributes },
        migrate: migrateTextToHtml,
        supports: {
            anchor: true,
            align: ["wide", "full"],
        },
        save: saveV653,
    },
    {
        attributes: { ...legacyAttributes },
        migrate: migrateTextToHtml,
        supports: {
            align: ["wide", "full"],
        },
        save: ({ attributes }) => {
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
            } = attributes;

            const featureListAlignClass =
                featureListAlign === "center"
                    ? " eb-feature-list-center"
                    : featureListAlign === "right"
                        ? " eb-feature-list-right"
                        : " eb-feature-list-left";

            const featureListWrapperClass =
                iconShape !== "none" ? ` ${iconShape} ${shapeView}` : " none";
            const inlineDesignClass = useInlineDesign ? " eb-inline-feature-list" : "";
            let iconStyle = {};

            return (
                <BlockProps.Save attributes={attributes}>
                    <div className={`eb-parent-wrapper eb-parent-${blockId} ${classHook}`}>
                        <div
                            className={`${blockId} eb-feature-list-wrapper eb-icon-position-${iconPosition} eb-tablet-icon-position-${iconPosition} eb-mobile-icon-position-${iconPosition}${featureListAlignClass}${showConnector ? " connector-" + connectorStyle : ""
                                }`}
                        >
                            <ul
                                className={`eb-feature-list-items${featureListWrapperClass}${inlineDesignClass}`}
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
                                        },
                                        index
                                    ) => {
                                        {
                                            iconStyle = {
                                                color: iconColor,
                                                backgroundColor: iconBackgroundColor,
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
                                                data-icon={icon}
                                                data-icon-color={iconColor}
                                                data-icon-background-color={iconBackgroundColor}
                                                data-link={link}
                                                data-alt={featureImageAlt}
                                                data-title={featureImageTitle}
                                            >
                                                {iconType !== "none" && (
                                                    <div className="eb-feature-list-icon-box">
                                                        <div className="eb-feature-list-icon-inner">
                                                            <span
                                                                className="eb-feature-list-icon"
                                                                style={iconStyle}
                                                            >
                                                                {iconType === "icon" && <EBDisplayIcon icon={icon} />}
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
                                                    {link ? (
                                                        <attributes.titleTag className="eb-feature-list-title">
                                                            <a
                                                                href={sanitizeURL(link)}
                                                                target={
                                                                    linkOpenNewTab == "true" ? "_blank" : "_self"
                                                                }
                                                                rel="noopener"
                                                            >
                                                                {title}
                                                            </a>
                                                        </attributes.titleTag>
                                                    ) : (
                                                        <attributes.titleTag className="eb-feature-list-title">
                                                            {title}
                                                        </attributes.titleTag>
                                                    )}
                                                    {!useInlineDesign && (
                                                        <p className="eb-feature-list-content">{content}</p>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    }
                                )}
                            </ul>
                        </div>
                    </div>
                </BlockProps.Save>
                // edit view end
            );
        },
    },
    {
        attributes: { ...legacyAttributes },
        migrate: migrateTextToHtml,
        supports: {
            align: ["wide", "full"],
        },
        save: ({ attributes }) => {
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
            } = attributes;

            const featureListAlignClass =
                featureListAlign === "center"
                    ? " eb-feature-list-center"
                    : featureListAlign === "right"
                        ? " eb-feature-list-right"
                        : " eb-feature-list-left";

            const featureListWrapperClass =
                iconShape !== "none" ? ` ${iconShape} ${shapeView}` : " none";
            const inlineDesignClass = useInlineDesign ? " eb-inline-feature-list" : "";
            let iconStyle = {};

            return (
                <div {...useBlockProps.save()}>
                    <div className={`eb-parent-wrapper eb-parent-${blockId} ${classHook}`}>
                        <div
                            className={`${blockId} eb-feature-list-wrapper -icon-position-${iconPosition} -tablet-icon-position-${iconPosition} -mobile-icon-position-${iconPosition}${featureListAlignClass}${showConnector ? " connector-" + connectorStyle : ""
                                }`}
                        >
                            <ul
                                className={`eb-feature-list-items${featureListWrapperClass}${inlineDesignClass}`}
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
                                        },
                                        index
                                    ) => {
                                        {
                                            iconStyle = {
                                                color: iconColor,
                                                backgroundColor: iconBackgroundColor,
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
                                                data-icon={icon}
                                                data-icon-color={iconColor}
                                                data-icon-background-color={iconBackgroundColor}
                                                data-link={link}
                                                data-alt={featureImageAlt}
                                                data-title={featureImageTitle}
                                            >
                                                {iconType !== "none" && (
                                                    <div className="eb-feature-list-icon-box">
                                                        <div className="eb-feature-list-icon-inner">
                                                            <span
                                                                className="eb-feature-list-icon"
                                                                style={iconStyle}
                                                            >
                                                                {iconType === "icon" && <EBDisplayIcon icon={icon} />}
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
                                                    {link ? (
                                                        <attributes.titleTag className="eb-feature-list-title">
                                                            <a
                                                                href={link}
                                                                target={
                                                                    linkOpenNewTab == "true" ? "_blank" : "_self"
                                                                }
                                                                rel="noopener"
                                                            >
                                                                {title}
                                                            </a>
                                                        </attributes.titleTag>
                                                    ) : (
                                                        <attributes.titleTag className="eb-feature-list-title">
                                                            {title}
                                                        </attributes.titleTag>
                                                    )}
                                                    {!useInlineDesign && (
                                                        <p className="eb-feature-list-content">{content}</p>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    }
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
                // edit view end
            );
        },
    },
    {
        attributes: { ...legacyAttributes },
        migrate: migrateTextToHtml,
        supports: {
            align: ["wide", "full"],
        },
        save: ({ attributes }) => {
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
            } = attributes;

            const featureListAlignClass =
                featureListAlign === "center"
                    ? " eb-feature-list-center"
                    : featureListAlign === "right"
                        ? " eb-feature-list-right"
                        : " eb-feature-list-left";

            const featureListWrapperClass = iconShape !== "none" ? ` ${iconShape} ${shapeView}` : " none";
            const inlineDesignClass = useInlineDesign ? " eb-inline-feature-list" : "";
            let iconStyle = {};

            return (
                <div {...useBlockProps.save()}>
                    <div className={`eb-parent-wrapper eb-parent-${blockId} ${classHook}`}>
                        <div
                            className={`${blockId} eb-feature-list-wrapper eb-icon-position-${iconPosition} eb-tablet-icon-position-${iconPosition} eb-mobile-icon-position-${iconPosition}${featureListAlignClass}${showConnector ? " connector-" + connectorStyle : ""
                                }`}
                        >
                            <ul className={`eb-feature-list-items${featureListWrapperClass}${inlineDesignClass}`}>
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
                                        },
                                        index
                                    ) => {
                                        {
                                            iconStyle = {
                                                color: iconColor,
                                                backgroundColor: iconBackgroundColor,
                                            };
                                        }
                                        return (
                                            <li
                                                key={index}
                                                className="eb-feature-list-item"
                                                data-new-tab={linkOpenNewTab ? linkOpenNewTab.toString() : "false"}
                                                data-icon-type={iconType}
                                                data-image={featureImage}
                                                data-image-id={featureImageId}
                                                data-icon={icon}
                                                data-icon-color={iconColor}
                                                data-icon-background-color={iconBackgroundColor}
                                                data-link={link}
                                                data-alt={featureImageAlt}
                                                data-title={featureImageTitle}
                                            >
                                                {iconType !== "none" && (
                                                    <div className="eb-feature-list-icon-box">
                                                        <div className="eb-feature-list-icon-inner">
                                                            <span className="eb-feature-list-icon" style={iconStyle}>
                                                                {iconType === "icon" && (
                                                                    <i aria-hidden="true" className={icon}></i>
                                                                )}
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
                                                    {link ? (
                                                        <attributes.titleTag className="eb-feature-list-title">
                                                            <a
                                                                href={sanitizeURL(link)}
                                                                target={linkOpenNewTab == "true" ? "_blank" : "_self"}
                                                                rel="noopener"
                                                            >
                                                                {title}
                                                            </a>
                                                        </attributes.titleTag>
                                                    ) : (
                                                        <attributes.titleTag className="eb-feature-list-title">
                                                            {title}
                                                        </attributes.titleTag>
                                                    )}
                                                    {!useInlineDesign && (
                                                        <p className="eb-feature-list-content">{content}</p>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    }
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
                // edit view end
            );
        },
    },
    {
        attributes: {
            ...omit({ ...legacyAttributes }, ["inlineDesignClass"]),
        },
        migrate: migrateTextToHtml,
        supports: {
            align: ["wide", "full"],
        },
        save: ({ attributes }) => {
            const {
                blockId,
                featureListAlign,
                features,
                iconPosition,
                iconShape,
                shapeView,
                classHook,
            } = attributes;

            const featureListAlignClass =
                featureListAlign === "center"
                    ? " eb-feature-list-center"
                    : featureListAlign === "right"
                        ? " eb-feature-list-right"
                        : " eb-feature-list-left";

            const featureListWrapperClass =
                iconShape !== "none" ? ` ${iconShape} ${shapeView}` : " none";
            let iconStyle = {};

            return (
                <div {...useBlockProps.save()}>
                    <div
                        className={`eb-parent-wrapper eb-parent-${blockId} ${classHook}`}
                    >
                        <div
                            className={`${blockId} eb-feature-list-wrapper eb-icon-position-${iconPosition} eb-tablet-icon-position-${iconPosition} eb-mobile-icon-position-${iconPosition}${featureListAlignClass}`}
                        >
                            <ul className={`eb-feature-list-items${featureListWrapperClass}`}>
                                {features.map(
                                    (
                                        {
                                            title,
                                            iconType,
                                            featureImage,
                                            featureImageId,
                                            icon,
                                            iconColor,
                                            iconBackgroundColor,
                                            content,
                                            link,
                                        },
                                        index
                                    ) => {
                                        {
                                            iconStyle = {
                                                color: iconColor,
                                                backgroundColor: iconBackgroundColor,
                                            };
                                        }
                                        return (
                                            <li
                                                key={index}
                                                className="eb-feature-list-item"
                                                data-icon-type={iconType}
                                                data-image={featureImage}
                                                data-image-id={featureImageId}
                                                data-icon={icon}
                                                data-icon-color={iconColor}
                                                data-icon-background-color={iconBackgroundColor}
                                                data-link={link}
                                            >
                                                {iconType !== "none" && (
                                                    <div className="eb-feature-list-icon-box">
                                                        <div className="eb-feature-list-icon-inner">
                                                            <span
                                                                className="eb-feature-list-icon"
                                                                style={iconStyle}
                                                            >
                                                                {iconType === "icon" && (
                                                                    <i aria-hidden="true" className={icon}></i>
                                                                )}
                                                                {iconType === "image" && (
                                                                    <img
                                                                        className="eb-feature-list-img"
                                                                        src={featureImage}
                                                                    />
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="eb-feature-list-content-box">
                                                    {link ? (
                                                        <attributes.titleTag className="eb-feature-list-title">
                                                            <a href={sanitizeURL(link)}>{title}</a>
                                                        </attributes.titleTag>
                                                    ) : (
                                                        <attributes.titleTag className="eb-feature-list-title">
                                                            {title}
                                                        </attributes.titleTag>
                                                    )}
                                                    <p className="eb-feature-list-content">{content}</p>
                                                </div>
                                            </li>
                                        );
                                    }
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
                // edit view end
            );
        },
    },
    {
        attributes: { ...legacyAttributes },
        migrate: migrateTextToHtml,
        supports: {
            align: ["wide", "full"],
        },
        save: ({ attributes }) => {
            const {
                blockId,
                featureListAlign,
                features,
                iconPosition,
                iconShape,
                shapeView,
                classHook,
            } = attributes;

            const featureListAlignClass =
                featureListAlign === "center"
                    ? " eb-feature-list-center"
                    : featureListAlign === "right"
                        ? " eb-feature-list-right"
                        : " eb-feature-list-left";

            const featureListWrapperClass =
                iconShape !== "none" ? ` ${iconShape} ${shapeView}` : " none";
            let iconStyle = {};

            return (
                <div {...useBlockProps.save()}>
                    <div
                        className={`eb-parent-wrapper eb-parent-${blockId} ${classHook}`}
                    >
                        <div
                            className={`${blockId} eb-feature-list-wrapper eb-icon-position-${iconPosition} eb-tablet-icon-position-${iconPosition} eb-mobile-icon-position-${iconPosition}${featureListAlignClass}`}
                        >
                            <ul className={`eb-feature-list-items${featureListWrapperClass}`}>
                                {features.map(
                                    (
                                        {
                                            title,
                                            iconType,
                                            featureImage,
                                            featureImageId,
                                            icon,
                                            iconColor,
                                            iconBackgroundColor,
                                            content,
                                            link,
                                        },
                                        index
                                    ) => {
                                        {
                                            iconStyle = {
                                                color: iconColor,
                                                backgroundColor: iconBackgroundColor,
                                            };
                                        }
                                        return (
                                            <li
                                                key={index}
                                                className="eb-feature-list-item"
                                                data-icon-type={iconType}
                                                data-image={featureImage}
                                                data-image-id={featureImageId}
                                                data-icon={icon}
                                                data-icon-color={iconColor}
                                                data-icon-background-color={iconBackgroundColor}
                                                data-link={link}
                                            >
                                                {iconType !== "none" && (
                                                    <div className="eb-feature-list-icon-box">
                                                        <div className="eb-feature-list-icon-inner">
                                                            <span
                                                                className="eb-feature-list-icon"
                                                                style={iconStyle}
                                                            >
                                                                {iconType === "icon" && (
                                                                    <i aria-hidden="true" className={icon}></i>
                                                                )}
                                                                {iconType === "image" && (
                                                                    <img
                                                                        className="eb-feature-list-img"
                                                                        src={featureImage}
                                                                    />
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="eb-feature-list-content-box">
                                                    {link ? (
                                                        <attributes.titleTag className="eb-feature-list-title">
                                                            <a href={sanitizeURL(link)}>{title}</a>
                                                        </attributes.titleTag>
                                                    ) : (
                                                        <attributes.titleTag className="eb-feature-list-title">
                                                            {title}
                                                        </attributes.titleTag>
                                                    )}
                                                    <p className="eb-feature-list-content">{content}</p>
                                                </div>
                                            </li>
                                        );
                                    }
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
                // edit view end
            );
        },
    },
    {
        attributes: { ...legacyAttributes },
        migrate: migrateTextToHtml,
        supports: {
            align: ["wide", "full"],
        },
        save: ({ attributes }) => {
            const {
                blockId,
                featureListAlign,
                features,
                iconPosition,
                iconShape,
                shapeView,
            } = attributes;

            const featureListAlignClass =
                featureListAlign === "center"
                    ? " eb-feature-list-center"
                    : featureListAlign === "right"
                        ? " eb-feature-list-right"
                        : " eb-feature-list-left";

            const featureListWrapperClass =
                iconShape !== "none" ? ` ${iconShape} ${shapeView}` : " none";
            let iconStyle = {};

            return (
                <div {...useBlockProps.save()}>
                    <div
                        className={`${blockId} eb-feature-list-wrapper eb-icon-position-${iconPosition} eb-tablet-icon-position-${iconPosition} eb-mobile-icon-position-${iconPosition}${featureListAlignClass}`}
                    >
                        <ul className={`eb-feature-list-items${featureListWrapperClass}`}>
                            {features.map(
                                (
                                    {
                                        title,
                                        iconType,
                                        featureImage,
                                        featureImageId,
                                        icon,
                                        iconColor,
                                        iconBackgroundColor,
                                        content,
                                        link,
                                    },
                                    index
                                ) => {
                                    {
                                        iconStyle = {
                                            color: iconColor,
                                            backgroundColor: iconBackgroundColor,
                                        };
                                    }
                                    return (
                                        <li
                                            key={index}
                                            className="eb-feature-list-item"
                                            data-icon-type={iconType}
                                            data-image={featureImage}
                                            data-image-id={featureImageId}
                                            data-icon={icon}
                                            data-icon-color={iconColor}
                                            data-icon-background-color={iconBackgroundColor}
                                            data-link={link}
                                        >
                                            {iconType !== "none" && (
                                                <div className="eb-feature-list-icon-box">
                                                    <div className="eb-feature-list-icon-inner">
                                                        <span
                                                            className="eb-feature-list-icon"
                                                            style={iconStyle}
                                                        >
                                                            {iconType === "icon" && (
                                                                <i aria-hidden="true" className={icon}></i>
                                                            )}
                                                            {iconType === "image" && (
                                                                <img
                                                                    className="eb-feature-list-img"
                                                                    src={featureImage}
                                                                />
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="eb-feature-list-content-box">
                                                {link ? (
                                                    <attributes.titleTag className="eb-feature-list-title">
                                                        <a href={sanitizeURL(link)}>{title}</a>
                                                    </attributes.titleTag>
                                                ) : (
                                                    <attributes.titleTag className="eb-feature-list-title">
                                                        {title}
                                                    </attributes.titleTag>
                                                )}
                                                <p className="eb-feature-list-content">{content}</p>
                                            </div>
                                        </li>
                                    );
                                }
                            )}
                        </ul>
                    </div>
                </div>
                // edit view end
            );
        },
    },
];

export default deprecated;
