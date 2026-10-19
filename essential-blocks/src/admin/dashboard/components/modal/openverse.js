/**
 * WordPress dependencies
 */
import { useEffect, useState } from "@wordpress/element";
import { __, sprintf } from "@wordpress/i18n";

/**
 * Internal dependencies
 */
import { registerOpenverse, getOpenverseToken } from "../../api/actions";
import { TextField } from "../ui/Field";
import Button from "../ui/Button";
import Alert from "../ui/Alert";

const GENERIC_ERROR = () =>
    __("Something went wrong! Please try again.", "essential-blocks");

/**
 * First readable message from any Openverse / server error body.
 *
 * @param {*} body Parsed response body (or a message string).
 * @return {string} Message.
 */
const openverseErrorMessage = (body) => {
    const candidates = [
        typeof body === "string" ? body.trim() : "",
        body?.name?.[0],
        body?.email?.[0],
        body?.description?.[0],
        body?.detail,
        body?.error_description,
        body?.error,
        body?.data,
        body?.message,
    ];
    const found = candidates.find((item) => typeof item === "string" && item);
    return found || GENERIC_ERROR();
};

const Openverse = (props) => {
    const { setTrigger, settingsKey, settingsData, setSettingsData } = props;

    const [loadingApi, setLoadingApi] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [openverseRegError, setOpenverseRegError] = useState({
        status: false,
    });
    const [saveBtnText, setSaveBtnText] = useState(
        __("Generate API", "essential-blocks")
    );
    const [openverseSettingsData, setOpenverseSettingsData] = useState({});
    const [error, setError] = useState("");
    // True only while "Generate API" is running (loadingApi is the legacy
    // wrapper spinner flag and can stay set when there is no saved data).
    const [generating, setGenerating] = useState(false);

    // api Info
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");

    //Initial UseEffect
    useEffect(() => {
        setLoadingApi(true);

        if (settingsData[settingsKey] !== undefined) {
            setOpenverseSettingsData(settingsData[settingsKey]);
            if (settingsData[settingsKey].client_id) {
                setShowForm(false);
            } else {
                setShowForm(true);
            }

            setEmail(settingsData[settingsKey].email);
            setName(settingsData[settingsKey].name);
            setLoadingApi(false);

            setSaveBtnText(__("Regenerate API", "essential-blocks"));
        } else {
            setOpenverseSettingsData({});
        }
    }, []);

    // email validation
    const [emailError, setEmailError] = useState("");

    function isValidEmail(value) {
        return /\S+@\S+\.\S+/.test(value);

        // return /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    }


    useEffect(() => {
        if (!isValidEmail(email)) {
            setEmailError(__("Email is invalid", "essential-blocks"));
        } else {
            setEmailError("");
        }
    }, [email]);


    // Generate API: register a client, then fetch a token. Every server and
    // Openverse response shape is handled without throwing.
    const generateAPI = async (e) => {
        e.preventDefault();
        if (generating) {
            return;
        }
        setError("");
        setGenerating(true);
        setLoadingApi(true);
        setSaveBtnText(__("Generating ........", "essential-blocks"));

        try {
            const reg = await registerOpenverse(email, name);

            if (!reg.ok) {
                let message;
                if (reg.code === "nonce") {
                    message = __(
                        "Your session has expired. Reload the page and try again.",
                        "essential-blocks"
                    );
                } else if (reg.code === "server") {
                    message = openverseErrorMessage(reg.data);
                } else {
                    message = GENERIC_ERROR();
                }
                setOpenverseRegError({ status: true, type: "Error", message });
                setSaveBtnText(__("Generate API", "essential-blocks"));
                return;
            }

            setOpenverseRegError({
                status: true,
                type: "Success",
                message: reg.data.msg,
            });
            // The server stored these credentials (OpenVerse.php); mirror
            // them so the "Connected" badge updates without a reload.
            setSettingsData({
                ...settingsData,
                [settingsKey]: {
                    client_id: reg.data.client_id,
                    client_secret: reg.data.client_secret,
                    name: reg.data.name,
                    email,
                },
            });

            const tok = await getOpenverseToken();
            setShowForm(false);

            if (tok.ok) {
                setSaveBtnText(__("Generated API", "essential-blocks"));
                setTimeout(() => {
                    setTrigger(false);
                }, 300);
            } else {
                setSaveBtnText(__("Generate API", "essential-blocks"));
                setError(
                    sprintf(
                        /* translators: %s: error message. */
                        __(
                            "Your API credentials were saved, but the access token could not be generated: %s",
                            "essential-blocks"
                        ),
                        tok.code === "server"
                            ? openverseErrorMessage(tok.data ?? tok.error)
                            : GENERIC_ERROR()
                    )
                );
            }
        } catch (err) {
            setSaveBtnText(__("Generate API", "essential-blocks"));
            setError(GENERIC_ERROR());
        } finally {
            setLoadingApi(false);
            setGenerating(false);
        }
    };

    return (
        <>
            <div className="option-modal-content">
                <h2 className="option-modal__title mb20">
                    {__("Openverse API", "essential-blocks")}
                </h2>
                {showForm && (
                    <div className="openverse-placheholderbox__description">
                        {__(
                            "Provide your Email ID & unique Project Name to get access to Openverse  using API, these are required field",
                            "essential-blocks"
                        )}
                    </div>
                )}
                {!showForm && (
                    <>
                        {openverseRegError.status &&
                            openverseRegError.type === "Success" && (
                                <Alert
                                    tone="success"
                                    className="eb-modal-alert"
                                    title={__("Hurray!", "essential-blocks")}
                                >
                                    <p>
                                        {__(
                                            "You have generated an API successfully! Please verify your email to enjoy uninterrupted access to Openverse",
                                            "essential-blocks"
                                        )}
                                    </p>
                                    <p>
                                        {__(
                                            "Without verifying your email you can get access to Openverse as anonymous and your search limit will be 100 requests/ day and 5 requests/ hr.",
                                            "essential-blocks"
                                        )}
                                    </p>
                                </Alert>
                            )}
                    </>
                )}

                <div
                    className={`eb-openverse-form-wrapper ${loadingApi ? "loading-circle" : ""
                        }`}
                >
                    <TextField
                        id="openverse-mail"
                        className="eb-modal-field"
                        type="email"
                        required
                        label={__("Email", "essential-blocks")}
                        placeholder={__("user@example.com", "essential-blocks")}
                        value={email || ""}
                        error={email && emailError ? emailError : undefined}
                        onChange={setEmail}
                    />
                    <TextField
                        id="openverse-name"
                        className="eb-modal-field"
                        required
                        label={__("Project Name", "essential-blocks")}
                        placeholder={__("My amazing project", "essential-blocks")}
                        value={name || ""}
                        error={
                            openverseRegError.status && openverseRegError.type === "Error"
                                ? openverseRegError.message
                                : undefined
                        }
                        onChange={setName}
                    />

                    <Button
                        variant="primary"
                        className="openverse-api-btn"
                        disabled={!(email && !emailError && name) || generating}
                        loading={generating}
                        onClick={(e) => generateAPI(e)}
                    >
                        {saveBtnText}
                    </Button>

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
export default Openverse;
