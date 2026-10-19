/**
 * Internal dependencies
 */
import { FONTS } from "./constants";
import { getEditorDocument, injectEditorStylesheet } from "../../helpers/iframe-utils";

/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import { withInstanceId } from "@wordpress/compose";
import { BaseControl } from "@wordpress/components";

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
	const fonts = [
		{ value: "", label: __("Default", "essential-blocks") },
		{ value: "Arial", label: "Arial" },
		{ value: "Helvetica", label: "Helvetica" },
		{ value: "Times New Roman", label: "Times New Roman" },
		{ value: "Georgia", label: "Georgia" },
	];

	//Add Google Fonts
	Object.keys(FONTS).map((k) => {
		fonts.push({ value: k, label: k });
	});

	const onChangeValue = (event) => {
		const meta = wp.data
			.select("core/editor")
			.getEditedPostAttribute("meta");
		let ba = "";
		const googleFontsAttr =
			":100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic";

		if (
			typeof meta !== "undefined" &&
			typeof meta._eb_attr !== "undefined"
		) {
			ba = meta._eb_attr;
		}

		const fontHref =
			"https://fonts.googleapis.com/css?family=" +
			event.target.value.replace(/ /g, "+") +
			googleFontsAttr;
		const fontId = `eb-gfont-${event.target.value.replace(/\s+/g, '-').toLowerCase()}`;

		if (ba.length > 0) {
			//Load fonts on the header (both parent and iframe)
			if (!ba.includes(event.target.value)) {
				injectEditorStylesheet(fontHref, fontId);
				// Also inject in parent document for inspector previews
				const parentLink = document.createElement("link");
				parentLink.rel = "stylesheet";
				parentLink.href = fontHref;
				parentLink.id = fontId + "-parent";
				if (!document.getElementById(fontId + "-parent")) {
					document.head.appendChild(parentLink);
				}
			}

			ba = ba.replace("," + event.target.value, "");
			ba = ba + "," + event.target.value;
		} else {
			injectEditorStylesheet(fontHref, fontId);
			// Also inject in parent document
			const parentLink = document.createElement("link");
			parentLink.rel = "stylesheet";
			parentLink.href = fontHref;
			parentLink.id = fontId + "-parent";
			if (!document.getElementById(fontId + "-parent")) {
				document.head.appendChild(parentLink);
			}

			ba = event.target.value;
		}

		//Save values to metadata
		wp.data.dispatch("core/editor").editPost({
			meta: {
				_eb_attr: ba,
			},
		});

		onChange(event.target.value);
	};

	return (
		<BaseControl label={label} id={id} help={help} className={className} __nextHasNoMarginBottom>
			<select
				id={id}
				className="components-select-control__input"
				onChange={onChangeValue}
				aria-describedby={!!help ? `${id}__help` : undefined}
				{...props}>
				{fonts.map((option, index) => (
					<option
						key={`${option.label}-${option.value}-${index}`}
						value={option.value}
						selected={value === option.value ? "selected" : ""}>
						{option.label}
					</option>
				))}
			</select>
		</BaseControl>
	);
}

export default withInstanceId(FontFamilyPicker);
