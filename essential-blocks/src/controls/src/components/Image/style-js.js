/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
/**
 * Internal depencencies
 */
import {
    IMAGE_BORDER,
    IMAGE_PADDING,
    IMAGE_MARGIN,
    IMAGE_WIDTH,
    IMAGE_SIZE,
    IMAGE_RADIUS,
    IMAGE_HEIGHT,
    CAPTION_MARGIN,
    CAPTION_PADDING,
    CAPTION_TYPOGRAPHY,
    CAPTION_WIDTH,
    TEXT_ALIGNMENT,
    IMAGE_ALIGN,
    IMAGE_ALIGNMENT,
    IMAGE_MASK_CLIP_PRESETS,
    getMaskAssetUrl,
} from "./constants";
import { camelCase, upperFirst } from "lodash";

import {
    generateTypographyStyles,
    generateResponsiveRangeStyles,
    useBlockAttributes,
    generateDimensionsControlStyles,
    generateBackgroundControlStyles,
    generateBorderShadowStyles,
    generateResponsiveAlignStyles,
} from "../../index";

/**
 * Make a custom mask URL safe to drop into an unquoted CSS `url(...)`.
 *
 * The URL is a block attribute, so it can be edited by hand in the code
 * editor. Only http(s), protocol-relative and relative URLs are allowed, and
 * the characters that could close the `url(...)` or the rule body are removed
 * (same CSS-injection concern as the clip-path `{}` stripping below).
 */
