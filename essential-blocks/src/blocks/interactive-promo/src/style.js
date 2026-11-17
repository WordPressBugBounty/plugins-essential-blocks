import {
    wrapperMargin,
    wrapperPadding,
    imageBorderShadow,
    imageHeight,
    imageWidth,
} from "./constants";
import {
    typoPrefix_header,
    typoPrefix_content,
} from "./constants/typographyPrefixConstants";

import {
    softMinifyCssStrings,
    generateDimensionsControlStyles,
    generateBorderShadowStyles,
    generateTypographyStyles,
    generateResponsiveRangeStyles,
    StyleComponent
 } from "@essential-blocks/controls";

export default function Style(props) {
    const { attributes, setAttributes, name } = props;
    const {
        blockMeta,
        blockId,
        resOption,
        headerColor,
        headerHoverColor,
        overlayColor,
        effectName,
        contentColor,
        imageAlignment,
        isBackgroundGradient,
        backgroundColor,
        backgroundGradient,
        classHook,
    } = attributes;

    // wrapper styles css in strings
    const {
        dimensionStylesDesktop: wrapperMarginStylesDesktop,
        dimensionStylesTab: wrapperMarginStylesTab,
        dimensionStylesMobile: wrapperMarginStylesMobile,
    } = generateDimensionsControlStyles({
        controlName: wrapperMargin,
        styleFor: "margin",
        attributes,
    });

    const {
        dimensionStylesDesktop: wrapperPaddingStylesDesktop,
        dimensionStylesTab: wrapperPaddingStylesTab,
        dimensionStylesMobile: wrapperPaddingStylesMobile,
    } = generateDimensionsControlStyles({
        controlName: wrapperPadding,
        styleFor: "padding",
        attributes,
    });

    //header typography
    const {
        typoStylesDesktop: headerTypoStylesDesktop,
        typoStylesTab: headerTypoStylesTab,
        typoStylesMobile: headerTypoStylesMobile,
    } = generateTypographyStyles({
        attributes,
        prefixConstant: typoPrefix_header,
    });

    //Content typography
    const {
        typoStylesDesktop: contentTypoStylesDesktop,
        typoStylesTab: contentTypoStylesTab,
        typoStylesMobile: contentTypoStylesMobile,
    } = generateTypographyStyles({
        attributes,
        prefixConstant: typoPrefix_content,
    });

    // image height
    const {
        rangeStylesDesktop: imageHeightDesktop,
        rangeStylesTab: imageHeightTab,
        rangeStylesMobile: imageHeightMobile,
    } = generateResponsiveRangeStyles({
        controlName: imageHeight,
        property: "height",
        attributes,
        customUnit: "px",
    });

    // image width
    const {
        rangeStylesDesktop: imageWidthDesktop,
        rangeStylesTab: imageWidthTab,
        rangeStylesMobile: imageWidthMobile,
    } = generateResponsiveRangeStyles({
        controlName: imageWidth,
        property: "max-width",
        attributes,
        customUnit: "px",
    });

    const {
        styesDesktop: imageBdShadowStyesDesktop,
        styesTab: imageBdShadowStyesTab,
        styesMobile: imageBdShadowStyesMobile,
        stylesHoverDesktop: imageBdShadowStylesHoverDesktop,
        stylesHoverTab: imageBdShadowStylesHoverTab,
        stylesHoverMobile: imageBdShadowStylesHoverMobile,
        transitionStyle: imageBdShadowTransitionStyle,
    } = generateBorderShadowStyles({
        controlName: imageBorderShadow,
        attributes,
    });

    const imageAlign =
        imageAlignment === "left"
            ? "margin: 0;"
            : imageAlignment === "right"
                ? "margin: 0 0 0 auto;"
                : "margin: 0 auto;";

    // The hover-effects.css effects hardcode their hover title colour (e.g.
    // Sadie #fff, Terry #528cb3) and overlay colours with selectors that beat
    // the block's own colour rule. Emitted only when set, so blocks that
    // never touch these settings keep the effect's look.
    const promoScope = `.eb-interactive-promo-wrapper.${blockId} .eb-interactive-promo.hover-effect`;
    const headerHoverStyles = headerHoverColor
        ? `${promoScope} figure:hover .eb-interactive-promo-header { color: ${headerHoverColor}; }`
        : "";
    let overlayStyles = "";
    if (overlayColor) {
        if (effectName === "sadie") {
            overlayStyles = `${promoScope} figure.effect-sadie figcaption::before { background: linear-gradient(to bottom, transparent 0%, ${overlayColor} 75%); }`;
        } else if (effectName === "apollo") {
            overlayStyles = `${promoScope} figure.effect-apollo figcaption::before { background: ${overlayColor}; }`;
        } else if (effectName === "ming") {
            // Ming's overlay is the white frame (and its glow) shown on hover.
            overlayStyles = `${promoScope} figure.effect-ming figcaption::before { border-color: ${overlayColor}; box-shadow: 0 0 0 30px color-mix(in srgb, ${overlayColor} 20%, transparent); }`;
        } else if (effectName === "oscar") {
            overlayStyles = `${promoScope} figure.effect-oscar figcaption { background-color: ${overlayColor}; }
            ${promoScope} figure.effect-oscar:hover figcaption { background-color: transparent; }`;
        }
    }

    const desktopStyles = `
		${headerHoverStyles}
		${overlayStyles}
		.eb-interactive-promo-wrapper figure > figcaption {
			box-sizing: border-box;
		}

		.eb-interactive-promo-wrapper.${blockId} {
			${wrapperMarginStylesDesktop}
			${wrapperPaddingStylesDesktop}
		}

		.eb-interactive-promo-wrapper.${blockId} .eb-interactive-promo-header {
			${headerTypoStylesDesktop}
			${headerColor ? `color: ${headerColor};` : ""}
		}

		.eb-interactive-promo-wrapper.${blockId} .eb-interactive-promo-content {
			${contentTypoStylesDesktop}
			color: ${contentColor};
		}

		.eb-interactive-promo-wrapper.${blockId} .eb-interactive-promo figure {
			${imageHeightDesktop.replace(/\D/g, "") ? imageHeightDesktop : "height: 100%;"}
			${imageWidthDesktop.replace(/\D/g, "") ? imageWidthDesktop : "max-width: 100%;"}
			${imageBdShadowStyesDesktop}
			${imageAlign}
			${isBackgroundGradient
            ? `background: ${backgroundGradient};`
            : backgroundColor
                ? `background: ${backgroundColor};`
                : ""
        }
			width: 100%;
			position: relative;
			overflow: hidden;
			transition: ${imageBdShadowTransitionStyle};
		}

		.eb-interactive-promo-wrapper.${blockId} .eb-interactive-promo:hover figure {
			${imageBdShadowStylesHoverDesktop}
		}

		.eb-interactive-promo-wrapper.${blockId} .eb-interactive-promo figure img {
			min-width: 100%;
			object-fit: cover;
		}
	`;
    const tabStyles = `
		.eb-interactive-promo-wrapper.${blockId} {
			${wrapperMarginStylesTab}
			${wrapperPaddingStylesTab}
		}

		.eb-interactive-promo-wrapper.${blockId} .eb-interactive-promo-header {
			${headerTypoStylesTab}
		}

		.eb-interactive-promo-wrapper.${blockId} .eb-interactive-promo-content {
			${contentTypoStylesTab}
		}

		.eb-interactive-promo-wrapper.${blockId} .eb-interactive-promo figure {
			${imageHeightTab.replace(/\D/g, "") ? imageHeightTab : "height: 100%;"}
			${imageWidthTab.replace(/\D/g, "") ? imageWidthTab : "max-width: 100%;"}
			${imageBdShadowStyesTab}
		}

		.eb-interactive-promo-wrapper.${blockId} .eb-interactive-promo:hover figure {
			${imageBdShadowStylesHoverTab}
		}
	`;

    const mobileStyles = `
		.eb-interactive-promo-wrapper.${blockId} {
			${wrapperMarginStylesMobile}
			${wrapperPaddingStylesMobile}
		}

		.eb-interactive-promo-wrapper.${blockId} .eb-interactive-promo-header {
			${headerTypoStylesMobile}
		}

		.eb-interactive-promo-wrapper.${blockId} .eb-interactive-promo-content {
			${contentTypoStylesMobile}
		}

		.eb-interactive-promo-wrapper.${blockId} .eb-interactive-promo figure {
			${imageHeightMobile.replace(/\D/g, "") ? imageHeightMobile : "height: 100%;"}
			${imageWidthMobile.replace(/\D/g, "") ? imageWidthMobile : "max-width: 100%;"}
			${imageBdShadowStyesMobile}
		}

		.eb-interactive-promo-wrapper.${blockId} .eb-interactive-promo:hover figure {
			${imageBdShadowStylesHoverMobile}
		}
	`;

    // all css styles for large screen width (desktop/laptop) in strings ⬇
    const desktopAllStyles = softMinifyCssStrings(`
		${desktopStyles}
	`);

    // all css styles for Tab in strings ⬇
    const tabAllStyles = softMinifyCssStrings(`
		${tabStyles}
	`);

    // all css styles for Mobile in strings ⬇
    const mobileAllStyles = softMinifyCssStrings(`
		${mobileStyles}
	`);

    return (
        <>
            <StyleComponent
                attributes={attributes}
                setAttributes={setAttributes}
                desktopAllStyles={desktopAllStyles}
                tabAllStyles={tabAllStyles}
                mobileAllStyles={mobileAllStyles}
                blockName={name}
            />
        </>
    );
}
