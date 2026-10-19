/**
 * Extensions registry: metadata for the Extensions tab.
 *
 * Runtime state is NOT stored here. Toggleable entries read/write a key of
 * the existing `eb_settings` option (save_eb_admin_options); AI entries
 * read their status from `eb_write_with_ai` and are configured in AI Suite.
 *
 * Entry shape:
 * {
 *   key: string,
 *   title: string,
 *   description: string,
 *   icon: string,               // key of EXTENSION_ICONS, or an image URL
 *   tier: 'free' | 'pro',
 *   category: string,           // key of EXTENSION_CATEGORIES
 *   toggle?: { settingKey: string, default: boolean },
 *   status?: { option: 'eb_write_with_ai', key: string, default: boolean },
 *   link?: { tab: string, label: string },
 *   doc?: string,
 *   warning?: string,           // shown under the description
 * }
 * Entries without `toggle`/`status` are always active (when available).
 */
import { __ } from "@wordpress/i18n";
import { applyFilters } from "@wordpress/hooks";

export const EXTENSION_CATEGORIES = {
    editor: () => __("Editor Tools", "essential-blocks"),
    design: () => __("Design & Effects", "essential-blocks"),
    layout: () => __("Layout & Templates", "essential-blocks"),
    seo: () => __("SEO & Performance", "essential-blocks"),
    ai: () => __("AI", "essential-blocks"),
    logic: () => __("Content & Logic", "essential-blocks"),
    forms: () => __("Forms", "essential-blocks"),
};

