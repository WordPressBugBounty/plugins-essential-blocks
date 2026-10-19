/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { ExternalLink } from "@wordpress/components";
import { useState } from "@wordpress/element";

/**
 * Internal dependencies
 */
import { SecretField } from "../ui/Field";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import useSettingMutation from "../../hooks/useSettingMutation";

const Instagram = (props) => {
    const { setTrigger, settingsKey, settingsData, setSettingsData } = props;
    const { saveSetting } = useSettingMutation();
    const [apikey, setApiKey] = useState(settingsData[settingsKey]);
    const [saveBtnText, setSaveBtnText] = useState(
        __("Save Changes", "essential-blocks")
    );
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

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
                <h2 className="option-modal__title">
                    {__("Instagram Access Token", "essential-blocks")}
                </h2>
                <p className="option-modal__content">
                    {__(
                        "To get started please add an Instagram Access Token.",
                        "essential-blocks"
                    )}
                    {__(" You can follow 1 to 3 ", "essential-blocks")}
                    <ExternalLink href="https://developers.facebook.com/docs/instagram-basic-display-api/getting-started">
                        {__("steps", "essential-blocks")}{" "}
                    </ExternalLink>
                    {__("to generate token.", "essential-blocks")}{" "}
                    {__(
                        "Once you have a token, please paste and save.",
                        "essential-blocks"
                    )}
                </p>

                <SecretField
                    id="eb-instagram-token"
                    className="eb-modal-field"
                    label={__("Access Token", "essential-blocks")}
                    placeholder={__(
                        "Place your instagram access token",
                        "essential-blocks"
                    )}
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
export default Instagram;
