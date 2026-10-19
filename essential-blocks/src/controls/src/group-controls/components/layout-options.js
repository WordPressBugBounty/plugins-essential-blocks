import { __ } from "@wordpress/i18n";
import { SelectControl } from "@wordpress/components";
import ResponsiveTextController from "../../controls/responsive-text-control";
import { InspectorPanel } from "../../index";
import { applyFilters } from "@wordpress/hooks";

export default function LayoutOptions(props) {
    const { attributes, setAttributes, resOption } = props;
    const objAttributes = attributes;
    const resRequiredProps = {
        attributes: attributes,
        setAttributes: setAttributes,
        resOption: resOption,
        objAttributes: objAttributes,
    };
    const { wrapperOverflow } = attributes;

    return (
        <>
            <InspectorPanel.PanelBody
                title={__("Visibility Options", "essential-blocks")}
                initialOpen={false}
            >
                <ResponsiveTextController
                    controlName="zIndex"
                    baseLabel={__("Z-Index", "essential-blocks")}
                    useUnits={false}
                    isNumber="true"
                />

                <SelectControl
                    label={__("Overflow", "essential-blocks")}
                    value={wrapperOverflow}
                    options={[
                        { label: __("Default", "essential-blocks"), value: "" },
                        { label: __("Auto", "essential-blocks"), value: "auto" },
                        { label: __("Hidden", "essential-blocks"), value: "hidden" },
                        { label: __("Visible", "essential-blocks"), value: "visible" },
                        { label: __("Scroll", "essential-blocks"), value: "scroll" },
                    ]}
                    onChange={(newWrapperOverflow) =>
                        setAttributes({ wrapperOverflow: newWrapperOverflow })
                    }
                    __next40pxDefaultSize
                    __nextHasNoMarginBottom
                />
                {EssentialBlocksLocalize?.is_pro_active === "false" ? (
                    <>
                        <div className="eb-is-pro-message">
                            <span className="dashicons dashicons-lock"></span>
                            <span>
                                <a
                                    href={EssentialBlocksLocalize?.upgrade_pro_url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {__("Upgrade to pro", "essential-blocks")}
                                </a>{" "}
                                {__("for Opacity and Position controls.", "essential-blocks")}
                            </span>
                        </div>
                    </>
                ) : (
                    applyFilters("eb_group_controls_layout", "", resRequiredProps)
                )}
            </InspectorPanel.PanelBody>
        </>
    );
}
