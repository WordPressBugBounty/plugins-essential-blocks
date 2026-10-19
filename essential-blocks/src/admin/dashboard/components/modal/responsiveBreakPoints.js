/**
 * WordPress dependencies
 */
import { useState } from "@wordpress/element";
import { __, sprintf } from "@wordpress/i18n";

/**
 * Internal dependencies
 */
import { resetSetting } from "../../api/actions";
import useSettingMutation from "../../hooks/useSettingMutation";
import { NumberField } from "../ui/Field";
import Button from "../ui/Button";
import Alert from "../ui/Alert";

const DEFAULT_BREAKPOINTS = { tablet: 1024, mobile: 767 };

const ResponsiveBreakPoints = (props) => {
    const { setTrigger, settingsData, setSettingsData } = props;
    const { saveSetting, enqueue } = useSettingMutation();

    const settingsKey = "responsiveBreakpoints";

    // null | 'save' | 'reset'
    const [busy, setBusy] = useState(null);
    const [saveBtnText, setSaveBtnText] = useState(
        __("Save Changes", "essential-blocks")
    );
    const [error, setError] = useState("");

    // api Info
    const [tableSize, setTableSize] = useState(
        EssentialBlocksLocalize.responsiveBreakpoints?.tablet
            ? EssentialBlocksLocalize.responsiveBreakpoints.tablet
            : DEFAULT_BREAKPOINTS.tablet
    );
    const [mobileSize, setMobileSize] = useState(
        EssentialBlocksLocalize.responsiveBreakpoints?.mobile
            ? EssentialBlocksLocalize.responsiveBreakpoints.mobile
            : DEFAULT_BREAKPOINTS.mobile
    );

    const handleClick = async () => {
        if (busy) {
            return;
        }
        setError("");
        setBusy("save");
        setSaveBtnText(__("Saving...", "essential-blocks"));
        const saveData = { mobile: mobileSize, tablet: tableSize };

        try {
            const res = await saveSetting(settingsKey, JSON.stringify(saveData));
            if (res.ok) {
                setSaveBtnText(__("Saved", "essential-blocks"));

                setSettingsData({
                    ...settingsData,
                    [settingsKey]: saveData,
                });
                EssentialBlocksLocalize.responsiveBreakpoints = { ...saveData };

                setTimeout(() => {
                    setTrigger(false);
                }, 300);
            } else {
                setSaveBtnText(__("Save Changes", "essential-blocks"));
                setError(
                    res.code === "server" && res.error
                        ? res.error
                        : __(
                            "Something went wrong! Please try again.",
                            "essential-blocks"
                        )
                );
            }
        } catch (e) {
            setSaveBtnText(__("Save Changes", "essential-blocks"));
            setError(
                __("Something went wrong! Please try again.", "essential-blocks")
            );
        } finally {
            setBusy(null);
        }
    };

    const handleReset = async () => {
        if (busy) {
            return;
        }
        setError("");
        setBusy("reset");

        try {
            // Reset is also a read-modify-write of eb_settings: queue it.
            const res = await enqueue(() => resetSetting(settingsKey));
            // {success:true,data:false} (key already absent) is a success.
            if (res.ok) {
                const updatedSettingsData = { ...settingsData };
                delete updatedSettingsData[settingsKey];
                EssentialBlocksLocalize.responsiveBreakpoints = {
                    mobile: DEFAULT_BREAKPOINTS.mobile,
                    tablet: DEFAULT_BREAKPOINTS.tablet,
                };
                setSettingsData({ ...updatedSettingsData });
                setTimeout(() => {
                    setTrigger(false);
                }, 300);
            } else if (res.code === "nonce") {
                setError(
                    __(
                        "Couldn't reset the breakpoints: your session has expired. Reload the page and try again.",
                        "essential-blocks"
                    )
                );
            } else {
                setError(
                    sprintf(
                        /* translators: %s: error message. */
                        __("Couldn't reset the breakpoints. %s", "essential-blocks"),
                        res.code === "server" && res.error
                            ? res.error
                            : __("Please try again.", "essential-blocks")
                    )
                );
            }
        } catch (e) {
            setError(
                __("Something went wrong! Please try again.", "essential-blocks")
            );
        } finally {
            setBusy(null);
        }
    };

    return (
        <>
            <div className="option-modal-content">
                <h2 className="option-modal__title mb20">
                    {__("Responsive Breakpoints", "essential-blocks")}
                </h2>

                <div
                    className={`eb-responsive-form-wrapper ${busy ? "loading-circle" : ""
                        }`}
                >
                    <NumberField
                        id="tablet-breakpoints"
                        className="eb-modal-field"
                        label={__("Tablet Breakpoints", "essential-blocks")}
                        unit="px"
                        placeholder={String(DEFAULT_BREAKPOINTS.tablet)}
                        value={!tableSize ? "" : tableSize}
                        onChange={(value) => setTableSize(Number(value))}
                    />

                    <NumberField
                        id="mobile-breakpoints"
                        className="eb-modal-field"
                        label={__("Mobile Breakpoints", "essential-blocks")}
                        unit="px"
                        placeholder={String(DEFAULT_BREAKPOINTS.mobile)}
                        value={!mobileSize ? "" : mobileSize}
                        onChange={(value) => setMobileSize(Number(value))}
                    />

                    <div className="eb-modal-actions">
                        <Button
                            variant="primary"
                            onClick={() => handleClick()}
                            disabled={!!busy}
                            loading={busy === "save"}
                        >
                            {saveBtnText}
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={() => handleReset()}
                            disabled={!!busy}
                            loading={busy === "reset"}
                        >
                            {busy === "reset"
                                ? __("Resetting…", "essential-blocks")
                                : __("Reset", "essential-blocks")}
                        </Button>
                    </div>

                    {error && (
                        <Alert tone="error" role="alert" className="eb-modal-alert">
                            {error}
                        </Alert>
                    )}
                </div>
            </div>
        </>
    );
};
export default ResponsiveBreakPoints;
