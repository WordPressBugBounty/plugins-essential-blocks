import {
    BUTTON_ONE_BACKGROUND,
    BUTTON_TWO_BACKGROUND,
    BUTTON_ONE_BORDER_SHADOW,
    BUTTON_TWO_BORDER_SHADOW,
    BUTTON_ONE_BG,
    BUTTON_TWO_BG,
    WRAPPER_MARGIN,
    BUTTONS_MARGIN,
    BUTTONS_PADDING,
    BUTTONS_WIDTH,
    BUTTONS_GAP,
    BUTTONS_CONNECTOR_SIZE,
    BUTTONS_CONNECTOR_ICON_SIZE,
    BUTTON_ONE_KEYS,
    BUTTON_TWO_KEYS
} from "./constants/constants";

// import {
// 	generateDimensionsAttributes,
// 	generateTypographyAttributes,
// 	generateBackgroundAttributes,
// 	generateBorderShadowAttributes,
// 	generateResponsiveRangeAttributes
// } from "../../../util/helpers";

import {
    generateDimensionsAttributes,
    generateTypographyAttributes,
    generateBackgroundAttributes,
    generateBorderShadowAttributes,
    generateResponsiveRangeAttributes,
    EBButton
} from "@essential-blocks/controls";

import { BUTTONS_TYPOGRAPHY, BUTTONS_CONNECTOR_TYPOGRAPHY } from "./constants/typographyPrefixConstants";

