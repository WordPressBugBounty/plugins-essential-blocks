/**
 * External Dependencies
 */
import Editor, { loader } from "@monaco-editor/react";

// Load Monaco from the plugin's own copy, never from a CDN (WP.org Guideline 8).
// webpack.config.js copies monaco-editor/min/vs to assets/vendors/monaco/vs.
if (window.EssentialBlocksLocalize?.eb_plugins_url) {
    loader.config({
        paths: {
            vs: `${window.EssentialBlocksLocalize.eb_plugins_url}assets/vendors/monaco/vs`,
        },
    });
}
/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { Suspense, useState } from "@wordpress/element";
import {
    SelectControl,
    ToggleControl,
    RangeControl,
    PanelRow,
    __experimentalDivider as Divider,
} from "@wordpress/components";
import { applyFilters } from "@wordpress/hooks";

/**
 * Internal Dependencies
 */
import AnimationControls from "../../controls/animation-control";
import {
    ResponsiveDimensionsControl,
    BackgroundControl,
    BorderShadowControl,
    useBlockAttributes,
    InspectorPanel,
    useBlockSetAttributes,
    ProSelectControl,
} from "../../index";
import LayoutOptions from "./layout-options";

import IaIcon from "./assets/ia-icon";
import TnIcon from "./assets/tn-icon";
import CdIcon from "./assets/cd-icon";
import Crown from "./assets/crown";
import ProBadge from "./assets/ProBadge";
import PcIcon from "./assets/pc-icon";
import VbIcon from "./assets/vb-icon";
import CcIcon from "./assets/cc-icon";
import ColorControl from "../../controls/color-control";
import LiquidGlassEffectControl from "../../controls/liquid-glass-effect-control";
import { isLiquidGlassEnabled } from "../../helpers/extensions";
import { EB_LINKS } from "../../helpers/ebLinks";
import PanelDocLinks from "../../components/PanelDocLinks";

