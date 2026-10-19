/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useState } from "@wordpress/element";

/**
 * Internal dependencies
 */
import { SecretField } from "../ui/Field";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import useSettingMutation from "../../hooks/useSettingMutation";

const OpenseaNft = (props) => {
    const { setTrigger, settingsKey, settingsData, setSettingsData } = props;
    const { saveSetting } = useSettingMutation();

    const [apikey, setApiKey] = useState(settingsData[settingsKey]);
    const [saveBtnText, setSaveBtnText] = useState(
        __("Save Changes", "essential-blocks")
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleClick = async () => {
        if (saving) {
            return;
        }
        setError("");
        setSaving(true);
        setSaveBtnText(__("Saving...", "essential-blocks"));
        // Same request as before, through the shared eb_settings queue.
        const res = await saveSetting(settingsKey, apikey ?? "");
        setSaving(false);
        if (res.ok) {
            setSaveBtnText(__("Saved", "essential-blocks"));
            setSettingsData({
                ...settingsData,
                [settingsKey]: apikey,
            });

            setTimeout(() => {
                setTrigger(false);
            }, 300);
        } else {
            setSaveBtnText(__("Save Changes", "essential-blocks"));
            setError(
                res.code === "server" && res.error
                    ? res.error
                    : __("Something went wrong! Please try again.", "essential-blocks")
            );
        }
    };

    return (
        <>
            <div className="option-modal-content">
                <h2 className="option-modal__title mb20">
                    {__("Opensea API", "essential-blocks")}
                </h2>

                <SecretField
                    id="eb-opensea-key"
                    className="eb-modal-field"
                    label={__("API Keys", "essential-blocks")}
                    placeholder={__("Paste your Opensea API key here", "essential-blocks")}
                    value={apikey && "undefined" !== apikey ? apikey : ""}
                    onChange={setApiKey}
                />

                <Button variant="primary" loading={saving} disabled={saving} onClick={handleClick}>
                    {saveBtnText}
                </Button>
                {error && (
                    <Alert tone="error" role="alert" className="eb-modal-alert">
                        {error}
                    </Alert>
                )}
            </div>
        </>
    );
};
export default OpenseaNft;
