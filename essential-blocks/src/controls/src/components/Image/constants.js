import { __ } from "@wordpress/i18n";

export const OBJECT_FIT = [
	{ label: __("Default", "essential-blocks"), value: "" },
	{ label: __("Fill", "essential-blocks"), value: "fill" },
	{ label: __("Cover", "essential-blocks"), value: "cover" },
	{ label: __("Contain", "essential-blocks"), value: "contain" },
	{ label: __("Scale Down", "essential-blocks"), value: "scale-down" },
];

export const STYLES = [
    { label: __("Rounded", "essential-blocks"), value: "rounded" },
    { label: __("Square", "essential-blocks"), value: "square" },
    { label: __("Circle", "essential-blocks"), value: "circle" },
    { label: __("Octagon", "essential-blocks"), value: "octagon" },
    { label: __("Rhombus", "essential-blocks"), value: "rhombus" },
    { label: __("Triangle", "essential-blocks"), value: "triangle" },
];

export const HOVER_EFFECT = [
    { label: __("No Effect", "essential-blocks"), value: "no-effect" },
    { label: __("Zoom In", "essential-blocks"), value: "zoom-in" },
    { label: __("Zoom Out", "essential-blocks"), value: "zoom-out" },
    { label: __("Slide", "essential-blocks"), value: "slide" },
    { label: __("Blur", "essential-blocks"), value: "blur" },
];

export const OBJECT_POSITION = [
	{ label: __("Center Center", "essential-blocks"), value: "center center" },
	{ label: __("Center Left", "essential-blocks"), value: "center left" },
	{ label: __("Center Right", "essential-blocks"), value: "center right" },
	{ label: __("Top Center", "essential-blocks"), value: "top center" },
	{ label: __("Top Left", "essential-blocks"), value: "top left" },
	{ label: __("Top Right", "essential-blocks"), value: "top right" },
	{ label: __("Bottom Center", "essential-blocks"), value: "bottom center" },
	{ label: __("Bottom Left", "essential-blocks"), value: "bottom left" },
	{ label: __("Bottom Right", "essential-blocks"), value: "bottom right" },
];

export const CAPTION_STYLES = [
    { label: __("Style 1", "essential-blocks"), value: "caption-style-1" },
    { label: __("Style 2", "essential-blocks"), value: "caption-style-2" },
];

export const TEXT_ALIGN = [
    { label: __("Left", "essential-blocks"), value: "left" },
    { label: __("Right", "essential-blocks"), value: "right" },
    { label: __("Center", "essential-blocks"), value: "center" },
    { label: __("Justify", "essential-blocks"), value: "justify" },
];

export const VERTICAL_ALIGN = [
    { label: __("Top", "essential-blocks"), value: "top" },
    { label: __("Middle", "essential-blocks"), value: "middle" },
    { label: __("Bottom", "essential-blocks"), value: "bottom" },
];

export const HORIZONTAL_ALIGN = [
    { label: __("Left", "essential-blocks"), value: "left" },
    { label: __("Center", "essential-blocks"), value: "center" },
    { label: __("Right", "essential-blocks"), value: "right" },
];

export const VERTICAL_ALIGN_CAP_2 = [
    { label: __("Top", "essential-blocks"), value: "top" },
    { label: __("Bottom", "essential-blocks"), value: "bottom" },
];

export const UNIT_TYPES = [
    { label: "px", value: "px" },
    { label: "%", value: "%" },
];

export const IMAGE_ALIGN = [
    { label: __("Left", "essential-blocks"), value: "flex-start" },
    { label: __("Center", "essential-blocks"), value: "center" },
    { label: __("Right", "essential-blocks"), value: "flex-end" },
];

// responsive range control
export const IMAGE_WIDTH = "imgWidth";
export const IMAGE_HEIGHT = "imgHeight";
export const IMAGE_SIZE = "imgSize";
export const IMAGE_RADIUS = "imgRadius";
// dimension control
export const IMAGE_PADDING = "imgPadding";
export const IMAGE_MARGIN = "imgMargin";
// border
export const IMAGE_BORDER = "imgBrdShw";
export const CAPTION_MARGIN = "captionMargin";
export const CAPTION_PADDING = "captionPadding";
export const CAPTION_TYPOGRAPHY = "captionTypo";
export const CAPTION_WIDTH = "captionWidth";
export const TEXT_ALIGNMENT = "textAlign";
export const IMAGE_ALIGNMENT = "imageAlign";

// Image Masking
export const IMAGE_MASK_TYPES = [
    { label: __("Clip Path", "essential-blocks"), value: "clip" },
    { label: __("SVG Mask", "essential-blocks"), value: "svg" },
    { label: __("Morphing", "essential-blocks"), value: "morphing", isPro: true },
];