const attributes = {
    resOption: {
        type: "string",
        default: "Desktop",
    },

    // blockId attribute for making unique className and other uniqueness
    blockId: {
        type: "string",
    },
    blockRoot: {
        type: "string",
        default: "essential_block",
    },
    blockMeta: {
        type: "object",
    },
    preset: {
        type: "string",
        default: "button-1",
    },
    contentPosition: {
        type: "string",
        default: "center",
    },
    buttonWidth: {
        type: "number",
        default: "auto",
    },
    buttonTextAlign: {
        type: "string",
        default: "center",
    },
    isHoverOne: {
        type: "boolean",
        default: false,
    },
    isHoverTwo: {
        type: "boolean",
        default: false,
    },
    innerButtonText: {
        type: "string",
        default: "OR",
    },
    innerButtonColor: {
        type: "string",
        default: "#fff",
    },
    innerButtonTextColor: {
        type: "string",
        default: "#000",
    },
    innerButtonIcon: {
        type: "string",
        default: "fas fa-arrows-alt-h",
    },
    showConnector: {
        type: "boolean",
        default: true,
    },
    connectorType: {
        type: "string",
        default: "text",
    },
    borderType: {
        type: "string",
        default: "normal",
    },
    buttonsColorType: {
        type: "string",
        default: "normal",
    },
    buttonsWidthType: {
        type: "string",
        default: "custom",
    },
    ...EBButton?.addAttributes(
        BUTTON_ONE_KEYS, 
        'btn1',
        false,
        '', 
        true, 
        {
            key: BUTTON_ONE_BACKGROUND, 
            default: {
                noOverlay: true,
                noMainBgi: true,
                defaultFillColor: "var(--eb-global-secondary-color)",
                defaultHovFillColor: "var(--eb-global-primary-color)",
                defaultBgGradient: "var(--eb-gradient-background-color)",
            }
        },
        true,
        {key: BUTTON_ONE_BORDER_SHADOW, default: {
            bdrDefaults: {
                top: 2,
                bottom: 2,
                right: 2,
                left: 2,
            },
            rdsDefaults: {
                top: 20,
                bottom: 0,
                right: 0,
                left: 20,
                isLinked: false,
            },
            // noShadow: true,
            // noBorder: true,
        }},
        false,
        ''
    ),
    ...EBButton?.addAttributes(
        BUTTON_TWO_KEYS, 
        'btn2',
        false,
        '',
        true,
        {
            key: BUTTON_TWO_BACKGROUND,
            default: {
                noOverlay: true,
                noMainBgi: true,
                defaultFillColor: "var(--eb-global-tertiary-color)",
                defaultHovFillColor: "var(--eb-global-primary-color)",
                defaultBgGradient: "var(--eb-gradient-background-color)",
            }
        },
        true,
        {
            key: BUTTON_TWO_BORDER_SHADOW,
            default: {
                bdrDefaults: {
                    top: 2,
                    bottom: 2,
                    right: 2,
                    left: 2,
                },
                rdsDefaults: {
                    top: 0,
                    bottom: 20,
                    right: 20,
                    left: 0,
                    isLinked: false,
                },
                // noShadow: true,
            }
        }
    ),

    // typography attributes ⬇
    ...generateTypographyAttributes(BUTTONS_TYPOGRAPHY, {
        fontSize: 16
    }),
    ...generateTypographyAttributes(BUTTONS_CONNECTOR_TYPOGRAPHY, {
        fontSize: 14
    }),

    // margin padding attributes ⬇
    ...generateDimensionsAttributes(WRAPPER_MARGIN),
    ...generateDimensionsAttributes(BUTTONS_MARGIN),
    ...generateDimensionsAttributes(BUTTONS_PADDING, {
        top: 10,
        bottom: 10,
        right: 25,
        left: 25,
        isLinked: false,
    }),

    // border shadow attributes ⬇
    // ...generateBorderShadowAttributes(BUTTON_ONE_BORDER_SHADOW, {
    //     bdrDefaults: {
    //         top: 2,
    //         bottom: 2,
    //         right: 2,
    //         left: 2,
    //     },
    //     rdsDefaults: {
    //         top: 20,
    //         bottom: 0,
    //         right: 0,
    //         left: 20,
    //         isLinked: false,
    //     },
    //     // noShadow: true,
    //     // noBorder: true,
    // }),
    // ...generateBorderShadowAttributes(BUTTON_TWO_BORDER_SHADOW, {
    //     bdrDefaults: {
    //         top: 2,
    //         bottom: 2,
    //         right: 2,
    //         left: 2,
    //     },
    //     rdsDefaults: {
    //         top: 0,
    //         bottom: 20,
    //         right: 20,
    //         left: 0,
    //         isLinked: false,
    //     },
    //     // noShadow: true,
    // }),

    // background attributes ⬇
    // ...generateBackgroundAttributes(BUTTON_ONE_BG, {
    //     defaultFillColor: "#3074ff",
    //     defaultBgGradient: "linear-gradient(45deg, rgba(120,102,255,0.8) 0% , rgba(195,120,242,0.4) 100%)",
    // }),
    // ...generateBackgroundAttributes(BUTTON_TWO_BG, {
    //     defaultFillColor: "#3074ff",
    // }),

    // range controller
    ...generateResponsiveRangeAttributes(BUTTONS_WIDTH, {
        defaultRange: 200,
    }),
    ...generateResponsiveRangeAttributes(BUTTONS_GAP, {
        defaultRange: 0,
    }),
    ...generateResponsiveRangeAttributes(BUTTONS_CONNECTOR_SIZE, {
        defaultRange: 30,
    }),
    ...generateResponsiveRangeAttributes(BUTTONS_CONNECTOR_ICON_SIZE, {
        defaultRange: 16,
    }),

    // background Attributes
    // ...generateBackgroundAttributes(BUTTON_ONE_BACKGROUND, {
    //     noOverlay: true,
    //     noMainBgi: true,
    //     defaultFillColor: "var(--eb-global-secondary-color)",
    //     defaultHovFillColor: "var(--eb-global-primary-color)",
    //     defaultBgGradient: "var(--eb-gradient-background-color)",
    // }),
    // ...generateBackgroundAttributes(BUTTON_TWO_BACKGROUND, {
    //     noOverlay: true,
    //     noMainBgi: true,
    //     defaultFillColor: "var(--eb-global-tertiary-color)",
    //     defaultHovFillColor: "var(--eb-global-primary-color)",
    //     defaultBgGradient: "var(--eb-gradient-background-color)",
    // }),
};

export default attributes;
