/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useEffect, useRef, useState } from "@wordpress/element";
import { applyFilters } from "@wordpress/hooks";
import { extractDynamicStingInfo } from "../../../helpers";
import { useBlockAttributes } from "../../../hooks";

import EBTextControl from "../../text-control";
import EBTextareaControl from "../../textarea-control";

export function DynamicInputControl(props) {
    const {
        label,
        attrName,
        inputValue,
        setAttributes,
        onChange,
        placeholder,
        help,
        isTextarea,
        type,
        keyName,
        index,
        isObject,
        isImageField,
        imageIdAttr,
        enableAi = true,
        onBlur = () => null,
        fieldType,
        showValidation,
        enableSecurity,
        // Fields edited only here, where typing markup is intended.
        allowMarkup = false,
    } = props;

    const [fieldValue, setFieldValue] = useState("");
    const [fieldPlaceholder, setFieldPlaceholder] = useState("");
    const [readOnly, setReadOnly] = useState(false);
    const [didMount, setDidMount] = useState(false);
    const attributes = useBlockAttributes();

    const dynamicTag = window?.EssentialBlocksProLocalize
        ? EssentialBlocksProLocalize.eb_dynamic_tags + "/"
        : "dynamic-tags/";

    useEffect(() => {
        setDidMount(true);
        if (inputValue && inputValue.startsWith(dynamicTag, 0)) {
            setReadOnly(true);
            setFieldPlaceholder(extractDynamicStingInfo(inputValue));
        }
    }, []);

    useEffect(() => {
        if (didMount && EssentialBlocksProLocalize) {
            if (typeof fieldValue === "string" && fieldValue.startsWith(dynamicTag, 0)) {
                setReadOnly(true);
                if (isObject) {
                    const newItem = { ...attributes[keyName][index] };
                    const newItemList = [...attributes[keyName]];
                    newItemList[index] = newItem;
                    newItemList[index][attrName] = fieldValue;
                    setAttributes({ [keyName]: newItemList });
                } else {
                    setAttributes({ [attrName]: fieldValue });
                    // A dynamic tag has no attachment behind it, so the stored
                    // media ID has to go. Guarded: `imageIdAttr` is optional, and
                    // a computed `[undefined]` key writes an attribute literally
                    // named "undefined" onto the block.
                    if (imageIdAttr) {
                        setAttributes({ [imageIdAttr]: null })
                    }
                }

                setFieldPlaceholder(extractDynamicStingInfo(fieldValue));
            }
            else {
                setReadOnly(false);
                // Reset sends `false` so this effect re-runs even when the state is
                // already "". The attribute is a string, so store its empty state.
                setAttributes({ [attrName]: fieldValue === false ? "" : fieldValue });
            }
        }
    }, [fieldValue]);

    // The canvas edits most of these attributes as rich text, so the value can
    // hold markup (<mark>, <strong>, colour spans…). A plain input showed the
    // raw HTML and one keystroke could break or drop the formatting, so such
    // a value is shown as text, read-only, until the author opts to edit the
    // HTML itself. Dynamic tags keep their own read-only preview above.
    const [markupUnlocked, setMarkupUnlocked] = useState(false);
    const hasMarkup =
        !readOnly &&
        !allowMarkup &&
        typeof inputValue === "string" &&
        /<\/?[a-z][^>]*>/i.test(inputValue);
    const lockMarkup = hasMarkup && !markupUnlocked;
    const markupAsText = lockMarkup
        ? new DOMParser().parseFromString(inputValue, "text/html").body.textContent || ""
        : "";
    const markupHelp = lockMarkup ? (
        <>
            {__("This text has formatting. Edit it in the block to keep the formatting.", "essential-blocks")}{" "}
            <button
                type="button"
                className="components-button is-link"
                onClick={() => setMarkupUnlocked(true)}
            >
                {__("Edit as HTML", "essential-blocks")}
            </button>
        </>
    ) : help;
    const isLocked = readOnly || lockMarkup;
    // Lock only text that opened with formatting: once the author edits the
    // field as plain text, typing markup (e.g. "<b>") must not lock it
    // mid-typing (#676).
    const lastOwnValue = useRef(null);
    const handleTextChange = (text) => {
        if (isLocked) {
            return false;
        }
        if (!markupUnlocked) {
            setMarkupUnlocked(true);
        }
        lastOwnValue.current = text;
        return onChange(text);
    };
    // Formatting added from somewhere else (the canvas toolbar) while the
    // field is unlocked: lock it again, as if it had opened that way.
    useEffect(() => {
        if (
            markupUnlocked &&
            typeof inputValue === "string" &&
            inputValue !== lastOwnValue.current &&
            /<\/?[a-z][^>]*>/i.test(inputValue)
        ) {
            setMarkupUnlocked(false);
        }
    }, [inputValue]);
    const shownValue = readOnly ? fieldPlaceholder : lockMarkup ? markupAsText : inputValue;

    return (
        <div className="eb-dynamic-input-control">
            {!isImageField && !isTextarea && (
                <>
                    <EBTextControl
                        label={__(label, "essential-blocks")}
                        value={shownValue}
                        attrName={attrName}
                        placeholder={placeholder || ""}
                        onChange={handleTextChange}
                        onBlur={(e) => (lockMarkup ? null : onBlur(e.target.value))}
                        readOnly={isLocked}
                        help={markupHelp}
                        enableAi={enableAi && !lockMarkup}
                        fieldType={fieldType}
                        showValidation={showValidation}
                        enableSecurity={enableSecurity}
                    />
                </>
            )}
            {!isImageField && isTextarea && (
                <>
                    <EBTextareaControl
                        label={__(label, "essential-blocks")}
                        placeholder={placeholder || ""}
                        value={shownValue}
                        onChange={handleTextChange}
                        readOnly={isLocked}
                        help={markupHelp}
                        enableAi={enableAi && !lockMarkup}
                    />
                </>
            )}
            {applyFilters("essential_blocks_dynamic_input_control", "", fieldValue, setFieldValue, inputValue, type)}
        </div>
    );
}