export const IMAGE_MASK_SIZE_OPTIONS = [
    { label: __("Default", "essential-blocks"), value: "" },
    { label: __("Auto", "essential-blocks"), value: "auto" },
    { label: __("Cover", "essential-blocks"), value: "cover" },
    { label: __("Contain", "essential-blocks"), value: "contain" },
    { label: __("Custom", "essential-blocks"), value: "custom" },
];

export const IMAGE_MASK_POSITION_OPTIONS = [
    { label: __("Center Center", "essential-blocks"), value: "center center" },
    { label: __("Left Top", "essential-blocks"), value: "left top" },
    { label: __("Left Center", "essential-blocks"), value: "left center" },
    { label: __("Left Bottom", "essential-blocks"), value: "left bottom" },
    { label: __("Center Top", "essential-blocks"), value: "center top" },
    { label: __("Center Bottom", "essential-blocks"), value: "center bottom" },
    { label: __("Right Top", "essential-blocks"), value: "right top" },
    { label: __("Right Center", "essential-blocks"), value: "right center" },
    { label: __("Right Bottom", "essential-blocks"), value: "right bottom" },
];

export const IMAGE_MASK_REPEAT_OPTIONS = [
    { label: __("No Repeat", "essential-blocks"), value: "no-repeat" },
    { label: __("Repeat", "essential-blocks"), value: "repeat" },
    { label: __("Repeat X", "essential-blocks"), value: "repeat-x" },
    { label: __("Repeat Y", "essential-blocks"), value: "repeat-y" },
];

// Clip-path preset → CSS polygon() string. Thumbnail filename matches the key.
export const IMAGE_MASK_CLIP_PRESETS = {
    "bavel": {
        label: __("Bavel", "essential-blocks"),
        value: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
    },
    "rabbet": {
        label: __("Rabbet", "essential-blocks"),
        value: "polygon(0% 15%, 15% 15%, 15% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 85%, 85% 85%, 85% 100%, 15% 100%, 15% 85%, 0% 85%)",
    },
    "chevron-left": {
        label: __("Chevron Left", "essential-blocks"),
        value: "polygon(100% 0%, 75% 50%, 100% 100%, 25% 100%, 0% 50%, 25% 0%)",
    },
    "chevron-right": {
        label: __("Chevron Right", "essential-blocks"),
        value: "polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%)",
    },
    "star": {
        label: __("Star", "essential-blocks"),
        value: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
    },
    "diamond": {
        label: __("Diamond", "essential-blocks"),
        value: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
    },
    "hexagon": {
        label: __("Hexagon", "essential-blocks"),
        value: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
    },
    "arrow-right": {
        label: __("Arrow Right", "essential-blocks"),
        value: "polygon(0% 30%, 70% 30%, 70% 5%, 100% 50%, 70% 95%, 70% 70%, 0% 70%)",
    },
};

// SVG mask preset → filename (thumbnail and runtime URL share the same file).
// Names mirror Essential Addons' image-masking shape catalogue so users
// migrating between plugins recognise the same library. The "custom" entry
// is EB's analogue of EA's "upload" Pro tile.
export const IMAGE_MASK_SVG_PRESETS = [
    { value: "polygon", label: __("Polygon", "essential-blocks") },
    { value: "rounded", label: __("Rounded", "essential-blocks") },
    { value: "arch-down", label: __("Arch Down", "essential-blocks") },
    { value: "arch-group", label: __("Arch Group", "essential-blocks") },
    { value: "arch-up", label: __("Arch Up", "essential-blocks") },
    { value: "asterisk", label: __("Asterisk", "essential-blocks") },
    { value: "blob", label: __("Blob", "essential-blocks") },
    { value: "blocks", label: __("Blocks", "essential-blocks") },
    { value: "brash-1", label: __("Brash 1", "essential-blocks") },
    { value: "brash-2", label: __("Brash 2", "essential-blocks") },
    { value: "brash-3", label: __("Brash 3", "essential-blocks") },
    { value: "burst", label: __("Burst", "essential-blocks") },
    { value: "chat", label: __("Chat", "essential-blocks") },
    { value: "hex-tile", label: __("Hex Tile", "essential-blocks") },
    { value: "leaf", label: __("Leaf", "essential-blocks") },
    { value: "oval", label: __("Oval", "essential-blocks") },
    { value: "pixel-cross", label: __("Pixel Cross", "essential-blocks") },
    { value: "quote", label: __("Quote", "essential-blocks") },
    { value: "star-dimond", label: __("Star Diamond", "essential-blocks") },
    { value: "custom", label: __("Custom", "essential-blocks") },
];

// Resolve a preset's thumbnail/runtime URL. Falls back to placeholder if localize is missing.
export const getMaskAssetUrl = (folder, name) => {
    const base =
        typeof EssentialBlocksLocalize !== "undefined" && EssentialBlocksLocalize.image_url
            ? EssentialBlocksLocalize.image_url
            : "";
    return `${base}/masks/${folder}/${name}.svg`;
};