/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { ExternalLink } from "@wordpress/components";
import { useState } from "@wordpress/element";

/**
 * Internal dependencies
 */
import { validateGoogleMapsKey } from "../../api/actions";
import useSettingMutation from "../../hooks/useSettingMutation";
import { SecretField } from "../ui/Field";
import Button from "../ui/Button";
import Alert from "../ui/Alert";

/**
 * Turn the key-validation result into { valid, message }.
 *
 * @param {Object} result EbAjaxResult from validateGoogleMapsKey().
 * @return {{valid: boolean, message: (string|undefined)}} Verdict.
 */
const classifyValidation = (result) => {
    if (result.ok) {
        return { valid: true };
    }
    switch (result.code) {
        case "nonce":
            return {
                valid: false,
                message: __(
                    "Your session has expired. Reload the page and try again.",
                    "essential-blocks"
                ),
            };
        case "network":
            return {
                valid: false,
                message: __(
                    "Couldn't reach the server to validate the key. Please try again.",
                    "essential-blocks"
                ),
            };
        case "invalid_response":
            return {
                valid: false,
                message: __(
                    "Couldn't validate the API key. Please try again.",
                    "essential-blocks"
                ),
            };
        default:
            break;
    }

    const data = result.data;
    if (data && typeof data === "object" && data.status === "error") {
        return {
            valid: false,
            message: __(
                "Couldn't reach Google to validate the key. Please try again.",
                "essential-blocks"
            ),
        };
    }
    if (data && typeof data === "object" && data.error_message !== undefined) {
        return {
            valid: false,
            message:
                typeof data.error_message === "string"
                    ? data.error_message
                    : __("Invalid API Key.", "essential-blocks"),
        };
    }
    return {
        valid: false,
        message:
            result.error ||
            __(
                "Couldn't validate the API key. Please try again.",
                "essential-blocks"
            ),
    };
};

const GoogleMaps = (props) => {
    const { setTrigger, settingsKey, settingsData, setSettingsData } = props;
    const { saveSetting } = useSettingMutation();
    const [apikey, setApiKey] = useState(settingsData[settingsKey]);
    const [saveBtnText, setSaveBtnText] = useState(
        __("Save Changes", "essential-blocks")
    );
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    // "Saved" only after the server confirmed the save.
    const handleSaveData = async () => {
        setSaveBtnText(__("Saving...", "essential-blocks"));

        const res = await saveSetting(settingsKey, apikey ?? "");
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
                typeof res.error === "string" && res.error
                    ? res.error
                    : __(
                        "Something went wrong! Please try again.",
                        "essential-blocks"
                    )
            );
        }
    };

    const handleClick = async () => {
        if (busy) {
            return;
        }
        setError("");
        setBusy(true);

        try {
            // An empty key clears the setting: the server unsets empty values.
            if (apikey === undefined || String(apikey).trim() === "") {
                await handleSaveData();
                return;
            }

            setSaveBtnText(__("Saving...", "essential-blocks"));

            const verdict = classifyValidation(
                await validateGoogleMapsKey(apikey)
            );
            if (!verdict.valid) {
                setSaveBtnText(__("Save Changes", "essential-blocks"));
                setError(verdict.message);
                return;
            }

            await handleSaveData();
        } catch (e) {
            setSaveBtnText(__("Save Changes", "essential-blocks"));
            setError(
                __("Something went wrong! Please try again.", "essential-blocks")
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <div className="option-modal-content">
                <h2 className="option-modal__title">
                    {__("Google Map API", "essential-blocks")}
                </h2>
                <p className="option-modal__content">
                    {__(
                        "To enable location search, please ensure Places API is activated in the Google Developers Console ",
                        "essential-blocks"
                    )}
                    <ExternalLink href="https://developers.google.com/places/web-service/intro">
                        {__("More info", "essential-blocks")}
                    </ExternalLink>
                </p>

                <SecretField
                    id="eb-gmaps-key"
                    className="eb-modal-field"
                    label={__("API Key", "essential-blocks")}
                    placeholder={__(
                        "Place your Google Map API key here",
                        "essential-blocks"
                    )}
                    value={apikey ?? ""}
                    onChange={setApiKey}
                />

                <Button
                    variant="primary"
                    onClick={() => handleClick()}
                    disabled={busy}
                    loading={busy}
                >
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
export default GoogleMaps;
