import { __ } from "@wordpress/i18n";

/**
 * Inserter preview: a section with content, so the hover card isn't empty.
 */
const example = {
    attributes: {},
    innerBlocks: [
        {
            name: "essential-blocks/advanced-heading",
            attributes: {
                titleText: __("Build your section", "essential-blocks"),
            },
        },
        {
            name: "core/paragraph",
            attributes: {
                content: __(
                    "Group blocks inside a wrapper to give them one background, width and spacing.",
                    "essential-blocks"
                ),
            },
        },
    ],
};

export default example;
