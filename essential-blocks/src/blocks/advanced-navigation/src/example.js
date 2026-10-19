import { __ } from "@wordpress/i18n";

const example = {
    // Wide enough that the menu doesn't collapse to the hamburger.
    viewportWidth: 1000,
    attributes: {
        wrpBg_backgroundColor: "rgba(255,255,255,1)",
        navHamburgerBtnColor: "#000000",
    },

    innerBlocks: [
        {
            name: "core/navigation",
            attributes: {},

            innerBlocks: [
                {
                    name: "core/navigation-link",
                    attributes: { label: __("Home", "essential-blocks"), url: "#" },
                },
                {
                    name: "core/navigation-link",
                    attributes: { label: __("About", "essential-blocks"), url: "#" },
                },
                {
                    name: "core/navigation-link",
                    attributes: { label: __("Services", "essential-blocks"), url: "#" },
                },
                {
                    name: "core/navigation-link",
                    attributes: { label: __("Contact", "essential-blocks"), url: "#" },
                },
            ],
        },
    ],
};

export default example;