const AdvancedControls = (props) => {
    const {
        hasMargin = true,
        marginPrefix = "",
        hasPadding = true,
        paddingPrefix = "",
        hasBackground = true,
        backgroundPrefix = "",
        hasVideoBackground = false,
        hasBorder = true,
        borderPrefix = "",
        disableBackgroundOverlay = false,
        disableBackgroundMainImage = false,
        disableBackgrondOverlayImage = false,
        disableBackgroundTransition = false,
        disableBorder = false,
        disableShadow = false,
        disableShdowHover = false,
        disableBorderRadius = false,
        hasInteractiveAnimation = true,
        hasAnimation = true,
        hasLiquidGlass = true,
        hasCustomCursor = true,
    } = props;

    const attributes = useBlockAttributes();
    const setAttributes = useBlockSetAttributes();

    const {
        customCss,
        hideOnDesktop,
        hideOnTab,
        hideOnMobile,
        resOption,
        liquidGlass,
    } = attributes;

    const [errors, setErrors] = useState([]);
    const updateCss = (value) => {
        setAttributes({ customCss: value });
    };

    const handleEditorValidation = (markers) => {
        const currentErrors = markers.filter(
            (marker) => marker.severity === monaco.MarkerSeverity.Error
        );
        setErrors(currentErrors.reverse());
        currentErrors.length === 0
            ? setAttributes({ isCustomCssError: false })
            : setAttributes({ isCustomCssError: true });
    };

    const defaultCss = `
        eb_selector {
            /*position: relative;*/
        }
        @media (max-width: 767px) {
            eb_selector {
                /*display: block;*/
            }
        }
    `;

    const IaUpgradeProContent = () => {
        return (
            <div className="eb_ie">
                <IaIcon />
                <h3>
                    <a
                        target="_blank"
                        href={EB_LINKS.demos.interactiveAnimation}
                    >
                        {__("Interactive Animation", "essential-blocks")}
                        <span className="dashicons dashicons-external"></span>
                    </a>
                </h3>
                <p>{__("Supercharge your website animation with interactive animation.", "essential-blocks")}</p>
                <a
                    className="eb_ie__doc"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={EB_LINKS.docs.interactiveAnimation}
                >
                    {__("Read the documentation", "essential-blocks")}
                </a>
                <a
                    className="eb_upgrade_button"
                    target="_blank"
                    href={EssentialBlocksLocalize?.upgrade_pro_url}
                >
                    <Crown />
                    {__("Upgrade to PRO", "essential-blocks")}
                </a>
            </div>
        );
    };

    const CdUpgradeProContent = () => {
        return (
            <div className="eb_ie">
                <CdIcon />
                <h3>
                    <a
                        target="_blank"
                        href={EB_LINKS.demos.conditionalDisplay}
                    >
                        {__("Conditional Display", "essential-blocks")}
                        <span className="dashicons dashicons-external"></span>
                    </a>
                </h3>
                <p>{__("Supercharge your website with Conditional Display.", "essential-blocks")}</p>
                <a
                    className="eb_ie__doc"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={EB_LINKS.docs.conditionalDisplay}
                >
                    {__("Read the documentation", "essential-blocks")}
                </a>
                <a
                    className="eb_upgrade_button"
                    target="_blank"
                    href={EssentialBlocksLocalize?.upgrade_pro_url}
                >
                    <Crown />
                    {__("Upgrade to PRO", "essential-blocks")}
                </a>
            </div>
        );
    };

    const PcUpgradeProContent = () => {
        return (
            <div className="eb_ie">
                <PcIcon />
                <h3>
                    <a
                        target="_blank"
                        href={EB_LINKS.demos.protectedContent}
                    >
                        {__("Protected Content", "essential-blocks")}
                        <span className="dashicons dashicons-external"></span>
                    </a>
                </h3>
                <p>{__("Restrict block visibility based on user password.", "essential-blocks")}</p>
                <a
                    className="eb_ie__doc"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={EB_LINKS.docs.protectedContent}
                >
                    {__("Read the documentation", "essential-blocks")}
                </a>
                <a
                    className="eb_upgrade_button"
                    target="_blank"
                    href={EssentialBlocksLocalize?.upgrade_pro_url}
                >
                    <Crown />
                    {__("Upgrade to PRO", "essential-blocks")}
                </a>
            </div>
        );
    };

    const TransformAnimationUpgradePro = () => {
        return (
            <div className="eb_ie">
                <TnIcon />
                <h3>
                    <a
                        target="_blank"
                        href={EB_LINKS.demos.transform}
                    >
                        {__("Transform Animation", "essential-blocks")}
                        <span className="dashicons dashicons-external"></span>
                    </a>
                </h3>
                <p>{__("Supercharge your website animation with transform animation.", "essential-blocks")}</p>
                <a
                    className="eb_ie__doc"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={EB_LINKS.docs.transform}
                >
                    {__("Read the documentation", "essential-blocks")}
                </a>
                <a
                    className="eb_upgrade_button"
                    target="_blank"
                    href={EssentialBlocksLocalize?.upgrade_pro_url}
                >
                    <Crown />
                    {__("Upgrade to PRO", "essential-blocks")}
                </a>
            </div>
        );
    };

    const CcUpgradeProContent = () => {
        return (
            <div className="eb_ie">
                <CcIcon />
                <h3>
                    <a
                        target="_blank"
                        href="https://essential-blocks.com/demo/custom-cursor/"
                    >
                        {__("Custom Cursor", "essential-blocks")}
                        <span className="dashicons dashicons-external"></span>
                    </a>
                </h3>
                <p>{__("Replace the pointer with your own image, or trail it with one of 12 animated cursor effects.", "essential-blocks")}</p>
                <a
                    className="eb_upgrade_button"
                    target="_blank"
                    href={EssentialBlocksLocalize?.upgrade_pro_url}
                >
                    <Crown />
                    {__("Upgrade to PRO", "essential-blocks")}
                </a>
            </div>
        );
    };

    const VideoBackgroundUpgradePro = () => {
        return (
            <div className="eb_ie">
                <VbIcon />
                {/* No demo page yet: link the title once essential-blocks.com/demo/video-background/ is live. */}
                <h3>{__("Video Background", "essential-blocks")}</h3>
                <p>{__("Set a self-hosted, YouTube or Vimeo video as the section background, with poster fallback and overlay.", "essential-blocks")}</p>
                <a
                    className="eb_upgrade_button"
                    target="_blank"
                    href={EssentialBlocksLocalize?.upgrade_pro_url}
                >
                    <Crown />
                    {__("Upgrade to PRO", "essential-blocks")}
                </a>
            </div>
        );
    };

    return (
        <>
            {applyFilters("eb_advanced_controls_top", "")}
            <LayoutOptions
                attributes={attributes}
                setAttributes={setAttributes}
                resOption={resOption}
            />
            {/*
            * Transform Animation
            */}
            <InspectorPanel.PanelBody
                title={__("Transform", "essential-blocks")}
                initialOpen={false}
                className={"eb-transform-animation eb-group-control-panelbody"}
                {...(EssentialBlocksLocalize?.is_pro_active === "false" && {
                    icon: <ProBadge />,
                })}
            >
                {applyFilters(
                    "eb_advanced_controls_transform_animation",
                    <TransformAnimationUpgradePro />,
                    props
                )}
            </InspectorPanel.PanelBody>
            {(hasMargin || hasPadding) && (
                <InspectorPanel.PanelBody
                    title={__("Margin & Padding", "essential-blocks")}
                    initialOpen={true}
                >
                    {hasMargin && (
                        <ResponsiveDimensionsControl
                            controlName={marginPrefix}
                            baseLabel="Margin"
                        />
                    )}
                    {hasPadding && (
                        <ResponsiveDimensionsControl
                            controlName={paddingPrefix}
                            baseLabel="Padding"
                        />
                    )}
                </InspectorPanel.PanelBody>
            )}

            {hasBackground && (
                <InspectorPanel.PanelBody
                    title={__("Background", "essential-blocks")}
                    initialOpen={false}
                >
                    <BackgroundControl
                        controlName={backgroundPrefix}
                        noOverlay={disableBackgroundOverlay}
                        noMainBgi={disableBackgroundMainImage}
                        noOverlayBgi={disableBackgrondOverlayImage}
                        noTransition={disableBackgroundTransition}
                        hasVideo={hasVideoBackground}
                    />
                </InspectorPanel.PanelBody>
            )}
            {/*
            * Video Background
            */}
            {hasVideoBackground &&
                attributes[`${backgroundPrefix}backgroundType`] === "video" && (
                    <InspectorPanel.PanelBody
                        title={__("Video Background", "essential-blocks")}
                        initialOpen={true}
                        className={
                            "eb-video-background eb-group-control-panelbody"
                        }
                        {...(EssentialBlocksLocalize?.is_pro_active ===
                            "false" && {
                            icon: <ProBadge />,
                        })}
                    >
                        {applyFilters(
                            "eb_background_control_video_settings",
                            EssentialBlocksLocalize?.is_pro_active === "false"
                                ? <VideoBackgroundUpgradePro />
                                : "",
                            props
                        )}
                    </InspectorPanel.PanelBody>
                )}
            {hasBorder && (
                <InspectorPanel.PanelBody
                    title={__("Border & Shadow", "essential-blocks")}
                    initialOpen={false}
                >
                    <BorderShadowControl
                        controlName={borderPrefix}
                        noBorder={disableBorder}
                        noShadow={disableShadow}
                        noShdowHover={disableShdowHover}
                        noBorderRadius={disableBorderRadius}
                    />
                </InspectorPanel.PanelBody>
            )}

            {hasLiquidGlass && isLiquidGlassEnabled() && (
                <InspectorPanel.PanelBody
                    title={__("Liquid Glass Effect", "essential-blocks")}
                    initialOpen={false}
                >
                    <ToggleControl
                        label={__("Enable Liquid Glass Effect", "essential-blocks")}
                        checked={liquidGlass.enable}
                        onChange={() =>
                            setAttributes({
                                liquidGlass: { ...liquidGlass, enable: !liquidGlass.enable },
                            })
                        }
                        __nextHasNoMarginBottom
                    />

                    {liquidGlass.enable && (
                        <>
                            <LiquidGlassEffectControl
                                attributeName="liquidGlass"
                                shadowAttributeName="liquidGlassShadowEffectBorder"
                            />
                        </>
                    )}
                    <PanelDocLinks
                        doc={EB_LINKS.docs.liquidGlass}
                        demo={EB_LINKS.demos.liquidGlass}
                    />
                </InspectorPanel.PanelBody>
            )}

            <InspectorPanel.PanelBody
                title={__("Responsive Control", "essential-blocks")}
                initialOpen={false}
            >
                <ToggleControl
                    label={__("Hide on Desktop", "essential-blocks")}
                    checked={hideOnDesktop}
                    onChange={() => setAttributes({ hideOnDesktop: !hideOnDesktop })}
                    __nextHasNoMarginBottom
                />
                <ToggleControl
                    label={__("Hide on Tab", "essential-blocks")}
                    checked={hideOnTab}
                    onChange={() => setAttributes({ hideOnTab: !hideOnTab })}
                    __nextHasNoMarginBottom
                />
                <ToggleControl
                    label={__("Hide on Mobile", "essential-blocks")}
                    checked={hideOnMobile}
                    onChange={() => setAttributes({ hideOnMobile: !hideOnMobile })}
                    __nextHasNoMarginBottom
                />
                <PanelDocLinks doc={EB_LINKS.docs.visibility} />
            </InspectorPanel.PanelBody>

            {hasAnimation && (
                <AnimationControls
                    setAttributes={setAttributes}
                    animationData={attributes.animationData}
                />
            )}

            {hasInteractiveAnimation && (
                <InspectorPanel.PanelBody
                    title={__("Interactive Animation", "essential-blocks")}
                    initialOpen={false}
                    className={"eb-interactive-animation eb-group-control-panelbody"}
                    {...(EssentialBlocksLocalize?.is_pro_active === "false" && {
                        icon: <ProBadge />,
                    })}
                >
                    {applyFilters(
                        "eb_advanced_controls_interactive_animation",
                        <IaUpgradeProContent />,
                        props
                    )}
                </InspectorPanel.PanelBody>
            )}

            <InspectorPanel.PanelBody
                title={__("Conditional Display", "essential-blocks")}
                initialOpen={false}
                className={"eb-condition-display eb-group-control-panelbody"}
                {...(EssentialBlocksLocalize?.is_pro_active === "false" && {
                    icon: <ProBadge />,
                })}
            >
                {applyFilters(
                    "eb_advanced_controls_conditional_display",
                    <CdUpgradeProContent />,
                    props
                )}
            </InspectorPanel.PanelBody>

            <InspectorPanel.PanelBody
                title={__("Protected Content", "essential-blocks")}
                initialOpen={false}
                className={"eb-protected-content eb-group-control-panelbody"}
                {...(EssentialBlocksLocalize?.is_pro_active === "false" && {
                    icon: <ProBadge />,
                })}
            >
                {applyFilters(
                    "eb_advanced_controls_protected_content",
                    <PcUpgradeProContent />,
                    props
                )}
            </InspectorPanel.PanelBody>

            {hasCustomCursor && (
                <InspectorPanel.PanelBody
                    title={__("Custom Cursor", "essential-blocks")}
                    initialOpen={false}
                    className={"eb-custom-cursor eb-group-control-panelbody"}
                    {...(EssentialBlocksLocalize?.is_pro_active === "false" && {
                        icon: <ProBadge />,
                    })}
                >
                    {applyFilters(
                        "eb_advanced_controls_custom_cursor",
                        <CcUpgradeProContent />,
                        props
                    )}
                </InspectorPanel.PanelBody>
            )}

            {applyFilters("eb_advanced_controls_after_animation", "", props)}

            <InspectorPanel.PanelBody
                title={__("Custom CSS", "essential-blocks")}
                initialOpen={false}
            >
                <Suspense fallback={"Loading..."}>
                    <Editor
                        height="250px"
                        defaultLanguage="css"
                        defaultValue={customCss || defaultCss.trim()}
                        onChange={updateCss}
                        options={{
                            minimap: {
                                enabled: false,
                            },
                            scrollbar: { vertical: "hidden" },
                            overviewRulerLanes: 0,
                            overviewRulerBorder: false,
                            quickSuggestions: true,
                        }}
                        onValidate={handleEditorValidation}
                    />
                </Suspense>
                <p className="eb-help-text">
                    {__(
                        'add "eb_selector" prefix to target block elements',
                        "essential-blocks"
                    )}
                </p>
                {errors.length > 0 && (
                    <div className="eb-css-error-messages-wrapper">
                        <p className="eb-css-error-note" role="status">
                            {__(
                                "This CSS has errors, so none of it is applied. Fix the errors below to apply it.",
                                "essential-blocks"
                            )}
                        </p>
                        {errors.map((err, idx) => (
                            <div key={idx} className="eb-css-error-item">
                                <span className="eb-error-tag">
                                    <span className="dashicons dashicons-no-alt"></span>Error on
                                    line {err.startLineNumber}:
                                </span>{" "}
                                <span className="eb-error-text">{err.message}</span>
                            </div>
                        ))}
                    </div>
                )}
            </InspectorPanel.PanelBody>
            {applyFilters("eb_advanced_controls_bottom", "")}
        </>
    );
};

export default AdvancedControls;
