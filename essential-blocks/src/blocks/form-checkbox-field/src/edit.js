/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { useEffect, memo } from "@wordpress/element";
import { select, dispatch, useSelect } from "@wordpress/data";
/**
 * Internal dependencies
 */
import {
    DynamicInputValueHandler,
    DynamicFormFieldValueHandler,
    BlockProps,
    withBlockContext,
    filterBlocksByName,
    getBlockParentClientId,
} from "@essential-blocks/controls";
import Inspector from "./inspector";
import Style from "./style";
import defaultAttributes from './attributes'

const Edit = (props) => {
    const {
        attributes,
        setAttributes,
        isSelected,
        clientId,
        name
    } = props;

    const {
        blockId,
        classHook,
        showLabel,
        labelText,
        options,
        fieldName,
        defaultValue,
        isRequired,
        validationRules,
        validationMessage,
        dynamicValue,
        dynamicOptionType,
        dynamicValueLoader
    } = attributes;

    // you must declare this variable
    const enhancedProps = {
        ...props,
        blockPrefix: 'eb-checkbox-field',
        rootClass: `eb-guten-block-main-parent-wrapper eb-form-field`,
        style: <Style {...props} />
    };

    useEffect(() => {
        const parentClientId = getBlockParentClientId(
            clientId,
            "essential-blocks/form"
        );

        const getParentBlock = select("core/block-editor").getBlock(
            parentClientId
        );
        const getParentBlockId = getParentBlock?.attributes?.blockId;
        if (getParentBlockId)
            setAttributes({ parentBlockId: getParentBlockId });

        //Handle as per parent settings
        const isBlockJustInserted = select(
            "core/block-editor"
        ).wasBlockJustInserted(clientId);
        // A pasted or duplicated field is "just inserted" too, but it already
        // carries its saved settings and a blockId; only a brand-new field
        // (no blockId yet) takes the form's defaults (#685).
        const isNewField = isBlockJustInserted && !blockId;
        const getFormLabel = getParentBlock?.attributes?.showLabel;
        const getFormIcon = getParentBlock?.attributes?.showInputIcon;
        if (
            isNewField &&
            typeof getFormLabel !== "undefined" &&
            typeof getFormIcon !== "undefined"
        ) {
            setAttributes({
                showLabel: getFormLabel,
                isIcon: getFormIcon,
            });
        }

        //Hanlde Field Name
        if (isNewField) {
            if (parentClientId) {
                const parentAllChildBlocks = select(
                    "core/block-editor"
                ).getBlocksByClientId(parentClientId);
                const filteredBlocks = filterBlocksByName(
                    parentAllChildBlocks,
                    name
                );
                const currentBlockIndex = filteredBlocks.indexOf(clientId);
                if (currentBlockIndex !== -1) {
                    if (filteredBlocks.length === 1) {
                        setAttributes({ fieldName: `checkbox-field` });
                    } else {
                        setAttributes({
                            fieldName: `checkbox-field-${currentBlockIndex + 1}`,
                            options: [
                                { name: `Option 1`, value: `checkbox_${currentBlockIndex}_1` },
                                { name: `Option 2`, value: `checkbox_${currentBlockIndex}_2` },
                                { name: `Option 3`, value: `checkbox_${currentBlockIndex}_3` },
                            ]
                        });
                    }
                }
            }
        }
        else if (isBlockJustInserted && blockId) {
            // Pasted / duplicated: keep options, labels and defaults; only make
            // the field name unique when a sibling field already uses it.
            const parentId = getBlockParentClientId(clientId, "essential-blocks/form");
            if (parentId && fieldName) {
                const editor = select("core/block-editor");
                const siblings = filterBlocksByName(editor.getBlocksByClientId(parentId), name)
                    .filter((id) => id !== clientId)
                    .map((id) => editor.getBlockAttributes(id)?.fieldName);
                if (siblings.includes(fieldName)) {
                    let n = 2;
                    while (siblings.includes(`${fieldName}-${n}`)) n++;
                    setAttributes({ fieldName: `${fieldName}-${n}` });
                }
            }
        }
    }, []);

    //UseEffect for set Validation rules
    useEffect(() => {
        const rules = {
            [fieldName]: {
                isRequired: {
                    status: isRequired,
                    message: validationMessage,
                },
            },
        };
        setAttributes({ validationRules: rules });
    }, [isRequired, fieldName, validationMessage]);

    return (
        <>
            {isSelected && (
                <Inspector
                    clientId={clientId}
                    attributes={attributes}
                    setAttributes={setAttributes}
                />
            )}
            <BlockProps.Edit {...enhancedProps}>
                <div
                    className={`eb-parent-wrapper eb-parent-${blockId} ${classHook}`}
                >
                    <div
                        className={`${blockId} eb-checkbox-field-wrapper eb-field-wrapper`}
                    >
                        {showLabel && (
                            <>
                                <label
                                    htmlFor={fieldName}
                                    className="eb-field-label"
                                >
                                    <DynamicInputValueHandler
                                        value={labelText}
                                        onChange={(labelText) =>
                                            setAttributes({ labelText })
                                        }
                                        readOnly={true}
                                    />
                                    {" "}
                                    {isRequired && (
                                        <span className="eb-required">*</span>
                                    )}
                                </label>
                            </>
                        )}
                        {/* {options.length > 0 &&
                            options.map((option) => (
                                <div className="eb-checkbox-inputarea">
                                    <label htmlFor={option.value}>
                                        <input
                                            type="checkbox"
                                            id={option.value}
                                            name={fieldName}
                                            value={option.value}
                                            checked={defaultValue === option.value}
                                        />{" "}
                                        {option.name}
                                    </label>
                                </div>
                            ))} */}
                        <DynamicFormFieldValueHandler
                            type="checkbox"
                            fieldName={fieldName}
                            defaultValue={defaultValue}
                            options={options}
                            dynamicValue={dynamicValue}
                            dynamicOptionType={dynamicOptionType}
                            dynamicValueLoader={dynamicValueLoader}
                            setAttributes={setAttributes}
                        />
                        {isRequired && (
                            <>
                                <div
                                    className={`eb-form-validation eb-validate-${fieldName}`}
                                >
                                    <DynamicInputValueHandler
                                        value={validationMessage}
                                        onChange={(validationMessage) =>
                                            setAttributes({ validationMessage })
                                        }
                                        readOnly={true}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </BlockProps.Edit>
        </>
    );
}

export default memo(withBlockContext(defaultAttributes)(Edit))