const cssSafeMaskUrl = (raw) => {
    if (typeof raw !== "string") return "";
    const url = raw.trim();
    if (/^[a-z][a-z0-9+.-]*:/i.test(url) && !/^https?:/i.test(url)) return "";
    return url.replace(/["'()\\{};<>\s]/g, "");
};

/**
 * Static first-shape declarations for morphing masks.
 *
 * Morphing is animated on the frontend by Pro's GSAP runtime, but the editor
 * (and the pre-JS frontend frame) needs *something* visible — otherwise the
 * image renders as an unmasked rectangle until the script runs (and not at
 * all in the editor, since the runtime is frontend-only). This emits the
 * FIRST morph shape as a plain static mask so the editor shows the shaped
 * image. Mirrors EA's editor handler, which also injects only static CSS for
 * masking and never animates in the editor.
 *
 * For clip morphing the first polygon comes from `imageMaskMorphClipShapes`
 * (Gutenberg merges the schema default on read in the editor, so this is
 * populated even for untouched blocks). For SVG morphing the first pool file
 * URL is resolved from the Pro localize bridge — only relevant when Pro is
 * active, which is the only time morphing is configurable anyway.
 *
 * @param {Function} attrValue resolver bound to the caller's prefix scheme
 * @returns {string} CSS declarations, or "" when nothing is resolvable
 */
const morphPreviewDecls = (attrValue) => {
    const subtype = attrValue("imageMaskMorphSubtype") || "svg";

    if (subtype === "clip") {
        const shapes = attrValue("imageMaskMorphClipShapes");
        const first =
            Array.isArray(shapes) && shapes.length
                ? typeof shapes[0] === "string"
                    ? shapes[0]
                    : shapes[0] && shapes[0].value
                : "";
        const cleaned = (first || "")
            .replace(/^\s*(-webkit-)?clip-path\s*:\s*/i, "")
            .replace(/\s*;\s*$/, "")
            .trim();
        return cleaned ? `clip-path: ${cleaned};` : "";
    }

    if (subtype === "svg") {
        const pool = attrValue("imageMaskMorphSvgPool") || "blob";
        let url = "";
        if (pool === "custom") {
            const custom = attrValue("imageMaskMorphSvgCustom");
            const firstItem =
                Array.isArray(custom) && custom.length ? custom[0] : null;
            url = firstItem && firstItem.url ? firstItem.url : "";
        } else {
            const base =
                typeof EssentialBlocksProLocalize !== "undefined" &&
                    EssentialBlocksProLocalize.image_url
                    ? EssentialBlocksProLocalize.image_url
                    : "";
            url = base ? `${base}/morphing/${pool}-1.svg` : "";
        }
        if (!url) return "";
        return [
            `mask-image: url(${url});`,
            `-webkit-mask-image: url(${url});`,
            `mask-size: contain;`,
            `-webkit-mask-size: contain;`,
            `mask-repeat: no-repeat;`,
            `-webkit-mask-repeat: no-repeat;`,
            `mask-position: center center;`,
            `-webkit-mask-position: center center;`,
        ].join("\n            ");
    }

    return "";
};

/**
 * Generates raw mask declarations (clip-path / mask-image / size / position /
 * repeat / -webkit-* variants) for callers that render images outside the
 * standard `.eb-image-wrapper .eb-image-wrapper-inner img` selector emitted
 * by `Style()`.
 *
 * Designed for blocks that build their own image markup (slider's
 * `.eb-slider-item img`, team-member's `.eb-team-member-image img`, etc.) so
 * they can splice the mask declarations into their existing CSS rules instead
 * of duplicating the parser logic per block.
 *
 * Mirrors `Style()`'s `buildMaskDeclarations` logic — kept additive so the
 * existing component-internal version stays untouched (no regression risk).
 *
 * @param {Object}        params
 * @param {Object}        params.attributes      Block attributes (typically `useBlockAttributes()` output)
 * @param {string}        [params.attrPrefix=""] Optional prefix, mirrors `Style()`'s contract
 * @param {Object}        [params.imageAttrProps] Optional explicit attr-name map (overrides prefix)
 * @returns {{enabled: boolean, baseDecls: string, hoverDecls: string, transition: string}}
 */
export const generateMaskStyles = ({
    attributes,
    attrPrefix = "",
    imageAttrProps,
} = {}) => {
    if (!attributes) {
        return { enabled: false, baseDecls: "", hoverDecls: "", transition: "" };
    }

    const getAttrName = (attrKey) => {
        const finalKey =
            imageAttrProps && imageAttrProps[attrKey]
                ? imageAttrProps[attrKey]
                : attrKey;
        if (imageAttrProps && imageAttrProps[attrKey]) return finalKey;
        return attrPrefix
            ? `${attrPrefix}${upperFirst(camelCase(finalKey))}`
            : finalKey;
    };
    const attrValue = (attrKey) => attributes[getAttrName(attrKey)];

    const enabled = !!attrValue("imageMaskEnable");
    if (!enabled) {
        return { enabled: false, baseDecls: "", hoverDecls: "", transition: "" };
    }

    const hoverEnabled = !!attrValue("imageMaskHoverEnable");
    const maskType = attrValue("imageMaskType");

    const buildDecls = (state) => {
        const isHover = state === "hover";
        const prefix = isHover ? "imageMaskHover" : "imageMask";

        // Morphing animates on the frontend via Pro's GSAP runtime. Emit the
        // FIRST shape as a static mask so the editor (and pre-JS frontend
        // frame) shows the shaped image instead of a bare rectangle. Hover
        // state isn't part of the morphing model. Matches EA's editor.
        if (maskType === "morphing") {
            return isHover ? "" : morphPreviewDecls(attrValue);
        }

        if (maskType === "clip") {
            const useCustom = attrValue(prefix + "UseClipCustom");
            let value = "";
            if (useCustom) {
                const raw = attrValue(prefix + "ClipCustom");
                // Tolerate users pasting the full "clip-path: ...;" form.
                // Also strip `{` / `}` — a clip-path value never needs them
                // and accepting them lets a poisoned legacy attribute escape
                // its rule body in the generated CSS (CSS injection).
                value = (raw || "")
                    .replace(/^\s*clip-path:\s*/i, "")
                    .replace(/;\s*$/, "")
                    .replace(/[{}]/g, "")
                    .trim();
            } else {
                const presetKey = attrValue(prefix + "ClipPreset");
                if (presetKey && IMAGE_MASK_CLIP_PRESETS[presetKey]) {
                    value = IMAGE_MASK_CLIP_PRESETS[presetKey].value;
                }
            }
            return value ? `clip-path: ${value};` : "";
        }

        if (maskType === "svg") {
            const customUrl = cssSafeMaskUrl(attrValue(prefix + "SvgCustomUrl"));
            const preset = attrValue(prefix + "SvgPreset");
            const url = customUrl
                ? customUrl
                : preset && preset !== "custom"
                    ? getMaskAssetUrl("svg-shapes", preset)
                    : "";
            if (!url) return "";

            const decls = [
                `mask-image: url(${url});`,
                `-webkit-mask-image: url(${url});`,
            ];

            // Size/position/repeat only emitted on the base state — they don't
            // change on hover, only the shape does.
            if (!isHover) {
                const size = attrValue("imageMaskSize");
                if (size === "custom") {
                    const cs = attrValue("imageMaskCustomSize") || {};
                    const sizeStr = `${cs.size || 100}${cs.unit || "%"}`;
                    decls.push(`mask-size: ${sizeStr};`);
                    decls.push(`-webkit-mask-size: ${sizeStr};`);
                } else if (size) {
                    decls.push(`mask-size: ${size};`);
                    decls.push(`-webkit-mask-size: ${size};`);
                }
                const pos = attrValue("imageMaskPosition");
                if (pos) {
                    decls.push(`mask-position: ${pos};`);
                    decls.push(`-webkit-mask-position: ${pos};`);
                }
                const rpt = attrValue("imageMaskRepeat");
                if (rpt) {
                    decls.push(`mask-repeat: ${rpt};`);
                    decls.push(`-webkit-mask-repeat: ${rpt};`);
                }
            }

            return decls.join("\n            ");
        }

        return "";
    };

    const baseDecls = buildDecls("base");
    const hoverDecls = hoverEnabled ? buildDecls("hover") : "";
    const maskTransitionMs = attrValue("imageMaskHoverTransition") || 300;
    const transition = hoverEnabled
        ? `transition: clip-path ${maskTransitionMs}ms ease, mask-image ${maskTransitionMs}ms ease, -webkit-mask-image ${maskTransitionMs}ms ease;`
        : "";

    return { enabled: true, baseDecls, hoverDecls, transition };
};

export const Style = ({
    blockId,
    wrapperClass,
    imageAttrProps,
    attrPrefix = "",
    className = "",
    hasFilter = true,
    width = IMAGE_WIDTH,
    height = IMAGE_HEIGHT,
    useImageSize = false,
    imageSize = IMAGE_SIZE,
    radius = IMAGE_RADIUS,
    border = IMAGE_BORDER,
    padding = IMAGE_PADDING,
    margin = IMAGE_MARGIN,
    useImageAlign = false,
    imageAlign = IMAGE_ALIGNMENT,
    imageAlignProperty = "justify-content",
}) => {
    const attributes = useBlockAttributes();

    const getAttrName = (attrKey) => {
        const finalKey =
            imageAttrProps && imageAttrProps[attrKey]
                ? imageAttrProps[attrKey]
                : attrKey;

        if (imageAttrProps && imageAttrProps[attrKey]) {
            return finalKey;
        }

        return attrPrefix
            ? `${attrPrefix}${upperFirst(camelCase(finalKey))}`
            : finalKey;
    };

    const attrValue = (attrKey) => attributes[getAttrName(attrKey)];

    if (blockId === "" || wrapperClass === "") {
        return;
    }

    const customClass = className?.length > 0 ? "." + className : "";
    // Default values in case of undefined
    const filterBlur =
        attrValue("imageBlur") !== undefined ? attrValue("imageBlur") : 0;
    const filterBrightness =
        attrValue("imageBrightness") !== undefined
            ? attrValue("imageBrightness")
            : 1;
    const filterContrast =
        attrValue("imageContrast") !== undefined ? attrValue("imageContrast") : 1;
    const filterGrayscale =
        attrValue("imageGrayscale") !== undefined ? attrValue("imageGrayscale") : 0;
    const filterHueRotate =
        attrValue("imageHueRotate") !== undefined ? attrValue("imageHueRotate") : 0;
    const filterInvert =
        attrValue("imageInvert") !== undefined ? attrValue("imageInvert") : 0;
    const filterOpacity =
        attrValue("imageOpacity") !== undefined ? attrValue("imageOpacity") : 1;
    const filterSaturate =
        attrValue("imageSaturate") !== undefined ? attrValue("imageSaturate") : 1;
    const filterSepia =
        attrValue("imageSepia") !== undefined ? attrValue("imageSepia") : 0;

    const filterStyle = `
  blur(${filterBlur}px)
  brightness(${filterBrightness})
  contrast(${filterContrast})
  grayscale(${filterGrayscale})
  hue-rotate(${filterHueRotate}deg)
  invert(${filterInvert})
  opacity(${filterOpacity})
  saturate(${filterSaturate})
  sepia(${filterSepia})
`.trim();

    const {
        rangeStylesDesktop: imgWidthDesktop,
        rangeStylesTab: imgWidthTab,
        rangeStylesMobile: imgWidthMobile,
    } = generateResponsiveRangeStyles({
        controlName: width,
        property: "width",
        attributes,
    });

    const {
        rangeStylesDesktop: imgHeightDesktop,
        rangeStylesTab: imgHeightTab,
        rangeStylesMobile: imgHeightMobile,
    } = generateResponsiveRangeStyles({
        controlName: height,
        property: "height",
        attributes,
    });

    const {
        rangeStylesDesktop: imgSizeWidthDesktop,
        rangeStylesTab: imgSizeWidthTab,
        rangeStylesMobile: imgSizeWidthMobile,
    } = generateResponsiveRangeStyles({
        controlName: imageSize,
        property: "width",
        attributes,
    });

    const {
        rangeStylesDesktop: imgSizeHeightDesktop,
        rangeStylesTab: imgSizeHeightTab,
        rangeStylesMobile: imgSizeHeightMobile,
    } = generateResponsiveRangeStyles({
        controlName: imageSize,
        property: "height",
        attributes,
    });

    const {
        rangeStylesDesktop: imgRadiusDesktop,
        rangeStylesTab: imgRadiusTab,
        rangeStylesMobile: imgRadiusMobile,
    } = generateResponsiveRangeStyles({
        controlName: radius,
        property: "border-radius",
        attributes,
    });

    const {
        dimensionStylesDesktop: imgPaddingDesktop,
        dimensionStylesTab: imgPaddingTab,
        dimensionStylesMobile: imgPaddingMobile,
    } = generateDimensionsControlStyles({
        controlName: padding,
        styleFor: "padding",
        attributes,
    });

    const {
        dimensionStylesDesktop: imgMarginDesktop,
        dimensionStylesTab: imgMarginTab,
        dimensionStylesMobile: imgMarginMobile,
    } = generateDimensionsControlStyles({
        controlName: margin,
        styleFor: "margin",
        attributes,
    });

    const {
        styesDesktop: bdShadowStyesDesktop,
        styesTab: bdShadowStyesTab,
        styesMobile: bdShadowStyesMobile,
        stylesHoverDesktop: bdShadowStylesHoverDesktop,
        stylesHoverTab: bdShadowStylesHoverTab,
        stylesHoverMobile: bdShadowStylesHoverMobile,
        transitionStyle: bdShadowTransitionStyle,
    } = generateBorderShadowStyles({
        controlName: border,
        attributes,
    });

    /* Caption Margin */
    const {
        dimensionStylesDesktop: captionMarginDesktop,
        dimensionStylesTab: captionMarginTab,
        dimensionStylesMobile: captionMarginMobile,
    } = generateDimensionsControlStyles({
        controlName: CAPTION_MARGIN,
        styleFor: "margin",
        attributes,
    });

    /* Caption Padding */
    const {
        dimensionStylesDesktop: captionPaddingDesktop,
        dimensionStylesTab: captionPaddingTab,
        dimensionStylesMobile: captionPaddingMobile,
    } = generateDimensionsControlStyles({
        controlName: CAPTION_PADDING,
        styleFor: "padding",
        attributes,
    });

    // Caption Typography
    const {
        typoStylesDesktop: captionTypographyDesktop,
        typoStylesTab: captionTypographyTab,
        typoStylesMobile: captionTypographyMobile,
    } = generateTypographyStyles({
        attributes,
        prefixConstant: CAPTION_TYPOGRAPHY,
    });

    const {
        rangeStylesDesktop: captionWidthDesktop,
        rangeStylesTab: captionWidthTab,
        rangeStylesMobile: captionWidthMobile,
    } = generateResponsiveRangeStyles({
        controlName: CAPTION_WIDTH,
        property: "width",
        attributes,
    });

    const {
        alignStylesDesktop: textAlignDesktop,
        alignStylesTab: textAlignTab,
        alignStylesMobile: textAlignMobile,
    } = generateResponsiveAlignStyles({
        controlName: TEXT_ALIGNMENT,
        property: "text-align",
        attributes,
    });

    const {
        alignStylesDesktop: imageAlignDesktop,
        alignStylesTab: imageAlignTab,
        alignStylesMobile: imageAlignMobile,
    } = generateResponsiveAlignStyles({
        controlName: imageAlign,
        property: imageAlignProperty,
        attributes,
    });

    // Image Masking — computes per-state CSS for clip-path or SVG mask.
    // Returns a string of CSS declarations to inject into the `img` rule.
    // Returns "" when masking is disabled or values are missing — keeps the
    // emitted stylesheet clean of empty rules.
    const maskingEnabled = !!attrValue("imageMaskEnable");
    const maskingHoverEnabled = !!attrValue("imageMaskHoverEnable");
    const maskType = attrValue("imageMaskType");

    const buildMaskDeclarations = (state) => {
        const isHover = state === "hover";
        const prefix = isHover ? "imageMaskHover" : "imageMask";

        // Morphing animates on the frontend via Pro's GSAP runtime. Emit the
        // FIRST shape as a static mask so the editor (and pre-JS frontend
        // frame) shows the shaped image instead of a bare rectangle. Hover
        // state isn't part of the morphing model. Matches EA's editor.
        if (maskType === "morphing") {
            return isHover ? "" : morphPreviewDecls(attrValue);
        }

        if (maskType === "clip") {
            const useCustom = attrValue(prefix + "UseClipCustom");
            let value = "";
            if (useCustom) {
                const raw = attrValue(prefix + "ClipCustom");
                // Tolerate users pasting the full "clip-path: ...;" form.
                // Also strip `{` / `}` — a clip-path value never needs them
                // and accepting them lets a poisoned legacy attribute escape
                // its rule body in the generated CSS (CSS injection).
                value = (raw || "")
                    .replace(/^\s*clip-path:\s*/i, "")
                    .replace(/;\s*$/, "")
                    .replace(/[{}]/g, "")
                    .trim();
            } else {
                const presetKey = attrValue(prefix + "ClipPreset");
                if (presetKey && IMAGE_MASK_CLIP_PRESETS[presetKey]) {
                    value = IMAGE_MASK_CLIP_PRESETS[presetKey].value;
                }
            }
            return value ? `clip-path: ${value};` : "";
        }

        if (maskType === "svg") {
            const customUrl = cssSafeMaskUrl(attrValue(prefix + "SvgCustomUrl"));
            const preset = attrValue(prefix + "SvgPreset");
            // "custom" preset without an uploaded URL → graceful empty state.
            // The picker shows the "+" placeholder; we render the image unmasked
            // until Pro is active and the user actually uploads a file.
            const url = customUrl
                ? customUrl
                : preset && preset !== "custom"
                    ? getMaskAssetUrl("svg-shapes", preset)
                    : "";
            if (!url) return "";

            const decls = [
                `mask-image: url(${url});`,
                `-webkit-mask-image: url(${url});`,
            ];

            // Size/position/repeat only emitted on the base state — they don't
            // change on hover, only the shape does.
            if (!isHover) {
                const size = attrValue("imageMaskSize");
                if (size === "custom") {
                    const cs = attrValue("imageMaskCustomSize") || {};
                    const sizeStr = `${cs.size || 100}${cs.unit || "%"}`;
                    decls.push(`mask-size: ${sizeStr};`);
                    decls.push(`-webkit-mask-size: ${sizeStr};`);
                } else if (size) {
                    decls.push(`mask-size: ${size};`);
                    decls.push(`-webkit-mask-size: ${size};`);
                }
                const pos = attrValue("imageMaskPosition");
                if (pos) {
                    decls.push(`mask-position: ${pos};`);
                    decls.push(`-webkit-mask-position: ${pos};`);
                }
                const rpt = attrValue("imageMaskRepeat");
                if (rpt) {
                    decls.push(`mask-repeat: ${rpt};`);
                    decls.push(`-webkit-mask-repeat: ${rpt};`);
                }
            }

            return decls.join("\n            ");
        }

        return "";
    };

    const maskBaseDecls = maskingEnabled ? buildMaskDeclarations("base") : "";
    const maskHoverDecls =
        maskingEnabled && maskingHoverEnabled
            ? buildMaskDeclarations("hover")
            : "";
    const maskTransitionMs = attrValue("imageMaskHoverTransition") || 300;
    // Transition applies to the masked properties only and just on the base rule
    const maskTransition =
        maskingEnabled && maskingHoverEnabled
            ? `transition: clip-path ${maskTransitionMs}ms ease, mask-image ${maskTransitionMs}ms ease, -webkit-mask-image ${maskTransitionMs}ms ease;`
            : "";

    // Resolve the raw SVG mask URL for a state (preset or custom upload).
    const svgMaskUrl = (state) => {
        const prefix = state === "hover" ? "imageMaskHover" : "imageMask";
        const customUrl = cssSafeMaskUrl(attrValue(prefix + "SvgCustomUrl"));
        const preset = attrValue(prefix + "SvgPreset");
        return customUrl
            ? customUrl
            : preset && preset !== "custom"
                ? getMaskAssetUrl("svg-shapes", preset)
                : "";
    };

    // Resolve the raw clip-path value for a state (custom or preset).
    const clipMaskValue = (state) => {
        const prefix = state === "hover" ? "imageMaskHover" : "imageMask";
        if (attrValue(prefix + "UseClipCustom")) {
            // Strip `{` / `}` for the same CSS-injection reason as the main
            // paths above — a clip-path value never needs them, and accepting
            // them lets a poisoned attribute escape its rule body.
            return (attrValue(prefix + "ClipCustom") || "")
                .replace(/^\s*clip-path:\s*/i, "")
                .replace(/;\s*$/, "")
                .replace(/[{}]/g, "")
                .trim();
        }
        const presetKey = attrValue(prefix + "ClipPreset");
        return presetKey && IMAGE_MASK_CLIP_PRESETS[presetKey]
            ? IMAGE_MASK_CLIP_PRESETS[presetKey].value
            : "";
    };

    // Neither `mask-image` (discrete) nor `clip-path` between
    // different-vertex shapes can be smoothly CSS-transitioned, so a plain
    // `transition` is a no-op / snap for the hover mask. To honour "Hover
    // Transition (ms)" for BOTH svg and clip we cross-fade a hover-shaped
    // copy of the SAME image rendered in an ::after overlay (opacity IS
    // animatable). No markup change, so every block using this component
    // gets the smooth transition; the base <img> keeps the base shape (its
    // hover swap is suppressed below) and fades out while the overlay fades
    // in. Morphing is GSAP-driven and excluded.
    const svgHoverUrl =
        maskingEnabled && maskingHoverEnabled && maskType === "svg"
            ? svgMaskUrl("hover")
            : "";
    const clipHoverValue =
        maskingEnabled && maskingHoverEnabled && maskType === "clip"
            ? clipMaskValue("hover")
            : "";
    const useCrossfade = !!svgHoverUrl || !!clipHoverValue;

    // Hover Selector (EA parity: eael_image_masking_hover_selector). When
    // set, hovering that element anywhere inside the block triggers the mask
    // change; empty → hovering the whole block triggers it.
    //
    // The mask target is always `.eb-image-wrapper-inner img/::after`, so a
    // plain descendant chain (`{sel}:hover .eb-image-wrapper-inner …`) breaks
    // whenever the chosen element ISN'T a strict ancestor of
    // `.eb-image-wrapper-inner` — e.g. the user picks `.eb-image-wrapper-inner`
    // itself, producing a doubled, non-matching selector. `:has()` (baseline
    // since 2023, fine for the WP 7.0 target) decouples the trigger from the
    // target so any selector works regardless of its position in the block.
    const hoverSel = (attrValue("imageMaskHoverSelector") || "").trim();
    const hoverTriggerSel = hoverSel
        ? `.${wrapperClass}.${blockId}:has(${hoverSel}:hover)`
        : `.${wrapperClass}.${blockId} .eb-image-wrapper:hover`;

    let maskHoverCrossfade = "";
    if (useCrossfade) {
        const imgSrc = attrValue("imageUrl") || "";
        const fit = attrValue("imgObjectFit");
        const bgSize =
            fit === "cover" || fit === "contain" ? fit : "100% 100%";
        const bgPos = attrValue("imgObjectPosition") || "center center";

        // The overlay carries the HOVER shape; only the shape mechanism
        // differs between svg (mask-image) and clip (clip-path).
        let shapeDecls;
        if (svgHoverUrl) {
            const mSizeRaw = attrValue("imageMaskSize");
            let mSize = "";
            if (mSizeRaw === "custom") {
                const cs = attrValue("imageMaskCustomSize") || {};
                mSize = `${cs.size || 100}${cs.unit || "%"}`;
            } else if (mSizeRaw) {
                mSize = mSizeRaw;
            }
            const mPos =
                attrValue("imageMaskPosition") || "center center";
            const mRpt = attrValue("imageMaskRepeat") || "no-repeat";
            shapeDecls = `-webkit-mask-image: url(${svgHoverUrl});
            mask-image: url(${svgHoverUrl});
            ${mSize ? `-webkit-mask-size: ${mSize}; mask-size: ${mSize};` : ""}
            -webkit-mask-position: ${mPos};
            mask-position: ${mPos};
            -webkit-mask-repeat: ${mRpt};
            mask-repeat: ${mRpt};`;
        } else {
            shapeDecls = `-webkit-clip-path: ${clipHoverValue};
            clip-path: ${clipHoverValue};`;
        }

        maskHoverCrossfade = `
        .${wrapperClass}.${blockId} .eb-image-wrapper .eb-image-wrapper-inner${customClass} { position: relative; }
        .${wrapperClass}.${blockId} .eb-image-wrapper .eb-image-wrapper-inner${customClass}::after {
            content: "";
            position: absolute;
            inset: 0;
            background-image: url(${imgSrc});
            background-size: ${bgSize};
            background-position: ${bgPos};
            background-repeat: no-repeat;
            ${shapeDecls}
            opacity: 0;
            transition: opacity ${maskTransitionMs}ms ease;
            pointer-events: none;
        }
        ${hoverTriggerSel} .eb-image-wrapper-inner${customClass}::after {
            opacity: 1;
        }
`;
    }

    // During a cross-fade the base <img> must fade OUT as the ::after
    // (hover-shaped copy) fades IN — otherwise both shapes stay visible at
    // once. So the base img transitions opacity (1 → 0 on hover) instead of
    // the no-op mask-image / snapping clip-path transition.
    const maskBaseTransition = useCrossfade
        ? `opacity: 1; transition: opacity ${maskTransitionMs}ms ease;`
        : maskTransition;

    // caption-style-2 keeps the caption stacked with (and the same width as)
    // the image. Since the image width is set on .eb-image-wrapper-inner and
    // the <figcaption> is its sibling, CSS can't read that px width — so the
    // shared .eb-image-wrapper is shrink-wrapped to the image (fit-content)
    // and the whole group is positioned via auto margins instead of
    // justify-content (which would be the wrong axis once it's a column).
    const isCaptionStyle2 = attrValue("captionStyle") === "caption-style-2";
    const alignToMargin = (val) => {
        switch (val) {
            case "flex-start":
                return "margin-left:0;margin-right:auto;";
            case "flex-end":
                return "margin-left:auto;margin-right:0;";
            case "center":
            default:
                return "margin-left:auto;margin-right:auto;";
        }
    };
    const captionStyle2Wrapper = (alignVal) => `
              flex-direction: column;
              width: -webkit-fit-content;
              width: fit-content;
              max-width: 100%;
              ${alignToMargin(alignVal || "center")}
  `;
    const cap2AlignDesktop = attrValue(imageAlign);
    const cap2AlignTab = attributes[`TAB${imageAlign}`];
    const cap2AlignMobile = attributes[`MOB${imageAlign}`];

    const desktopStyles = `
        ${useImageAlign
            ? `
          .${wrapperClass}.${blockId} .eb-image-wrapper {
              ${isCaptionStyle2
                ? captionStyle2Wrapper(cap2AlignDesktop)
                : imageAlignDesktop
            }
          }
          `
            : ""
        }
        .${wrapperClass}.${blockId} .eb-image-wrapper .eb-image-wrapper-inner${customClass} {
            ${imgPaddingDesktop}
            ${imgMarginDesktop}
            ${!useImageSize ? imgWidthDesktop : ""}
            ${useImageSize ? imgSizeWidthDesktop : ""}
            ${useImageSize ? imgSizeHeightDesktop : ""}
            ${!attrValue("complexStyle") && !maskingEnabled ? bdShadowStyesDesktop : ""}
            ${!attrValue("complexStyle") && !maskingEnabled ? imgRadiusDesktop : ""}
            ${!useImageSize && attrValue("imageAutoHeight")
            ? `height:auto;`
            : imgHeightDesktop
        }
            transition: ${bdShadowTransitionStyle};
        }

        .${wrapperClass}.${blockId} .eb-image-wrapper .eb-image-wrapper-inner${customClass} img {
            ${attrValue("imgObjectFit")
            ? `object-fit: ${attrValue("imgObjectFit")};`
            : ""
        }
            ${attrValue("imgObjectFit")
            ? `object-position: ${attrValue("imgObjectPosition")};`
            : ""
        }
            ${hasFilter ? `filter: ${filterStyle};` : ""}
            ${maskBaseDecls}
            ${maskBaseTransition}
        }

        .${wrapperClass}.${blockId} .eb-image-wrapper:hover .eb-image-wrapper-inner${customClass} img {
            ${bdShadowStylesHoverDesktop}
        }
        ${maskingEnabled && maskingHoverEnabled
            ? `${hoverTriggerSel} .eb-image-wrapper-inner${customClass} img {
            ${useCrossfade ? "opacity: 0;" : maskHoverDecls}
        }`
            : ""
        }
        ${maskHoverCrossfade}
        .${wrapperClass}.${blockId} .eb-image-wrapper figcaption {
            color: ${attrValue("captionColor")};
            ${textAlignDesktop}
            ${captionMarginDesktop}
            ${captionPaddingDesktop}
            ${captionTypographyDesktop}
            ${captionWidthDesktop}
        }
        .${wrapperClass}.${blockId} .eb-image-wrapper .eb-image-wrapper-inner.eb-img-caption-style-1 figcaption {
          background: ${attrValue("captionBGColor")};
        }
`;

    const tabStyles = `
          ${useImageAlign
            ? `
          .${wrapperClass}.${blockId} .eb-image-wrapper {
              ${isCaptionStyle2
                ? captionStyle2Wrapper(cap2AlignTab || cap2AlignDesktop)
                : imageAlignTab
            }
          }
          `
            : ""
        }
        .${wrapperClass}.${blockId} .eb-image-wrapper .eb-image-wrapper-inner${customClass} {
            ${imgPaddingTab}
            ${imgMarginTab}
            ${!useImageSize ? imgWidthTab : ""}
            ${useImageSize ? imgSizeWidthTab : ""}
            ${useImageSize ? imgSizeHeightTab : ""}
            ${!useImageSize && attrValue("imageAutoHeight") ? "" : imgHeightTab}
            ${!attrValue("complexStyle") && !maskingEnabled ? bdShadowStyesTab : ""}
            ${!attrValue("complexStyle") && !maskingEnabled ? imgRadiusTab : ""}
        }

        .${wrapperClass}.${blockId} .eb-image-wrapper:hover .eb-image-wrapper-inner${customClass} img {
            ${bdShadowStylesHoverTab}
        }

        .${wrapperClass}.${blockId} .eb-image-wrapper figcaption {
            ${textAlignTab}
            ${captionMarginTab}
            ${captionPaddingTab}
            ${captionTypographyTab}
            ${captionWidthTab}
        }
`;

    const mobileStyles = `
          ${useImageAlign
            ? `
          .${wrapperClass}.${blockId} .eb-image-wrapper {
              ${isCaptionStyle2
                ? captionStyle2Wrapper(
                    cap2AlignMobile || cap2AlignTab || cap2AlignDesktop
                )
                : imageAlignMobile
            }
          }
          `
            : ""
        }
        .${wrapperClass}.${blockId} .eb-image-wrapper .eb-image-wrapper-inner${customClass} {
            ${imgPaddingMobile}
            ${imgMarginMobile}
            ${!useImageSize ? imgWidthMobile : ""}
            ${useImageSize ? imgSizeWidthMobile : ""}
            ${useImageSize ? imgSizeHeightMobile : ""}
            ${!useImageSize && attrValue("imageAutoHeight")
            ? ""
            : imgHeightMobile
        }
            ${!attrValue("complexStyle") && !maskingEnabled ? bdShadowStyesMobile : ""}
            ${!attrValue("complexStyle") && !maskingEnabled ? imgRadiusMobile : ""}
        }

        .${wrapperClass}.${blockId} .eb-image-wrapper:hover .eb-image-wrapper-inner${customClass} img {
            ${bdShadowStylesHoverMobile}
        }

        .${wrapperClass}.${blockId} .eb-image-wrapper figcaption {
            ${textAlignMobile}
            ${captionMarginMobile}
            ${captionPaddingMobile}
            ${captionTypographyMobile}
            ${captionWidthMobile}
        }
`;

    return {
        imgDesktopStyle: desktopStyles,
        imgTabStyle: tabStyles,
        imgMobileStyle: mobileStyles,
    };
};
