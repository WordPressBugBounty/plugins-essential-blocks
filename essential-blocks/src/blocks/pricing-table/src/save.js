/**
 * WordPress dependencies
 */
import {
    EBDisplayIcon, sanitizeURL, BlockProps
} from "@essential-blocks/controls";

const Save = ({ attributes }) => {
    const {
        blockId,
        pricingStyle,
        title,
        showSubtitle,
        subtitle,
        showHeaderIcon,
        headerIcon,
        mainPrice,
        showOnSale,
        salePrice,
        priceCurrency,
        currencyPlacement,
        pricePeriod,
        periodSeparator,
        hideFeatures,
        features,
        showButton,
        buttonIcon,
        buttonIconPosition,
        buttonText,
        buttonURL,
        contentAlign,
        showRibbon,
        ribbonStyle,
        classHook,
        ribbonAlignHorizontal = "right",
        ribbonAlignVertical = "top",
        newWindow,
        showFeatureLine = true,
        showBlockContent,
        showFeatureIcon,
        titleTagName
    } = attributes;

    if (!showBlockContent) {
        return
    }

    // ribbon Class
    const ribbonClass = showRibbon ? ` featured ${ribbonStyle}` : "";
    const TitleTagName = titleTagName;

    return (
        <BlockProps.Save attributes={attributes}>
            <div className={`eb-parent-wrapper eb-parent-${blockId} ${classHook}`}>
                <div className={`${blockId} eb-pricing-wrapper eb-pricing-content-${contentAlign}`}>
                    <div className={`eb-pricing ${pricingStyle}`}>
                        <div
                            className={`eb-pricing-item${ribbonClass}${showRibbon
                                ? ribbonStyle !== "ribbon-1"
                                    ? " " + ribbonAlignHorizontal
                                    : " " + ribbonAlignVertical
                                : ""
                                }`}
                        >
                            <div className="eb-pricing-item-overlay"></div>

                            {pricingStyle == "style-4" && (
                                <>
                                    <div className="eb-pricing-top">
                                        {showHeaderIcon && (
                                            <div className="eb-pricing-icon" data-icon={headerIcon}>
                                                <EBDisplayIcon className={`icon`} icon={headerIcon} />
                                            </div>
                                        )}
                                        <div className="eb-pricing-tag">
                                            <span className="price-tag">
                                                <span
                                                    className={`original-price${showOnSale === true ? " line-through" : ""
                                                        }`}
                                                    data-price={mainPrice}
                                                >
                                                    {currencyPlacement === "left" && (
                                                        <span className="price-currency">{priceCurrency}</span>
                                                    )}
                                                    {mainPrice}
                                                    {currencyPlacement === "right" && (
                                                        <span className="price-currency">{priceCurrency}</span>
                                                    )}
                                                </span>

                                                {showOnSale && (
                                                    <>
                                                        <span className="sale-price" data-sale-price={salePrice}>
                                                            {currencyPlacement === "left" && (
                                                                <span className="price-currency">{priceCurrency}</span>
                                                            )}
                                                            {salePrice}
                                                            {currencyPlacement === "right" && (
                                                                <span className="price-currency">{priceCurrency}</span>
                                                            )}
                                                        </span>
                                                    </>
                                                )}
                                            </span>
                                            <span
                                                className="price-period"
                                                data-period-separator={periodSeparator}
                                                data-price-period={pricePeriod}
                                            >
                                                {periodSeparator} {pricePeriod}
                                            </span>
                                        </div>

                                        <div className="eb-pricing-header">
                                            <TitleTagName className="eb-pricing-title">{title}</TitleTagName>
                                            {showSubtitle && <span className="eb-pricing-subtitle">{subtitle}</span>}
                                        </div>
                                    </div>
                                    <div className="eb-pricing-bottom">
                                        {hideFeatures !== true && (
                                            <>
                                                <div className="eb-pricing-body">
                                                    <ul
                                                        className={`eb-pricebox-features ${showFeatureLine ? "" : "no-border"
                                                            }`}
                                                    >
                                                        {features.map(
                                                            ({ icon, text, color, clickable, link }, index) => (
                                                                <li
                                                                    key={index}
                                                                    className="eb-pricebox-feature-item"
                                                                    data-icon={icon}
                                                                    data-color={color}
                                                                    data-clickable={clickable}
                                                                    data-link={link}
                                                                >
                                                                    {clickable && link ? (
                                                                        <a href={sanitizeURL(link)}>
                                                                            <EBDisplayIcon
                                                                                className={`eb-pricebox-icon`}
                                                                                icon={icon}
                                                                                style={{ color: color }}
                                                                            />
                                                                            <span className="eb-pricebox-feature-text">
                                                                                {text}
                                                                            </span>
                                                                        </a>
                                                                    ) : (
                                                                        <>
                                                                            {showFeatureIcon && (
                                                                                <EBDisplayIcon
                                                                                    className={`eb-pricebox-icon`}
                                                                                    icon={icon}
                                                                                    style={{ color: color }}
                                                                                />
                                                                            )}
                                                                            <span className="eb-pricebox-feature-text">
                                                                                {text}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            </>
                                        )}

                                        {showButton && (
                                            <div className="eb-pricing-footer" data-icon={buttonIcon}>
                                                <div className="eb-pricing-button-wrapper">
                                                    <a
                                                        href={buttonURL == '#' ? '' : sanitizeURL(buttonURL)}
                                                        {...(newWindow && { target: "_blank" })}
                                                        className="eb-pricing-button"
                                                    >
                                                        {buttonIconPosition === "left" && (
                                                            <EBDisplayIcon icon={buttonIcon} />
                                                        )}
                                                        <span className="eb-button-text">{buttonText}</span>
                                                        {buttonIconPosition === "right" && (
                                                            <EBDisplayIcon icon={buttonIcon} />
                                                        )}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {pricingStyle !== "style-4" && (
                                <>
                                    {showHeaderIcon && (
                                        <div className="eb-pricing-icon" data-icon={headerIcon}>
                                            <EBDisplayIcon className={`icon`} icon={headerIcon} />
                                        </div>
                                    )}
                                    <div className="eb-pricing-header">
                                        <TitleTagName className="eb-pricing-title">{title}</TitleTagName>
                                        {showSubtitle && <span className="eb-pricing-subtitle">{subtitle}</span>}
                                    </div>
                                    {pricingStyle !== "style-3" && (
                                        <div className="eb-pricing-tag">
                                            <span className="price-tag">
                                                <span
                                                    className={`original-price${showOnSale === true ? " line-through" : ""
                                                        }`}
                                                    data-price={mainPrice}
                                                >
                                                    {currencyPlacement === "left" && (
                                                        <span className="price-currency">{priceCurrency}</span>
                                                    )}
                                                    {mainPrice}
                                                    {currencyPlacement === "right" && (
                                                        <span className="price-currency">{priceCurrency}</span>
                                                    )}
                                                </span>

                                                {showOnSale && (
                                                    <>
                                                        <span className="sale-price" data-sale-price={salePrice}>
                                                            {currencyPlacement === "left" && (
                                                                <span className="price-currency">{priceCurrency}</span>
                                                            )}
                                                            {salePrice}
                                                            {currencyPlacement === "right" && (
                                                                <span className="price-currency">{priceCurrency}</span>
                                                            )}
                                                        </span>
                                                    </>
                                                )}
                                            </span>
                                            <span
                                                className="price-period"
                                                data-period-separator={periodSeparator}
                                                data-price-period={pricePeriod}
                                            >
                                                {periodSeparator} {pricePeriod}
                                            </span>
                                        </div>
                                    )}
                                    {hideFeatures !== true && (
                                        <>
                                            <div className="eb-pricing-body">
                                                <ul
                                                    className={`eb-pricebox-features ${showFeatureLine ? "" : "no-border"
                                                        }`}
                                                >
                                                    {features.map(({ icon, text, color, clickable, link }, index) => (
                                                        <li
                                                            key={index}
                                                            className="eb-pricebox-feature-item"
                                                            data-icon={icon}
                                                            data-color={color}
                                                            data-clickable={clickable}
                                                            data-link={link}
                                                        >
                                                            {clickable && link ? (
                                                                <a href={sanitizeURL(link)}>
                                                                    <EBDisplayIcon
                                                                        className={`eb-pricebox-icon`}
                                                                        icon={icon}
                                                                        style={{ color: color }}
                                                                    />
                                                                    <span className="eb-pricebox-feature-text">
                                                                        {text}
                                                                    </span>
                                                                </a>
                                                            ) : (
                                                                <>
                                                                    {showFeatureIcon && (
                                                                        <EBDisplayIcon
                                                                            className={`eb-pricebox-icon`}
                                                                            icon={icon}
                                                                            style={{ color: color }}
                                                                        />
                                                                    )}
                                                                    <span className="eb-pricebox-feature-text">
                                                                        {text}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </>
                                    )}
                                    {pricingStyle === "style-3" && (
                                        <div className="eb-pricing-tag">
                                            <span className="price-tag">
                                                <span
                                                    className={`original-price${showOnSale === true ? " line-through" : ""
                                                        }`}
                                                    data-price={mainPrice}
                                                >
                                                    {currencyPlacement === "left" && (
                                                        <span className="price-currency">{priceCurrency}</span>
                                                    )}
                                                    {mainPrice}
                                                    {currencyPlacement === "right" && (
                                                        <span className="price-currency">{priceCurrency}</span>
                                                    )}
                                                </span>

                                                {showOnSale && (
                                                    <>
                                                        <span className="sale-price" data-sale-price={salePrice}>
                                                            {currencyPlacement === "left" && (
                                                                <span className="price-currency">{priceCurrency}</span>
                                                            )}
                                                            {salePrice}
                                                            {currencyPlacement === "right" && (
                                                                <span className="price-currency">{priceCurrency}</span>
                                                            )}
                                                        </span>
                                                    </>
                                                )}
                                            </span>
                                            <span
                                                className="price-period"
                                                data-period-separator={periodSeparator}
                                                data-price-period={pricePeriod}
                                            >
                                                {periodSeparator} {pricePeriod}
                                            </span>
                                        </div>
                                    )}
                                    {showButton && (
                                        <div className="eb-pricing-footer" data-icon={buttonIcon}>
                                            <div className="eb-pricing-button-wrapper">
                                                <a
                                                    href={buttonURL == '#' ? '' : sanitizeURL(buttonURL)}
                                                    {...(newWindow && { target: "_blank" })}
                                                    className="eb-pricing-button"
                                                >
                                                    {buttonIconPosition === "left" && (
                                                        <EBDisplayIcon icon={buttonIcon} />
                                                    )}
                                                    <span className="eb-button-text">{buttonText}</span>
                                                    {buttonIconPosition === "right" && (
                                                        <EBDisplayIcon icon={buttonIcon} />
                                                    )}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </BlockProps.Save>
        // edit view end
    );
};
export default Save;
