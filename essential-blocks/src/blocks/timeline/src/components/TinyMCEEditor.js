/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { Component } from "@wordpress/element";
import { TextareaControl } from "@wordpress/components";

// wp.oldEditor removed in WP 6.6
const getWpEditor = () => window.wp && (window.wp.editor || window.wp.oldEditor);

/**
 * The classic editor is only usable when core printed it via wp_enqueue_editor():
 * TinyMCE itself plus wp.editor.getDefaultSettings(). Without the latter,
 * wp.editor.initialize() returns early and leaves a bare textarea behind.
 */
const canUseClassicEditor = () => {
    const wpEditor = getWpEditor();
    return !!(
        window.tinymce &&
        wpEditor &&
        typeof wpEditor.initialize === "function" &&
        typeof wpEditor.getDefaultSettings === "function"
    );
};

/**
 * TinyMCE Editor Component for Timeline Block
 * Based on: https://medium.com/the-andela-way/how-to-replace-the-richtext-editor-with-tinymce-in-your-custom-wordpress-block-740055807f87
 */
class TinyMCEEditor extends Component {
    constructor(props) {
        super(props);
        this.initialize = this.initialize.bind(this);
        this.onSetup = this.onSetup.bind(this);
        this.focus = this.focus.bind(this);
        this.emitChange = this.emitChange.bind(this);
        this.state = {
            editor: null,
            editorContent: props.value || '',
            bookmark: null,
            useClassicEditor: canUseClassicEditor(),
        };
    }

    componentDidMount() {
        if (!this.state.useClassicEditor) {
            return;
        }

        // Add a small delay to prevent conflicts when multiple editors are initialized
        this.initTimer = setTimeout(() => {
            this.initialize();
        }, 100);
    }

    componentDidUpdate(prevProps) {
        const { editor } = this.state;
        const { value } = this.props;

        // Push external changes (undo/redo, reordering items) into TinyMCE,
        // but never while the user is typing in it.
        if (
            editor &&
            value !== prevProps.value &&
            value !== editor.getContent() &&
            !editor.hasFocus()
        ) {
            editor.setContent(value || '');
        }
    }

    componentWillUnmount() {
        const { clientId } = this.props;

        clearTimeout(this.initTimer);

        if (!this.state.useClassicEditor) {
            return;
        }

        // Clean up TinyMCE editor
        if (window.tinymce && window.tinymce.get(clientId)) {
            window.tinymce.get(clientId).remove();
        }

        // Clean up WordPress editor
        const wpEditor = getWpEditor();
        if (wpEditor && typeof wpEditor.remove === "function") {
            wpEditor.remove(clientId);
        }
    }

    initialize() {
        const { clientId } = this.props;
        const wpEditor = getWpEditor();

        // Check if editor already exists and remove it first
        if (window.tinymce && window.tinymce.get(clientId)) {
            window.tinymce.get(clientId).remove();
        }

        wpEditor.initialize(clientId, {
            tinymce: {
                wpautop: true,
                toolbar1: 'formatselect,bold,italic,bullist,numlist,link,image,alignleft,aligncenter,alignright',
                toolbar2: 'strikethrough,hr,forecolor,pastetext,removeformat,charmap,outdent,indent,undo,redo',
                menubar: false,
                statusbar: false,
                height: 200,
                plugins: 'lists,link,paste,textcolor,colorpicker,hr,charmap,image,media',
                paste_as_text: true,
                paste_auto_cleanup_on_paste: true,
                paste_remove_styles: true,
                paste_remove_styles_if_webkit: true,
                paste_strip_class_attributes: 'all',
                content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif; font-size: 14px; line-height: 1.6; }',
                image_advtab: true,
                image_caption: true,
                image_title: true,
                image_description: false,
                image_dimensions: true,
                image_class_list: [
                    { title: 'None', value: '' },
                    { title: 'Responsive', value: 'wp-image-responsive' },
                    { title: 'Rounded', value: 'wp-image-rounded' },
                    { title: 'Circle', value: 'wp-image-circle' }
                ],
                setup: this.onSetup
            },
            quicktags: false,
            mediaButtons: true
        });
    }

    // Read onChange at call time: TinyMCE handlers outlive the props they were set up with.
    emitChange(content) {
        this.setState({ editorContent: content });
        if (this.props.onChange) {
            this.props.onChange(content);
        }
    }

    onSetup(editor) {
        const { value } = this.props;

        this.setState({ editor });

        // Set initial content
        if (value) {
            editor.setContent(value);
        }

        // Handle content changes immediately
        editor.on('input change keyup', () => {
            this.emitChange(editor.getContent());
        });

        // Handle content changes on blur (for backup)
        editor.on('blur', () => {
            const bookmark = editor.selection.getBookmark(2, true);
            this.setState({ bookmark });
            this.emitChange(editor.getContent());
        });

        // Restore selection on focus
        editor.on('focus', () => {
            if (this.state.bookmark) {
                editor.selection.moveToBookmark(this.state.bookmark);
            }
        });

        // Handle keyboard events
        editor.on('keydown', (event) => {
            // Handle Enter key for new paragraphs
            if (event.keyCode === 13 && !event.shiftKey) {
                // Let TinyMCE handle paragraph creation
                return;
            }

            // Handle Tab key
            if (event.keyCode === 9) {
                event.preventDefault();
                if (event.shiftKey) {
                    editor.execCommand('Outdent');
                } else {
                    editor.execCommand('Indent');
                }
            }
        });

        // Handle paste events
        editor.on('paste', () => {
            // Let TinyMCE handle paste with its built-in cleaning
            setTimeout(() => {
                this.emitChange(editor.getContent());
            }, 100);
        });
    }

    focus() {
        if (this.state.editor) {
            this.state.editor.focus();
        }
    }

    render() {
        const { clientId, placeholder, value, onChange } = this.props;

        // Visual editor unavailable (e.g. "Disable the visual editor" in the user's
        // profile): fall back to a controlled textarea so edits are still saved.
        if (!this.state.useClassicEditor) {
            return (
                <TextareaControl
                    className="eb-tinymce-editor-fallback"
                    value={value || ''}
                    onChange={(content) => onChange && onChange(content)}
                    placeholder={placeholder || "Enter your content here..."}
                    help={__(
                        "The visual editor isn't available here. You can enter HTML directly.",
                        "essential-blocks",
                    )}
                    rows={8}
                    __nextHasNoMarginBottom
                />
            );
        }

        return (
            <div className="eb-tinymce-editor-wrapper">
                <div id={`wp-${clientId}-wrap`} className="wp-core-ui wp-editor-wrap">
                    <div className="wp-editor-container">
                        <textarea
                            id={clientId}
                            className="wp-editor-area"
                            placeholder={placeholder || "Enter your content here..."}
                            defaultValue={value || ''}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default TinyMCEEditor;