const builtInExtensions = () => [
    // Editor tools
    {
        key: "quickToolbar",
        title: __("Quick Action Toolbar", "essential-blocks"),
        description: __("Pin your most-used Essential Blocks to a toolbar in the editor for quick insertion.", "essential-blocks"),
        icon: "toolbar",
        tier: "free",
        category: "editor",
        toggle: { settingKey: "quickToolbar", default: false },
        doc: "https://essential-blocks.com/docs/essential-blocks-quick-action-toolbar/",
    },
    {
        key: "copyPasteStyles",
        title: __("Copy/Paste Styles", "essential-blocks"),
        description: __("Copy the design of one block and paste it onto another from the block's options menu.", "essential-blocks"),
        icon: "copy",
        tier: "free",
        category: "editor",
        toggle: { settingKey: "copyPasteStyles", default: true },
        doc: "https://essential-blocks.com/docs/eb-copy-paste-design/",
    },
    {
        key: "blockDefaults",
        title: __("Block Defaults", "essential-blocks"),
        description: __("Save default styles for each block so new blocks start with your design.", "essential-blocks"),
        icon: "defaults",
        tier: "free",
        category: "editor",
        doc: "https://essential-blocks.com/docs/configure-global-controls/",
    },
    {
        key: "customCss",
        title: __("Custom CSS & Classes", "essential-blocks"),
        description: __("Add custom CSS and classes to any block from its Advanced panel.", "essential-blocks"),
        icon: "code",
        tier: "free",
        category: "editor",
    },

    // Design & effects
    {
        key: "globalControls",
        title: __("Global Colors & Typography", "essential-blocks"),
        description: __("Define site-wide color and typography presets and reuse them in every block.", "essential-blocks"),
        icon: "palette",
        tier: "free",
        category: "design",
        doc: "https://essential-blocks.com/docs/configure-global-controls/",
    },
    {
        key: "liquidGlass",
        title: __("Liquid Glass", "essential-blocks"),
        description: __("Frosted-glass backgrounds for blocks. Turning this off hides the controls; existing effects keep showing on your site.", "essential-blocks"),
        icon: "glass",
        tier: "free",
        category: "design",
        toggle: { settingKey: "liquidGlass", default: true },
        doc: "https://essential-blocks.com/docs/eb-liquid-glass-effect/",
    },
    {
        key: "imageMasking",
        title: __("Image Masking", "essential-blocks"),
        description: __("Mask images with shapes or custom SVGs. Pro adds custom uploads and morphing.", "essential-blocks"),
        icon: "mask",
        tier: "free",
        category: "design",
        doc: "https://essential-blocks.com/docs/eb-image-masking-and-morphing/",
    },
    {
        key: "entranceAnimation",
        title: __("Entrance Animation", "essential-blocks"),
        description: __("Animate blocks as they scroll into view.", "essential-blocks"),
        icon: "motion",
        tier: "free",
        category: "design",
    },
    {
        key: "interactiveAnimation",
        title: __("Interactive Animation", "essential-blocks"),
        description: __("Scroll and hover animations powered by GSAP.", "essential-blocks"),
        icon: "motion",
        tier: "pro",
        category: "design",
        doc: "https://essential-blocks.com/docs/eb-interactive-animation/",
    },
    {
        key: "transformAnimation",
        title: __("Transform", "essential-blocks"),
        description: __("Rotate, scale, skew and offset blocks, with separate hover states.", "essential-blocks"),
        icon: "transform",
        tier: "pro",
        category: "design",
        doc: "https://essential-blocks.com/docs/transform/",
    },
    {
        key: "customCursor",
        title: __("Custom Cursor", "essential-blocks"),
        description: __("Replace the mouse pointer with custom cursors and interactive effects on any block.", "essential-blocks"),
        icon: "cursor",
        tier: "pro",
        category: "design",
        doc: "https://essential-blocks.com/docs/eb-custom-cursor/",
    },
    {
        key: "videoBackground",
        title: __("Video Background", "essential-blocks"),
        description: __("Use a video as the background of a section.", "essential-blocks"),
        icon: "video",
        tier: "pro",
        category: "design",
    },

    // Layout & templates
    {
        key: "pageTemplates",
        title: __("Page Templates", "essential-blocks"),
        description: __("Adds the Essential Blocks Blank and Full Width page templates to the editor.", "essential-blocks"),
        icon: "layout",
        tier: "free",
        category: "layout",
        toggle: { settingKey: "pageTemplates", default: true },
        warning: __("When turned off, pages that use these templates fall back to your theme's default page layout.", "essential-blocks"),
    },
    {
        key: "responsiveBreakpoints",
        title: __("Responsive Breakpoints", "essential-blocks"),
        description: __("Set the tablet and mobile widths your blocks adapt to.", "essential-blocks"),
        icon: "devices",
        tier: "free",
        category: "layout",
        link: { tab: "options", label: __("Configure in Settings", "essential-blocks") },
        doc: "https://essential-blocks.com/docs/customize-website-responsive-breakpoints/",
    },

    // SEO & performance
    {
        key: "faqSchema",
        title: __("FAQ Schema", "essential-blocks"),
        description: __("Adds FAQPage structured data for Accordions marked as FAQ. Turn off if your SEO plugin already outputs FAQ schema.", "essential-blocks"),
        icon: "schema",
        tier: "free",
        category: "seo",
        toggle: { settingKey: "faqSchema", default: true },
        doc: "https://essential-blocks.com/docs/accordion/",
    },
    {
        key: "heroPreload",
        title: __("Hero Image Preload", "essential-blocks"),
        description: __("Preloads the background image of the first section on a page to speed up Largest Contentful Paint.", "essential-blocks"),
        icon: "speed",
        tier: "free",
        category: "seo",
        toggle: { settingKey: "heroPreload", default: true },
    },

    // AI (configured in AI Suite)
    {
        key: "aiPageContent",
        title: __("Write with AI", "essential-blocks"),
        description: __("Generate page content with AI from the post editor.", "essential-blocks"),
        icon: "ai",
        tier: "free",
        category: "ai",
        status: { option: "eb_write_with_ai", key: "writePageContent", localize: "enableWriteAIPageContent", default: true },
        link: { tab: "ai-suite", label: __("Configure in AI Suite", "essential-blocks") },
        doc: "https://essential-blocks.com/docs/write-with-ai/",
    },
    {
        key: "aiRichtext",
        title: __("AI for Text Fields", "essential-blocks"),
        description: __("Write and rewrite block text with AI right where you type.", "essential-blocks"),
        icon: "ai",
        tier: "free",
        category: "ai",
        status: { option: "eb_write_with_ai", key: "writeRichtext", localize: "enableWriteAIRichtext", default: true },
        link: { tab: "ai-suite", label: __("Configure in AI Suite", "essential-blocks") },
        doc: "https://essential-blocks.com/docs/ai-content-in-richtext-and-input-fields/",
    },
    {
        key: "aiInputFields",
        title: __("AI for Input Fields", "essential-blocks"),
        description: __("Fill block input fields, like titles and labels, with AI.", "essential-blocks"),
        icon: "ai",
        tier: "free",
        category: "ai",
        status: { option: "eb_write_with_ai", key: "writeInputFields", localize: "enableWriteAIInputField", default: true },
        link: { tab: "ai-suite", label: __("Configure in AI Suite", "essential-blocks") },
        doc: "https://essential-blocks.com/docs/ai-content-in-richtext-and-input-fields/",
    },
    {
        key: "aiImages",
        title: __("AI Image Generation", "essential-blocks"),
        description: __("Create images with AI from any image control.", "essential-blocks"),
        icon: "image",
        tier: "free",
        category: "ai",
        status: { option: "eb_write_with_ai", key: "generateImage", localize: "enableGenerateImage", default: true },
        link: { tab: "ai-suite", label: __("Configure in AI Suite", "essential-blocks") },
        doc: "https://essential-blocks.com/docs/ai-image-generator/",
    },

    // Content & logic (Pro). Never toggleable: turning them off would expose
    // protected content or print raw dynamic tags on the site.
    {
        key: "conditionalDisplay",
        title: __("Conditional Display", "essential-blocks"),
        description: __("Show or hide blocks by user role, login state, device, date and more.", "essential-blocks"),
        icon: "eye",
        tier: "pro",
        category: "logic",
        doc: "https://essential-blocks.com/docs/essential-blocks-conditional-display/",
    },
    {
        key: "dynamicTags",
        title: __("Dynamic Tags", "essential-blocks"),
        description: __("Insert post, site and custom field (ACF) data into block content.", "essential-blocks"),
        icon: "tags",
        tier: "pro",
        category: "logic",
        doc: "https://essential-blocks.com/docs/dynamic-tags-support/",
    },
    {
        key: "protectedContent",
        title: __("Protected Content", "essential-blocks"),
        description: __("Password-protect individual blocks.", "essential-blocks"),
        icon: "lock",
        tier: "pro",
        category: "logic",
        doc: "https://essential-blocks.com/docs/eb-protected-content/",
    },
    {
        key: "googleSheets",
        title: __("Google Sheets Sync", "essential-blocks"),
        description: __("Pull live data from Google Sheets into Data Table and Fancy Chart.", "essential-blocks"),
        icon: "table",
        tier: "pro",
        category: "logic",
        doc: "https://essential-blocks.com/docs/how-to-retrieve-google-sheets-api/",
    },

    // Forms (Pro)
    {
        key: "formPro",
        title: __("Advanced Forms", "essential-blocks"),
        description: __("Multi-step forms, conditional logic, reCAPTCHA and Mailchimp for the Form block.", "essential-blocks"),
        icon: "form",
        tier: "pro",
        category: "forms",
        doc: "https://essential-blocks.com/docs/eb-form-block/",
    },
    {
        key: "formResponses",
        title: __("Form Responses", "essential-blocks"),
        description: __("Store form submissions and review them in your dashboard.", "essential-blocks"),
        icon: "inbox",
        tier: "pro",
        category: "forms",
        doc: "https://essential-blocks.com/docs/collect-and-analyze-form-block-responses/",
    },
];

