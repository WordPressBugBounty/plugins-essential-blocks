/**
 * WordPress Core Dependencies
*/
import { __ } from "@wordpress/i18n";
import {
	PanelBody,
	ToggleControl,
	TextControl,
	RadioControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import {
	useEffect,
	useState
} from "@wordpress/element";

/**
 * Internal Dependencies
*/
import { TEXT_ALIGN } from './constants';
import {
	getNumberOfPosts
} from './apiData';

export default function MorePosts(props) {
	const { loadMoreOptions, queryData, setAttributes, initialOpen } = props;
	const [options, setOptions] = useState({});
	const [didMount, setDidMount] = useState(false);

	useEffect(() => {
		setDidMount(true);

		//If Exixsting query data exists in Attributes, set existing data to current options data
		if (typeof (loadMoreOptions) != 'undefined' && Object.keys(loadMoreOptions).length > 0) {
			setOptions({
				...loadMoreOptions,
				prevTxt: loadMoreOptions.prevTxt || "<",
				nextTxt: loadMoreOptions.nextTxt || ">"
			})
		}
		else {
			setOptions({
				enableMorePosts: false,
				loadMoreType: '1',
				loadMoreButtonTxt: 'Load More',
				alignment: 'center',
				prevTxt: "<",
				nextTxt: ">",
			})
		}
	}, [])

	useEffect(() => {
		setAttributes({ loadMoreOptions: options })
	}, [options])

	useEffect(() => {
		if (typeof (queryData) != 'undefined' && Object.keys(queryData).length > 0) {
			const query = { ...queryData, per_page: '' }
			getNumberOfPosts(query)
				.then((result) => {
					setOptions({ ...loadMoreOptions, totalPosts: result });
				})
		}

	}, [queryData])

	return (
		<PanelBody title={__("Load More Settings", "essential-blocks")} initialOpen={initialOpen}>
			{didMount && (
				<>
					<ToggleControl
						label={__("Enable Load More Option?", "essential-blocks")}
						checked={options.enableMorePosts}
						onChange={() =>
							setOptions({ ...options, enableMorePosts: !options.enableMorePosts })
						}
						__nextHasNoMarginBottom
					/>
					{options.enableMorePosts && (
						<>
							<RadioControl
								label="More Posts Type?"
								// help="The type of the current user"
								selected={options.loadMoreType}
								options={[
									{ label: 'Button', value: '1' },
									{ label: 'Pagination', value: '2' },
									{ label: 'Prev-Next', value: '3' },
								]}
								onChange={(value) => setOptions({ ...options, loadMoreType: value })}
							/>
							{options.loadMoreType === '1' && (
								<>
									<TextControl
										label={__("Button Text", "essential-blocks")}
										value={options.loadMoreButtonTxt}
										onChange={(text) => setOptions({ ...options, loadMoreButtonTxt: text })}
										__next40pxDefaultSize
										__nextHasNoMarginBottom
									/>
								</>
							)}
							{(options.loadMoreType === '2' || options.loadMoreType === '3') && (
								<>
									<TextControl
										label={__("Previous Button Text", "essential-blocks")}
										value={options.prevTxt}
										onChange={(text) => setOptions({ ...options, prevTxt: text })}
										__next40pxDefaultSize
										__nextHasNoMarginBottom
									/>
									<TextControl
										label={__("Next Button Text", "essential-blocks")}
										value={options.nextTxt}
										onChange={(text) => setOptions({ ...options, nextTxt: text })}
										__next40pxDefaultSize
										__nextHasNoMarginBottom
									/>
								</>
							)}

							<ToggleGroupControl
								label={__("Alignment", "essential-blocks")}

								value={options.alignment}
								onChange={(newValue) =>
									setOptions({ ...options, alignment: newValue })
								}
								isBlock
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							>
								{TEXT_ALIGN.map((item, index) => (
									<ToggleGroupControlOption
										key={index}
										value={item.value}
										label={item.label}
									/>
								))}
							</ToggleGroupControl>
						</>
					)}
				</>
			)}
		</PanelBody>
	)
}