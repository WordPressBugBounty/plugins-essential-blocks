import { __ } from "@wordpress/i18n";
import { camelCase, upperFirst } from "lodash";

import {
    generateBorderShadowAttributes,
    generateDimensionsAttributes,
    generateResponsiveRangeAttributes,
    generateTypographyAttributes,
    generateResponsiveAlignAttributes,
} from "../../index";

import {
    IMAGE_BORDER,
    IMAGE_WIDTH,
    IMAGE_HEIGHT,
    IMAGE_SIZE,
    IMAGE_RADIUS,
    IMAGE_PADDING,
    IMAGE_MARGIN,
    CAPTION_MARGIN,
    CAPTION_PADDING,
    CAPTION_TYPOGRAPHY,
    CAPTION_WIDTH,
    TEXT_ALIGNMENT,
    IMAGE_ALIGNMENT,
} from "./constants";

const imgAttributes = {
    imageUrl: {
        type: "string",
    },
    imageAlt: {
        type: "string",
    },
    imageId: {
        type: "number",
    },
    imageCaption: {
        type: "string",
    },
    imgObjectFit: {
        type: "string",
        default: "",
    },
    imgObjectPosition: {
        type: "string",
        default: "center center",
    },
    imageSize: {
        type: "string",
        default: "",
    },
    imageBlur: {
        type: "number",
        default: 0,
    },
    imageBrightness: {
        type: "number",
        default: 1,
    },
    imageContrast: {
        type: "number",
        default: 1,
    },
    imageGrayscale: {
        type: "number",
        default: 0,
    },
    imageHueRotate: {
        type: "number",
        default: 0,
    },
    imageInvert: {
        type: "number",
        default: 0,
    },
    imageOpacity: {
        type: "number",
        default: 1,
    },
    imageSaturate: {
        type: "number",
        default: 1,
    },
    imageSepia: {
        type: "number",
        default: 0,
    },
    figureTag: {
        type: "boolean",
        default: false,
    },
    imageAutoHeight: {
        type: "boolean",
        default: true,
    },
    displayCaption: {
        type: "boolean",
        default: false,
    },
    captionStyle: {
        type: "string",
        default: "caption-style-1",
    },
    captionColor: {
        type: "string",
        default: "#101828",
    },
    captionBGColor: {
        type: "string",
        default: "#f9fafb",
    },
    textAlign: {
        type: "string",
        default: "center",
    },
    horizontalAlign: {
        type: "string",
        default: "center",
    },
    verticalAlign: {
        type: "string",
        default: "bottom",
    },
    verticalAlignCap2: {
        type: "string",
        default: "bottom",
    },
    stylePreset: {
        type: "string",
        default: "rounded",
    },
    complexStyle: {
        type: "boolean",
        default: false,
    },
    enableLink: {
        type: "boolean",
        default: false,
    },
    imageLink: {
        type: "string",
        default: "",
    },
    openInNewTab: {
        type: "boolean",
        default: false,
    },
    captionColor: {
        type: "string",
        default: "var(--eb-global-primary-color)",
    },
    captionBGColor: {
        type: "string",
        default: "var(--eb-global-background-color)",
    },
    // hoverEffect: {
    //     type: "string",
    //     default: "no-effect",
    // },

    // Image Masking — base
    imageMaskEnable: {
        type: "boolean",
        default: false,
    },
    imageMaskType: {
        type: "string",
        default: "clip", // "clip" | "svg"
    },
    imageMaskClipPreset: {
        type: "string",
        default: "bavel",
    },
    imageMaskUseClipCustom: {
        type: "boolean",
        default: false,
    },
    imageMaskClipCustom: {
        type: "string",
        // 10-vertex decagon — a sensible starter polygon when the user toggles
        // "Use Custom Clip Path". The CSS emitter tolerates the full
        // `clip-path: …;` declaration form and strips it at render time.
        default: "clip-path: polygon(50% 0%, 80% 10%, 100% 35%, 100% 70%, 80% 90%, 50% 100%, 20% 90%, 0% 70%, 0% 35%, 20% 10%);",
    },
    imageMaskSvgPreset: {
        type: "string",
        default: "blob",
    },
    imageMaskSvgCustomUrl: {
        type: "string",
        default: "",
    },
    imageMaskSvgCustomId: {
        type: "number",
        default: 0,
    },
    imageMaskSize: {
        type: "string",
        default: "contain",
    },
    imageMaskCustomSize: {
        type: "object",
        default: { size: 100, unit: "%" },
    },
    imageMaskPosition: {
        type: "string",
        default: "center center",
    },
    imageMaskRepeat: {
        type: "string",
        default: "no-repeat",
    },

    // Image Masking — hover state
    imageMaskHoverEnable: {
        type: "boolean",
        default: false,
    },
    imageMaskHoverClipPreset: {
        type: "string",
        default: "star",
    },
    imageMaskHoverUseClipCustom: {
        type: "boolean",
        default: false,
    },
    imageMaskHoverClipCustom: {
        type: "string",
        // Matches the Normal-state default; user can edit per state once they
        // toggle "Use Custom Clip Path" inside the Hover tab.
        default: "clip-path: polygon(50% 0%, 80% 10%, 100% 35%, 100% 70%, 80% 90%, 50% 100%, 20% 90%, 0% 70%, 0% 35%, 20% 10%);",
    },
    imageMaskHoverSvgPreset: {
        type: "string",
        default: "blob",
    },
    imageMaskHoverSvgCustomUrl: {
        type: "string",
        default: "",
    },
    imageMaskHoverSvgCustomId: {
        type: "number",
        default: 0,
    },
    imageMaskHoverTransition: {
        type: "number",
        default: 300, // ms
    },
    // CSS selector (descendant of the block) whose :hover triggers the mask
    // change. Empty → hovering the whole block triggers it. Mirrors EA's
    // eael_image_masking_hover_selector.
    imageMaskHoverSelector: {
        type: "string",
        default: "",
    },

    // Image Masking — morphing (Pro)
    // Free defines the schema so post_content stays portable when Pro
    // toggles on/off. Pro owns the inspector controls and frontend runtime;
    // Free only renders the upsell when type === "morphing".
    imageMaskMorphSubtype: {
        type: "string",
        default: "svg", // "clip" | "svg"
    },
    imageMaskMorphClipShapes: {
        type: "array",
        // Four-shape default mirroring EA's Image Masking morphing → Clip Path
        // starter library, so a fresh "Morphing → Clip Path" picker animates
        // between recognisable shapes without any user setup.
        // All four are 6-point polygons with a CONSISTENT `%`-on-every-coord
        // string template. GSAP can only interpolate clip-path:polygon()
        // when both shapes share an identical non-numeric scaffold — mixing
        // `0%` and bare `0` made it snap (jump-cut) instead of morph. Keep
        // these uniform; the runtime normalizer coerces user shapes too.
        default: [
            {
                title: "Shape 1",
                value: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
            },
            {
                title: "Shape 2",
                value: "polygon(11% 0%, 89% 0%, 100% 50%, 90% 100%, 12% 99%, 0% 50%)",
            },
            {
                title: "Shape 3",
                value: "polygon(11% 0%, 89% 0%, 73% 50%, 90% 100%, 12% 99%, 24% 50%)",
            },
            {
                title: "Shape 4",
                value: "polygon(11% 0%, 89% 0%, 100% 37%, 90% 100%, 12% 99%, 0% 70%)",
            },
        ],
    },
    imageMaskMorphSvgPool: {
        type: "string",
        default: "blob", // "blob" | "brush" | "dimond" | "custom"
    },
    imageMaskMorphSvgCustom: {
        type: "array",
        // Empty default — per QA report CONCERN C, inline SVG defaults were
        // bloating post_content by ~1.2 KB per masked block even when the user
        // never opened the Custom pool. Pro's Morphing inspector now seeds the
        // 4 starter blobs on demand (only when the user actually picks Custom)
        // so the post stays lean and user expectation ("4 like EA") is met at
        // the UI layer rather than the schema layer.
        default: [],
    },
    imageMaskMorphDuration: {
        type: "number",
        default: 6, // seconds
    },
    imageMaskMorphLoop: {
        type: "boolean",
        default: true,
    },
    imageMaskMorphEase: {
        type: "string",
        default: "sine.inOut",
    },
    imageMaskMorphRotate: {
        type: "boolean",
        default: false,
    },
    imageMaskMorphRotateDeg: {
        type: "number",
        default: 90,
    },
    imageMaskMorphExclude: {
        type: "string",
        default: "",
    },
};

