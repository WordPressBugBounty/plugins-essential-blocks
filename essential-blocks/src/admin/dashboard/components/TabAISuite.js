/**
 * WordPress dependencies
 */
import { useEffect, useRef, useState } from "@wordpress/element";
import { __, sprintf } from "@wordpress/i18n";
import { EB_LINKS } from "../../../controls/src/helpers/ebLinks";
/**
 * External dependencies
 */
import AsyncSelect from "react-select/async";
import { useSelect } from "@wordpress/data";

/**
 * Internal dependencies
 */
import PageHeader from "./ui/PageHeader";
import Toggle from "./ui/Toggle";
import Button from "./ui/Button";
import { Section } from "./ui/Page";
import Alert from "./ui/Alert";
import useUnsavedGuard, { drafts } from "../hooks/useUnsavedGuard";
import { saveAiSettings, isApiKeyError } from "../api/actions";
import { useEbOption } from "../context/SettingsContext";
import { useToast } from "../context/ToastContext";

const DRAFT_KEY = "ai-suite";

// The model list comes from OpenAI::CONTENT_MODELS on the server
const DEFAULT_CONTENT_MODEL = window.EssentialBlocksLocalize?.aiDefaultContentModel || "gpt-4.1-mini";
const CONTENT_MODEL_OPTIONS = window.EssentialBlocksLocalize?.aiContentModels?.length
    ? window.EssentialBlocksLocalize.aiContentModels
    : [{ value: DEFAULT_CONTENT_MODEL, label: DEFAULT_CONTENT_MODEL }];
const LEGACY_CONTENT_MODELS = window.EssentialBlocksLocalize?.aiLegacyContentModels || {};

// Map a saved model that is no longer offered to its replacement
const normalizeContentModel = (model) => {
    if (CONTENT_MODEL_OPTIONS.some((option) => option.value === model)) {
        return model;
    }
    return LEGACY_CONTENT_MODELS[model] || DEFAULT_CONTENT_MODEL;
};

// Form values equal? postTypes is the only array in the shape.
const sameSettings = (a, b) => {
    const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
    for (const key of keys) {
        const x = a?.[key];
        const y = b?.[key];
        if (Array.isArray(x) || Array.isArray(y)) {
            if (!Array.isArray(x) || !Array.isArray(y) || x.join("\n") !== y.join("\n")) {
                return false;
            }
        } else if (x !== y) {
            return false;
        }
    }
    return true;
};

