/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { BaseControl } from "@wordpress/components";
import { withInstanceId } from "@wordpress/compose";
import { useState, useEffect } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";

/**
 * External Dependencies
 */
import Select2 from "react-select";

/**
 * Internal dependencies
 */
import { googleFonts } from "./googleFonts";
import { loadGoogleFontEditor } from "../../../helpers";

function FontFamilyPicker({
    label,
    value,
    help,
    instanceId,
    onChange,
    className,
    ...props
}) {
    const id = `inspector-eb-font-family-${instanceId}`;

    const [fonts, setFonts] = useState([])
    const [themeFonts, setThemeFonts] = useState([])

    useEffect(() => {
        //Fetch Theme fonts
        const fetchDataAndSetData = async () => {
            const data = await apiFetch({ path: '/wp/v2/font-families' });
            if (data.length > 0) {
                const fonts = []
                data.map((item) => {
                    if (item.font_family_settings && item.font_family_settings.name && item.font_family_settings.slug) {
                        fonts.push({
                            label: item.font_family_settings.name,
                            value: item.font_family_settings.slug,
                        })
                    }
                })
                setThemeFonts(fonts)
            }
        };
        fetchDataAndSetData();
    }, []);

    useEffect(() => {
        const allFonts = [
            // { value: "", label: __("Default", "essential-blocks") },
            // { value: "Arial", label: "Arial" },
            // { value: "Helvetica", label: "Helvetica" },
            // { value: "Times-New-Roman", label: "Times New Roman" },
            // { value: "Georgia", label: "Georgia" },
        ];
        //Add Google Fonts
        Object.keys(googleFonts).map((font) => {
            allFonts.push({ value: font, label: googleFonts[font].family });
        });

        if (themeFonts.length > 0) {
            setFonts([
                {
                    label: "Theme Fonts",
                    options: [
                        { value: "", label: __("Default", "essential-blocks") },
                        ...themeFonts
                    ]
                },
                {
                    label: "Google Fonts",
                    options: allFonts
                }
            ])
        }
        else {
            setFonts([
                { value: "", label: __("Default", "essential-blocks") },
                ...allFonts
            ])
        }
    }, [themeFonts]);

    const onChangeValue = (select) => {
        let selectedFont = select.label;
        const fontVariations = ":100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic";
        loadGoogleFontEditor([selectedFont + fontVariations])
        onChange(selectedFont);
    };

    return (
        <BaseControl label={label} id={id} help={help} className={className} __nextHasNoMarginBottom>
            <Select2
                name="eb-select-font"
                defaultValue={{
                    value: (value || "").replace(/\s+/g, "-"),
                    label: value,
                }}
                onChange={onChangeValue}
                options={fonts}
                isDisabled={
                    EssentialBlocksLocalize?.googleFont === "false"
                        ? true
                        : false
                }
            />
        </BaseControl>
    );
}

export default withInstanceId(FontFamilyPicker);