const applyAttrName = (attributes, attrName = "") => {
    if (!attrName) {
        return attributes;
    }

    return Object.keys(attributes).reduce((newAttributes, key) => {
        const prefixedKey = `${attrName}${upperFirst(camelCase(key))}`;
        newAttributes[prefixedKey] = { ...attributes[key] };
        return newAttributes;
    }, {});
};

export const addAttributes = (props) => {
    const {
        attrObject = {},
        attrName = "",
        hasBorder = true,
        border = { key: IMAGE_BORDER },
        hasPadding = true,
        padding = {
            key: IMAGE_PADDING,
        },
        hasMargin = true,
        margin = {
            key: IMAGE_MARGIN,
        },
        hasWidth = true,
        width = {
            key: IMAGE_WIDTH,
        },
        hasHeight = true,
        height = {
            key: IMAGE_HEIGHT,
        },
        useImageSize = false,
        imageSize = {
            key: IMAGE_SIZE,
        },
        hasRadius = false,
        radius = {
            key: IMAGE_RADIUS,
        },
        useImageAlign = false,
        imageAlign = {
            key: IMAGE_ALIGNMENT,
            default: {
                defaultAlign: "center",
                defaultTabAlign: "center",
                defaultMobileAlign: "center",
            },
        },
    } = props;
    let renamedObject = {};

    for (const [oldKey, newKey] of Object.entries(attrObject)) {
        if (imgAttributes.hasOwnProperty(oldKey)) {
            renamedObject[newKey] = imgAttributes[oldKey];
        }
    }

    let remainingAttributes = {};
    for (const [key, value] of Object.entries(imgAttributes)) {
        if (!attrObject.hasOwnProperty(key)) {
            remainingAttributes[key] = value;
        }
    }

    if (attrName.length > 0) {
        remainingAttributes = applyAttrName(remainingAttributes, attrName);
    }

    let borderObject = {};
    if (hasBorder) {
        borderObject = generateBorderShadowAttributes(border?.key, border?.default);
    }

    let paddingObject = {};
    if (hasPadding) {
        paddingObject = generateDimensionsAttributes(
            padding?.key,
            padding?.default
        );
    }

    let marginObject = {};
    if (hasMargin) {
        marginObject = generateDimensionsAttributes(margin?.key, margin?.default);
    }

    let fixedWidth = {};
    if (hasWidth) {
        fixedWidth = generateResponsiveRangeAttributes(width?.key, width?.default);
    }

    let fixedHeight = {};
    if (hasHeight) {
        fixedHeight = generateResponsiveRangeAttributes(
            height?.key,
            height?.default
        );
    }

    let fixedImageSize = {};
    if (useImageSize) {
        fixedImageSize = generateResponsiveRangeAttributes(
            imageSize?.key,
            imageSize?.default
        );
    }

    let fixedRadius = {};
    if (hasRadius) {
        fixedRadius = generateResponsiveRangeAttributes(
            radius?.key,
            radius?.default
        );
    }

    let imageAlignObject = {};
    if (useImageAlign) {
        imageAlignObject = generateResponsiveAlignAttributes(
            imageAlign?.key,
            imageAlign?.default
        );
    }

    let captionObject = {};
    captionObject = {
        ...generateDimensionsAttributes(CAPTION_MARGIN),
        ...generateDimensionsAttributes(CAPTION_PADDING),
        ...generateTypographyAttributes(CAPTION_TYPOGRAPHY, {
            fontSize: 13,
        }),
        ...generateResponsiveRangeAttributes(CAPTION_WIDTH),
        ...generateResponsiveAlignAttributes(TEXT_ALIGNMENT, {
            defaultAlign: "center",
            defaultTabAlign: "center",
            defaultMobileAlign: "center",
        }),
    };

    renamedObject = {
        ...renamedObject,
        ...remainingAttributes,
        ...borderObject,
        ...paddingObject,
        ...marginObject,
        ...fixedWidth,
        ...fixedHeight,
        ...fixedImageSize,
        ...fixedRadius,
        ...imageAlignObject,
        ...captionObject,
    };

    return renamedObject;
};