export default function TabAISuite() {
    const [aiSettings, setAiSettings] = useState({
        writePageContent: true,
        writeRichtext: true,
        writeInputFields: true,
        generateImage: true,
        postTypes: ['all'],
        apiKey: "",
        maxTokens: 1500,
        contentModel: DEFAULT_CONTENT_MODEL,
    });

    // Track if settings have been loaded from the server
    const [settingsLoaded, setSettingsLoaded] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({});
    const [apiKeyError, setApiKeyError] = useState('');
    const [showFeatureOptions, setShowFeatureOptions] = useState(false);
    const [postTypeOptions, setPostTypeOptions] = useState([
        { value: 'all', label: __('All Post Types', 'essential-blocks') }
    ]);

    const filterablePostTypes = useSelect((select) => {
        const postTypes = select("core").getPostTypes({ per_page: -1 });

        if (!postTypes) {
            return []; // Or default value if needed
        }

        const filteredValues = postTypes.filter((item) => (!['attachment', 'docs', 'product'].includes(item.slug)) && item.viewable)
            .map((item) => ({
                label: item.name,
                value: item.slug
            }));

        return filteredValues.length > 0 ? filteredValues : [{ label: "Post", value: "posts" }];
    }, []);

    // Function to load post types
    const loadPostTypes = (inputValue, callback) => {
        const options = [
            { value: 'all', label: __('All Post Types', 'essential-blocks') },
            ...filterablePostTypes
        ];

        setPostTypeOptions(options);
        callback(options.filter(option =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
        ));
    };

    // eb_write_with_ai comes from the shared cache (fetched once per page).
    const { data: savedAiSettings, loading: aiLoading, setLocal: setCachedAiSettings } =
        useEbOption("eb_write_with_ai");
    const { show } = useToast();
    const [showApiKey, setShowApiKey] = useState(false);
    // Saved key and model; the server validates only when either changes.
    const initialApiKey = useRef("");
    const initialModel = useRef("");
    const [validating, setValidating] = useState(false);
    // Last saved values; the form is dirty while it differs.
    const [savedSnapshot, setSavedSnapshot] = useState(null);
    const [draftRestored, setDraftRestored] = useState(false);

    // Seed the form once the saved settings arrive.
    useEffect(() => {
        if (aiLoading || settingsLoaded) {
            return;
        }
        let data = { ...aiSettings, ...savedAiSettings };

        // Ensure postTypes is always an array
        if (!Array.isArray(data.postTypes)) {
            data.postTypes = ['all'];
        }

        if ('enableAi' in data) {
            const enabled = data.enableAi === true;
            data = { ...data, writePageContent: enabled, writeRichtext: enabled, writeInputFields: enabled };
            delete data.enableAi;
        }

        data.contentModel = normalizeContentModel(data.contentModel);

        initialApiKey.current = data.apiKey || "";
        initialModel.current = data.contentModel || "";
        setSavedSnapshot(data);
        // Edits left via browser Back/Forward earlier in this page session.
        const draft = drafts.get(DRAFT_KEY);
        if (draft && !sameSettings(draft, data)) {
            setAiSettings(draft);
            setDraftRestored(true);
        } else {
            drafts.clear(DRAFT_KEY);
            setAiSettings(data);
        }
        setSettingsLoaded(true);
    }, [aiLoading]);

    const isDirty = settingsLoaded && !!savedSnapshot && !sameSettings(aiSettings, savedSnapshot);

    // Keep unsaved edits if the tab unmounts while dirty (Back/Forward).
    const unmountState = useRef({});
    unmountState.current = { isDirty, aiSettings };
    useEffect(
        () => () => {
            if (unmountState.current.isDirty) {
                drafts.set(DRAFT_KEY, unmountState.current.aiSettings);
            }
        },
        []
    );

    useUnsavedGuard(isDirty, {
        message: __("Your AI Suite changes haven't been saved.", "essential-blocks"),
        onConfirmLeave: () => {
            unmountState.current.isDirty = false;
            drafts.clear(DRAFT_KEY);
        },
    });

    const discardDraft = () => {
        drafts.clear(DRAFT_KEY);
        setDraftRestored(false);
        setApiKeyError("");
        setAiSettings(savedSnapshot);
    };

    // Effect to update post type options when filterablePostTypes changes
    useEffect(() => {
        if (filterablePostTypes && filterablePostTypes.length > 0) {
            const options = [
                { value: 'all', label: __('All Post Types', 'essential-blocks') },
                ...filterablePostTypes
            ];
            setPostTypeOptions(options);
        }
    }, [filterablePostTypes]);

    const allContentEnabled = aiSettings.writePageContent || aiSettings.writeRichtext || aiSettings.writeInputFields;

    const onChangeAllContentSwitch = (value) => {
        setAiSettings({
            ...aiSettings,
            writePageContent: value,
            writeRichtext: value,
            writeInputFields: value,
        });
    };

    const toggleFeatureOptions = () => {
        setShowFeatureOptions(!showFeatureOptions);
    };

    const onChangewritePageContent = (value) => {
        setAiSettings({
            ...aiSettings,
            writePageContent: value,
        });
    };

    const onChangewriteRichtext = (value) => {
        setAiSettings({
            ...aiSettings,
            writeRichtext: value,
        });
    };

    const onChangewriteInputFields = (value) => {
        setAiSettings({
            ...aiSettings,
            writeInputFields: value,
        });
    };

    const onChangeGenerateImage = (value) => {
        setAiSettings({
            ...aiSettings,
            generateImage: value,
        });
    };

    const handlePostTypesChange = (selectedOptions) => {
        setAiSettings({
            ...aiSettings,
            postTypes: selectedOptions ? selectedOptions.map(option => option.value) : ['all'],
        });
    };

    const handleApiKeyChange = (event) => {
        // Clear any previous API key error when the user starts typing
        if (apiKeyError) {
            setApiKeyError('');
        }

        setAiSettings({
            ...aiSettings,
            apiKey: event.target.value,
        });
    };

    const handleMaxTokensChange = (event) => {
        setAiSettings({
            ...aiSettings,
            maxTokens: parseInt(event.target.value) || 1200,
        });
    };

    const handleContentModelChange = (event) => {
        setAiSettings({
            ...aiSettings,
            contentModel: event.target.value,
        });
    };

    const saveOptionsData = async () => {
        if (isSaving) {
            return;
        }
        setIsSaving(true);
        setSaveMessage({});
        // The server validates the key with OpenAI, which can be slow.
        setValidating(
            (aiSettings.apiKey || "") !== initialApiKey.current ||
            (aiSettings.contentModel || "") !== initialModel.current
        );

        const submitted = aiSettings;
        const res = await saveAiSettings(submitted);
        setIsSaving(false);
        setValidating(false);

        if (res.ok) {
            setCachedAiSettings(submitted);
            initialApiKey.current = submitted.apiKey || "";
            initialModel.current = submitted.contentModel || "";
            setSavedSnapshot(submitted);
            drafts.clear(DRAFT_KEY);
            setDraftRestored(false);
            show({ message: __("Settings saved successfully.", "essential-blocks") });
            return;
        }
        // Check if it's an API key validation error
        let message = __("Error saving settings.", "essential-blocks");
        if (isApiKeyError(res)) {
            const serverMessage = res.data.message || "";
            switch (res.data.error_type) {
                case "network":
                    message = sprintf(
                        /* translators: %s: error returned while contacting OpenAI */
                        __("Could not reach OpenAI to verify the API key (%s). Please try again.", "essential-blocks"),
                        serverMessage
                    );
                    break;
                case "model_unavailable":
                    message = sprintf(
                        /* translators: 1: model name, 2: error returned by OpenAI */
                        __("This API key cannot use the %1$s model. %2$s", "essential-blocks"),
                        res.data.model || submitted.contentModel,
                        serverMessage
                    );
                    break;
                case "api_error":
                    message = serverMessage || __("OpenAI returned an error while verifying the API key.", "essential-blocks");
                    break;
                default:
                    message = __("Incorrect API key provided. Please check and try again.", "essential-blocks");
            }
            if (res.data.error_type === "invalid_key" || !res.data.error_type) {
                setApiKeyError(message);
            }
        }
        setSaveMessage({ type: "error", message });
        show({ type: "error", message });
    };

    const featureToggles = [
        { key: "writePageContent", label: __("Generate Page Content", "essential-blocks"), onChange: onChangewritePageContent },
        { key: "writeRichtext", label: __("Generate RichText Content", "essential-blocks"), onChange: onChangewriteRichtext },
        { key: "writeInputFields", label: __("Generate Block Input Content", "essential-blocks"), onChange: onChangewriteInputFields },
    ];

    return (
        <div className="eb-ai-suite">
            <PageHeader
                title={__("AI Suite", "essential-blocks")}
                description={__("Write content and generate images with AI inside the block editor.", "essential-blocks")}
            />

            {draftRestored && isDirty && (
                <Alert
                    tone="warning"
                    className="eb-ai-draft-alert"
                    actions={
                        <Button variant="secondary" size="sm" onClick={discardDraft}>
                            {__("Discard", "essential-blocks")}
                        </Button>
                    }
                >
                    {__("You have unsaved changes from earlier in this session.", "essential-blocks")}
                </Alert>
            )}

            <Section id="eb-ai-connection" title={__("Connection", "essential-blocks")} className="eb-ai-section">
                <div className="eb-card eb-ai-card">
                {/* Content Generation Model */}
                <div className="eb-ai-row">
                    <div className="eb-ai-row__info">
                        <label className="eb-ai-row__title" htmlFor="eb-ai-model">{__("Content Generation Model", "essential-blocks")}</label>
                        <p>{__("Select the OpenAI model to use for AI content generation. Different models offer varying capabilities and performance.", "essential-blocks")}</p>
                    </div>
                    <div className="eb-ai-row__control">
                        <select
                            id="eb-ai-model"
                            value={aiSettings.contentModel}
                            onChange={handleContentModelChange}
                            className="eb-ai-input eb-content-model-select"
                        >
                            {CONTENT_MODEL_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* API Keys */}
                <div className="eb-ai-row">
                    <div className="eb-ai-row__info">
                        <label className="eb-ai-row__title" htmlFor="eb-ai-api-key">{__("API Key", "essential-blocks")}</label>
                        <p>{__("Connect your OpenAI account by entering your API key.", "essential-blocks")}</p>
                        <p>
                            {__("Check this ", "essential-blocks")}
                            <a href={EB_LINKS.docs.writeWithAi} target="_blank" rel="noopener noreferrer">{__("documentation", "essential-blocks")}</a>
                            {__(" to learn how to generate your OpenAI API key.", "essential-blocks")}
                        </p>
                    </div>
                    <div className="eb-ai-row__control">
                        <div className="eb-ai-secret">
                            <input
                                id="eb-ai-api-key"
                                type={showApiKey ? "text" : "password"}
                                autoComplete="off"
                                spellCheck={false}
                                value={aiSettings.apiKey}
                                onChange={handleApiKeyChange}
                                placeholder={__("Enter API key", "essential-blocks")}
                                className={`eb-ai-input ${apiKeyError ? "eb-input-error" : ""}`}
                                aria-invalid={!!apiKeyError}
                                aria-describedby={apiKeyError ? "eb-ai-api-key-error" : undefined}
                            />
                            <button
                                type="button"
                                className="eb-ai-secret__toggle"
                                onClick={() => setShowApiKey(!showApiKey)}
                                aria-label={showApiKey ? __("Hide API key", "essential-blocks") : __("Show API key", "essential-blocks")}
                            >
                                {showApiKey ? __("Hide", "essential-blocks") : __("Show", "essential-blocks")}
                            </button>
                        </div>
                        {apiKeyError && (
                            <div className="eb-api-key-error" id="eb-ai-api-key-error">
                                {apiKeyError}
                            </div>
                        )}
                    </div>
                </div>

                {/* Set Max Tokens */}
                <div className="eb-ai-row">
                    <div className="eb-ai-row__info">
                        <label className="eb-ai-row__title" htmlFor="eb-ai-max-tokens">{__("Set Max Tokens", "essential-blocks")}</label>
                        <p>
                            {__("Content will be generated based on the Token Limits you have set. For more information on Token Limits, you can check out this ", "essential-blocks")}
                            <a href="https://platform.openai.com/settings/organization/limits" target="_blank" rel="noopener noreferrer">{__("link.", "essential-blocks")}</a>
                        </p>
                    </div>
                    <div className="eb-ai-row__control">
                        <input
                            id="eb-ai-max-tokens"
                            type="number"
                            className="eb-ai-input"
                            value={aiSettings.maxTokens}
                            onChange={handleMaxTokensChange}
                            min="1"
                            max="4000"
                        />
                    </div>
                </div>

                </div>
            </Section>

            <Section id="eb-ai-features" title={__("Features", "essential-blocks")} className="eb-ai-section">
                <div className="eb-card eb-ai-card">
                {/* Write with AI */}
                <div className="eb-ai-row">
                    <div className="eb-ai-row__info">
                        <h3 className="eb-ai-row__title" id="eb-ai-write">{__("Enable Write with AI", "essential-blocks")}</h3>
                        <p>{__("Toggle to enable or disable the AI writing functionality inside the Gutenberg Editor.", "essential-blocks")}</p>
                    </div>
                    <div className="eb-ai-row__control">
                        <div className="eb-ai-option">
                            <span className="eb-ai-option__label" id="eb-ai-all-content">
                                {__("Enable or disable all content features", "essential-blocks")}
                            </span>
                            <div className="eb-ai-option__actions">
                                <Toggle
                                    checked={allContentEnabled}
                                    onChange={onChangeAllContentSwitch}
                                    labelledBy="eb-ai-all-content"
                                    disabled={!settingsLoaded}
                                />
                                <button
                                    type="button"
                                    className="eb-icon-btn eb-ai-expand"
                                    onClick={toggleFeatureOptions}
                                    aria-expanded={showFeatureOptions}
                                    aria-controls="eb-ai-feature-options"
                                    aria-label={__("Show individual content features", "essential-blocks")}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div id="eb-ai-feature-options" className="eb-ai-suboptions" hidden={!showFeatureOptions}>
                            {featureToggles.map((feature) => (
                                <div className="eb-ai-option" key={feature.key}>
                                    <span className="eb-ai-option__label" id={`eb-ai-${feature.key}`}>
                                        {feature.label}
                                    </span>
                                    <Toggle
                                        checked={!!aiSettings?.[feature.key]}
                                        onChange={feature.onChange}
                                        labelledBy={`eb-ai-${feature.key}`}
                                        disabled={!settingsLoaded}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Generate AI Images */}
                <div className="eb-ai-row">
                    <div className="eb-ai-row__info">
                        <h3 className="eb-ai-row__title" id="eb-ai-generate-image">{__("Generate AI Images", "essential-blocks")}</h3>
                        <p id="eb-ai-generate-image-desc">{__("Toggle to enable or disable the AI image generation functionality inside the Gutenberg Editor.", "essential-blocks")}</p>
                    </div>
                    <div className="eb-ai-row__control">
                        <div className="eb-ai-option">
                            <Toggle
                                checked={!!aiSettings?.generateImage}
                                onChange={onChangeGenerateImage}
                                labelledBy="eb-ai-generate-image"
                                describedBy="eb-ai-generate-image-desc"
                                disabled={!settingsLoaded}
                            />
                        </div>
                    </div>
                </div>

                </div>
            </Section>

            <Section id="eb-ai-where" title={__("Where", "essential-blocks")} className="eb-ai-section">
                <div className="eb-card eb-ai-card">
                {/* Choose Post Types */}
                <div className="eb-ai-row">
                    <div className="eb-ai-row__info">
                        <h3 className="eb-ai-row__title" id="eb-ai-post-types">{__("Choose Post Types", "essential-blocks")}</h3>
                        <p>{__("Select which post types you want to enable AI writing for (Posts, Pages, or any custom post types).", "essential-blocks")}</p>
                    </div>
                    <div className="eb-ai-row__control">
                        <AsyncSelect
                            isMulti
                            cacheOptions
                            aria-labelledby="eb-ai-post-types"
                            defaultOptions={postTypeOptions}
                            loadOptions={loadPostTypes}
                            value={settingsLoaded && postTypeOptions.filter(option =>
                                aiSettings.postTypes && aiSettings.postTypes.includes(option.value)
                            )}
                            onChange={handlePostTypesChange}
                            placeholder={__("Select Post Types", "essential-blocks")}
                            className="eb-post-types-select"
                            classNamePrefix="eb-select"
                            isLoading={!settingsLoaded || !filterablePostTypes || filterablePostTypes.length === 0}
                        />
                    </div>
                </div>

                </div>
            </Section>

            <div className={`eb-ai-actions eb-ai-actions--form${isDirty ? " is-sticky" : ""}`}>
                <span className="eb-ai-actions__dirty" role="status">
                    {isDirty ? __("Unsaved changes", "essential-blocks") : ""}
                </span>
                    {saveMessage?.type === "error" && (
                        <span className="eb-save-message error">{saveMessage.message}</span>
                    )}
                    <Button onClick={saveOptionsData} loading={isSaving} disabled={!settingsLoaded || isSaving}>
                        {isSaving && validating && __("Validating key…", "essential-blocks")}
                        {isSaving && !validating && __("Saving…", "essential-blocks")}
                        {!isSaving && __("Save Changes", "essential-blocks")}
                    </Button>
                    <span className="eb-visually-hidden" role="status">
                        {isSaving && validating ? __("Validating key…", "essential-blocks") : ""}
                    </span>
                </div>
        </div>
    );
}