/**
 * Legacy `eb_admin_option_extensions` entries ({ [settingKey]: { logo,
 * title, description, doc, default } }) become simple eb_settings toggles.
 *
 * @param {Object} legacy Filtered legacy map.
 * @return {Array} Registry entries.
 */
const normalizeLegacy = (legacy) =>
    Object.keys(legacy || {})
        .filter((key) => legacy[key] && typeof legacy[key] === "object")
        .map((key) => ({
            key,
            title: legacy[key].title || key,
            description: legacy[key].description || "",
            icon: legacy[key].logo || "puzzle",
            tier: "free",
            category: "editor",
            toggle: { settingKey: key, default: !!legacy[key].default },
            doc: legacy[key].doc,
        }));

/**
 * Registry after both filters. Call at render time (after Pro loads).
 *
 * - `eb_admin_option_extensions` (existing, legacy object shape) still
 *   works: entries it adds become toggles here.
 * - `essential_blocks_dashboard_extensions` receives the full registry.
 *
 * @return {Array} Registry entries.
 */
export const getExtensions = () => {
    const legacy = applyFilters("eb_admin_option_extensions", {
        quickToolbar: {
            logo: `${EssentialBlocksLocalize?.image_url}/admin/quick-toolbar-icon.svg`,
            title: __("Quick Action Toolbar", "essential-blocks"),
            description: __(
                "Easily access your most-used Essential Blocks for Gutenberg blocks by pinning them for quick selection.",
                "essential-blocks"
            ),
            doc: "https://essential-blocks.com/docs/essential-blocks-quick-action-toolbar/",
            default: false,
        },
    });

    const registry = builtInExtensions();
    const known = new Set(registry.map((entry) => entry.key));
    const extra = normalizeLegacy(legacy).filter((entry) => !known.has(entry.key));

    return applyFilters("essential_blocks_dashboard_extensions", [...registry, ...extra]);
};

const isOnValue = (value, fallback) => {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }
    return value !== false && value !== "false";
};

/**
 * Whether an extension is currently on.
 *
 * @param {Object}      extension  Registry entry.
 * @param {Object}      settings   Cached eb_settings.
 * @param {Object|null} aiSettings Cached eb_write_with_ai, when loaded.
 * @return {boolean} Active state (always-active entries are true).
 */
export const isExtensionActive = (extension, settings, aiSettings) => {
    if (extension.toggle) {
        return isOnValue(settings?.[extension.toggle.settingKey], extension.toggle.default);
    }
    if (extension.status) {
        const { key, localize, default: fallback } = extension.status;
        // Prefer a fresh AI Suite value when that tab has loaded it.
        const value = aiSettings ? aiSettings[key] : EssentialBlocksLocalize?.[localize];
        return isOnValue(value, fallback);
    }
    return true;
};
