/**
 * WordPress dependencies
 */
import { useEffect, useState, useRef } from "@wordpress/element";
import { doAction, applyFilters } from "@wordpress/hooks";
import { useSelect, useRegistry } from '@wordpress/data';
import { useBlockEditContext } from "@wordpress/block-editor";

import { softMinifyCssStrings } from "../helpers/miniHelperFuncs"
import { queueGeneratedStyles, hasQueuedGeneratedStyles } from "./generatedStylesSync";

/**
 * Sanitize CSS strings by removing any literal 'undefined' values
 * that can leak through when block attributes are unresolved during save.
 */
const sanitizeCssUndefined = (cssString) => {
    if (!cssString || typeof cssString !== 'string') return '';
    return cssString.replace(/undefined/g, '');
};

export const StyleComponent = (props) => {
    const {
        attributes,
        setAttributes,
        desktopAllStyles,
        tabAllStyles,
        mobileAllStyles,
        editorDesktopStyles,
        editorTabStyles,
        editorMobileStyles,
        blockName,
        ...otherProps
    } = props;

    const {
        blockMeta,
    } = attributes

    const [styleObject, setStyleObject] = useState();
    const [didMount, setDidMount] = useState(false);
    const registry = useRegistry();
    const { clientId } = useBlockEditContext();
    // The first blockMeta sync after mount is batched across blocks.
    const isMountSync = useRef(true);

    // Set All Style in "styleObject"
    useEffect(() => {
        const styles = {
            desktop: desktopAllStyles,
            tab: tabAllStyles,
            mobile: mobileAllStyles,
            editorDesktop: editorDesktopStyles,
            editorTab: editorTabStyles,
            editorMobile: editorMobileStyles
        }
        setStyleObject(applyFilters(`eb-style-object_${blockName.replace(/\//g, '_')}`, styles, attributes, setAttributes))
        setDidMount(true)
    }, [
        attributes,
        desktopAllStyles,
        tabAllStyles,
        mobileAllStyles,
        editorDesktopStyles,
        editorTabStyles,
        editorMobileStyles
    ]);

    // Set All Style in "blockMeta" Attribute
    useEffect(() => {
        if (styleObject) {
            const dbStyles = {
                desktop: sanitizeCssUndefined(softMinifyCssStrings(styleObject.desktop)),
                tab: sanitizeCssUndefined(softMinifyCssStrings(styleObject.tab)),
                mobile: sanitizeCssUndefined(softMinifyCssStrings(styleObject.mobile))
            }
            if (JSON.stringify(blockMeta) !== JSON.stringify(dbStyles)) {
                if (isMountSync.current || hasQueuedGeneratedStyles(registry, clientId)) {
                    queueGeneratedStyles(registry, clientId, { blockMeta: dbStyles }, setAttributes);
                } else {
                    setAttributes({ blockMeta: dbStyles });
                }
            }
            isMountSync.current = false;
        }
    }, [styleObject])

    return (
        <style>
            {didMount && `
				${softMinifyCssStrings(styleObject.editorDesktop ? styleObject.editorDesktop : styleObject.desktop)}

				@media all and (max-width: ${EssentialBlocksLocalize?.responsiveBreakpoints?.tablet}px) {
					/* tabcssStart */
					${softMinifyCssStrings(styleObject.editorTab ? styleObject.editorTab : styleObject.tab)}
					/* tabcssEnd */
				}

				@media all and (max-width: ${EssentialBlocksLocalize?.responsiveBreakpoints?.mobile}px) {
					/* mobcssStart */
					${softMinifyCssStrings(styleObject.editorMobile ? styleObject.editorMobile : styleObject.mobile)}
					/* mobcssEnd */
				}
			`}
        </style>
    )
}
