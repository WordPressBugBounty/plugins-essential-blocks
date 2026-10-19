import { __ } from "@wordpress/i18n";
import { LAYOUT_TEMPLATES } from "./helpers/templates";

/**
 * Inserter preview: the two-column preset with some content, so the hover
 * card shows a layout instead of the layout picker.
 */
const [[leftName, leftAttributes], [rightName, rightAttributes]] =
    LAYOUT_TEMPLATES.preset3.blocks;

const example = {
    attributes: {
        containerLayout: "preset3",
        flexDirection: LAYOUT_TEMPLATES.preset3.flexDirection,
    },
    innerBlocks: [
        {
            name: leftName,
            attributes: leftAttributes,
            innerBlocks: [
                {
                    name: "essential-blocks/advanced-heading",
                    attributes: {
                        titleText: __("Flexible layouts", "essential-blocks"),
                    },
                },
            ],
        },
        {
            name: rightName,
            attributes: rightAttributes,
            innerBlocks: [
                {
                    name: "core/paragraph",
                    attributes: {
                        content: __(
                            "Arrange blocks in rows or columns and control spacing, alignment and wrapping on every device.",
                            "essential-blocks"
                        ),
                    },
                },
            ],
        },
    ],
};

export default example;
