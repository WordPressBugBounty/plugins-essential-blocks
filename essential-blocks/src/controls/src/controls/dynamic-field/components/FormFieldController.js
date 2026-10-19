/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";
import {
    Button,
    BaseControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import { applyFilters } from "@wordpress/hooks";
import { OPTIONS_TYPE } from "./constants";
import SortableControl from "../../sortable-control";

export function DynamicFormFieldControl(props) {
    const isProActive = EssentialBlocksLocalize?.is_pro_active === "true";
    const {
        type,
        options,
        dynamicOptions,
        dynamicValue,
        dynamicOptionType,
        dynamicValueLoader,
        setAttributes
    } = props;

    const [optionType, setOptionType] = useState("normal");

    const onOptionAdd = () => {
        if (!options || typeof options !== "object") {
            return;
        }

        const count = options.length + 1;
        const newOptions = [
            ...options,
            {
                name: `Option ${count}`,
                value: `option_${count}`,
            },
        ];

        setAttributes({ options: newOptions });
    };

    return (
        <>
            <div className="eb-dynamic-select-control">
                <ToggleGroupControl

                    value={dynamicOptionType}
                    onChange={(newValue) =>
                        setAttributes({ dynamicOptionType: newValue })
                    }
                    isBlock
__next40pxDefaultSize
__nextHasNoMarginBottom
                >
                    {OPTIONS_TYPE.map(
                        (item, key) => (
                            <ToggleGroupControlOption
                                key={key}
                                value={item.value}
                                label={

                                    item.isPro && !isProActive

                                        ? `${item.label} ${__("(Pro)", "essential-blocks")}`

                                        : item.label

                                }
                            />
                        )
                    )}
                </ToggleGroupControl>
                {dynamicOptionType === 'normal' && (
                    <>
                        {/* <PanelRow>Manage Options</PanelRow> */}
                        <BaseControl
                            label={__(
                                "Manage Options",
                                "essential-blocks"
                            )}
                            id="eb-advance-heading-alignment"
                            __nextHasNoMarginBottom
                        >

                        </BaseControl>
                        <SortableControl
                            valueEditable={false}
                            options={options}
                            setAttributes={setAttributes}
                        />
                        <Button
                            className="eb-add-options-button"
                            label={__(
                                "Add New Option",
                                "essential-blocks"
                            )}
                            icon="plus-alt"
                            onClick={onOptionAdd}
                        >
                            <span className="eb-add-options-button-label">
                                {__(
                                    "Add New Option",
                                    "essential-blocks"
                                )}
                            </span>
                        </Button>
                    </>
                )}
                {dynamicOptionType === 'dynamic' && (
                    applyFilters(
                        "essential_blocks_dynamic_select_control",
                        isProActive ? "" : (
                            <div className="eb-is-pro-message">
                                <span className="dashicons dashicons-lock"></span>
                                <span>
                                    <a
                                        href={EssentialBlocksLocalize?.upgrade_pro_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {__("Upgrade to Pro", "essential-blocks")}
                                    </a>{" "}
                                    {__("for dynamic options.", "essential-blocks")}
                                </span>
                            </div>
                        ),
                        options,
                        dynamicOptions,
                        dynamicValue,
                        dynamicValueLoader,
                        setAttributes
                    )
                )}
            </div>
        </>
    );
}
