/**
 * Inline "Responsive Breakpoints" form for the Settings tab.
 *
 * Saves exactly what the modal saves: key `responsiveBreakpoints`,
 * value `{"mobile":<int>,"tablet":<int>}`, through the queued eb_settings
 * writer; reset asks for confirmation first.
 */

/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useEffect, useState } from "@wordpress/element";

/**
 * Internal dependencies
 */
import { NumberField } from "../ui/Field";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import { useConfirm } from "../ui/ConfirmDialog";
import { useToast } from "../../context/ToastContext";
import { useEbSettings } from "../../context/SettingsContext";
import useSettingMutation from "../../hooks/useSettingMutation";
import { resetSetting } from "../../api/actions";

export const BREAKPOINT_KEY = "responsiveBreakpoints";
export const DEFAULT_BREAKPOINTS = { mobile: 767, tablet: 1024 };

// The value arrives as an object (cache), a JSON string, or a slashed JSON
// string (as stored by the server).
const parseBreakpoints = (value) => {
    if (value && typeof value === "object") {
        return value;
    }
    if (typeof value === "string" && value) {
        try {
            return JSON.parse(value.replace(/\\"/g, '"'));
        } catch (e) {
            return null;
        }
    }
    return null;
};

const toValues = (raw) => {
    const parsed = parseBreakpoints(raw);
    return {
        tablet: String(Number(parsed?.tablet) || DEFAULT_BREAKPOINTS.tablet),
        mobile: String(Number(parsed?.mobile) || DEFAULT_BREAKPOINTS.mobile),
    };
};

const isWhole = (value) => /^\d+$/.test(String(value).trim()) && Number(value) >= 1;

/**
 * @return {JSX.Element} Breakpoints form.
 */
export default function BreakpointsSection() {
    const { settings, setLocal } = useEbSettings();
    const { saveSetting, enqueue } = useSettingMutation();
    const confirm = useConfirm();
    const { show } = useToast();

    const initialFrom = () =>
        toValues(
            settings?.[BREAKPOINT_KEY] ??
                window.EssentialBlocksLocalize?.responsiveBreakpoints
        );

    const [saved, setSaved] = useState(initialFrom);
    const [values, setValues] = useState(initialFrom);
    const [touched, setTouched] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [busy, setBusy] = useState(null);
    const [error, setError] = useState("");

    // Re-sync when the stored value changes elsewhere (e.g. the modal).
    const storedRaw = settings?.[BREAKPOINT_KEY];
    useEffect(() => {
        if (storedRaw === undefined) {
            return;
        }
        const next = toValues(storedRaw);
        setSaved(next);
        setValues(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeof storedRaw === "object" ? JSON.stringify(storedRaw) : storedRaw]);

    const errors = {};
    ["tablet", "mobile"].forEach((field) => {
        if (!isWhole(values[field])) {
            errors[field] = __("Enter a whole number.", "essential-blocks");
        }
    });
    if (!errors.mobile && !errors.tablet && Number(values.mobile) >= Number(values.tablet)) {
        errors.mobile = __(
            "Mobile breakpoint must be smaller than the tablet breakpoint.",
            "essential-blocks"
        );
    }
    const showError = (field) =>
        (touched[field] || submitted) && errors[field] ? errors[field] : undefined;

    const dirty = values.tablet !== saved.tablet || values.mobile !== saved.mobile;
    const valid = !errors.tablet && !errors.mobile;

    const handleSave = async () => {
        setSubmitted(true);
        if (!valid || !dirty || busy) {
            return;
        }
        setError("");
        setBusy("save");
        const saveData = { mobile: Number(values.mobile), tablet: Number(values.tablet) };
        const res = await saveSetting(BREAKPOINT_KEY, JSON.stringify(saveData));
        setBusy(null);
        if (res.ok) {
            setLocal({ [BREAKPOINT_KEY]: saveData });
            window.EssentialBlocksLocalize.responsiveBreakpoints = { ...saveData };
            const next = toValues(saveData);
            setSaved(next);
            setValues(next);
            setTouched({});
            setSubmitted(false);
            show({ message: __("Breakpoints saved", "essential-blocks") });
        } else {
            setError(__("Something went wrong! Please try again.", "essential-blocks"));
        }
    };

    const handleReset = async () => {
        if (busy) {
            return;
        }
        const ok = await confirm({
            title: __("Reset breakpoints?", "essential-blocks"),
            message: __("Tablet goes back to 1024px and mobile to 767px.", "essential-blocks"),
            confirmLabel: __("Reset", "essential-blocks"),
            tone: "danger",
        });
        if (!ok) {
            return;
        }
        setError("");
        setBusy("reset");
        const res = await enqueue(() => resetSetting(BREAKPOINT_KEY));
        setBusy(null);
        if (res.ok) {
            const next = { ...(settings || {}) };
            delete next[BREAKPOINT_KEY];
            setLocal(next, { replace: true });
            window.EssentialBlocksLocalize.responsiveBreakpoints = { ...DEFAULT_BREAKPOINTS };
            const reset = toValues(DEFAULT_BREAKPOINTS);
            setSaved(reset);
            setValues(reset);
            setTouched({});
            setSubmitted(false);
        } else {
            setError(__("Something went wrong! Please try again.", "essential-blocks"));
        }
    };

    return (
        <div className="eb-breakpoints">
            <div className="eb-breakpoints__fields">
                <NumberField
                    id="eb-breakpoint-tablet"
                    label={__("Tablet Breakpoints", "essential-blocks")}
                    unit="px"
                    min={1}
                    placeholder={String(DEFAULT_BREAKPOINTS.tablet)}
                    value={values.tablet}
                    error={showError("tablet")}
                    onChange={(value) => setValues((prev) => ({ ...prev, tablet: value }))}
                    onBlur={() => setTouched((prev) => ({ ...prev, tablet: true }))}
                />
                <NumberField
                    id="eb-breakpoint-mobile"
                    label={__("Mobile Breakpoints", "essential-blocks")}
                    unit="px"
                    min={1}
                    placeholder={String(DEFAULT_BREAKPOINTS.mobile)}
                    value={values.mobile}
                    error={showError("mobile")}
                    onChange={(value) => setValues((prev) => ({ ...prev, mobile: value }))}
                    onBlur={() => setTouched((prev) => ({ ...prev, mobile: true }))}
                />
            </div>

            {error && (
                <Alert tone="error" role="alert">
                    {error}
                </Alert>
            )}

            <div className="eb-breakpoints__actions">
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={!dirty || !!busy}
                    loading={busy === "save"}
                >
                    {__("Save Changes", "essential-blocks")}
                </Button>
                <Button
                    variant="secondary"
                    onClick={handleReset}
                    disabled={!!busy}
                    loading={busy === "reset"}
                >
                    {__("Reset", "essential-blocks")}
                </Button>
                {dirty && (
                    <span className="eb-breakpoints__dirty">
                        {__("Unsaved changes", "essential-blocks")}
                    </span>
                )}
            </div>
        </div>
    );
}
