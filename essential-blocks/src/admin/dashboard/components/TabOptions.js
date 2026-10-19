/**
 * WordPress dependencies
 */
import { useEffect, useRef, useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
/**
 * Internal dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { EB_LINKS } from "../../../controls/src/helpers/ebLinks";

import EBLoader from './Loader';
import Modal from './ui/Modal';
import {
	getTabUrl,
	onTabLinkClick,
	getRouteParams,
	setSectionParam,
} from '../routing';
import { useEbSettings, isSettingOn } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import PageHeader from './ui/PageHeader';
import Toggle from './ui/Toggle';
import Button from './ui/Button';
import { Section } from './ui/Page';
import SectionNav from './ui/SectionNav';
import LoadErrorState from './ui/LoadErrorState';
import BreakpointsSection from './settings/BreakpointsSection';
import { useConfirm } from './ui/ConfirmDialog';
import { regenerateAssets as requestRegenerateAssets } from '../api/actions';

import ResponsiveBreakPoints from './modal/responsiveBreakPoints';

/**
 * Toast for an `eb_regenerate_assets` result.
 *
 * @param {Object} res EbAjaxResult.
 * @return {Object} Toast props.
 */
const regenerateToast = ( res ) => {
	if ( res.ok ) {
		return { message: __( 'Assets regenerated', 'essential-blocks' ) };
	}
	if ( res.code === 'nonce' ) {
		return {
			type: 'error',
			message: __(
				"Couldn't regenerate assets: your session has expired. Reload the page and try again.",
				'essential-blocks'
			),
		};
	}
	if ( res.code === 'network' ) {
		return {
			type: 'error',
			message: __(
				"Couldn't regenerate assets. Check your connection and try again.",
				'essential-blocks'
			),
		};
	}
	if ( res.code === 'server' ) {
		const msg =
			( typeof res.data?.messsage === 'string' && res.data.messsage ) ||
			( typeof res.data?.message === 'string' && res.data.message ) ||
			res.error;
		if ( msg ) {
			return {
				type: 'error',
				message: sprintf(
					/* translators: %s: server error message. */
					__( "Couldn't regenerate assets: %s", 'essential-blocks' ),
					msg
				),
			};
		}
	}
	return {
		type: 'error',
		message: __(
			"Couldn't regenerate assets. Please try again.",
			'essential-blocks'
		),
	};
};

/**
 * Settings tab (id "options").
 *
 * @return {JSX.Element} Settings screen.
 */
export default function TabOptions() {
	const [ responsiveModal, setResponsiveModal ] = useState( false );
	// eb_settings comes from the shared, cached SettingsProvider. Modals (free
	// and Pro) still receive settingsData / setSettingsData( fullObject ).
	const {
		settings: settingsData,
		loading,
		status,
		retry,
		setLocal,
		setSetting,
	} = useEbSettings();
	const setSettingsData = ( next ) => setLocal( next ?? {}, { replace: true } );
	const { show } = useToast();
	// Legacy overlay state (EBLoader stays mounted; nothing triggers it now).
	const [ loaderData ] = useState( {
		loading: false,
		response: false,
		message: '',
	} );

	const optimizations = {
		googleFont: {
			logo: `${ EssentialBlocksLocalize.image_url }/admin/logo-google-font.png`,
			title: 'Google Fonts',
			description: __(
				'Enable Google Fonts to get access to 1400+ exclusive fonts for all the fully customizable blocks of Essential Blocks.',
				'essential-blocks'
			),
			doc: EB_LINKS.docs.googleFonts,
			default: true,
		},
		enableFontawesome: {
			logo: `${ EssentialBlocksLocalize.image_url }/admin/logo-fontawesome.png`,
			title: 'Font Awesome',
			description: __(
				'Enable Font Awesome to get access to 2,000+ exclusive icon library and toolkit for all the fully customizable blocks of Essential Blocks.',
				'essential-blocks'
			),
			default: true,
		},
	};



	const settings = applyFilters( 'eb_admin_option_settings', {
		unfilteredFile: {
			logo: `${ EssentialBlocksLocalize.image_url }/admin/unfiltered-file-icon.svg`,
			title: __( 'Unfiltered File Uploads', 'essential-blocks' ),
			description: sprintf(
				/* translators: %s: bold "Note:" label. */
				__(
					'%s Uploading unfiltered files (SVG & JSON) can pose security risks. Essential Blocks will attempt to sanitize these files to remove potentially harmful code. Enable this option only if you understand the associated risks.',
					'essential-blocks'
				),
				`<strong>${ __( 'Note:', 'essential-blocks' ) }</strong>`
			),
			doc: EB_LINKS.docs.unfilteredUploads,
			default: false,
		},
		enablePatterns: {
			logo: `${ EssentialBlocksLocalize.image_url }/admin/pattern-icon.svg`,
			title: __( 'Block Patterns', 'essential-blocks' ),
			description: __(
				"Enable or disable Essential Blocks patterns in the WordPress block editor. When enabled, you'll have access to pre-designed block patterns and templates for faster website building.",
				'essential-blocks'
			),
			doc: EB_LINKS.docs.blockPatterns,
			default: true,
		},
	} );

	/**
	 * Open the configuration modal of an integration.
	 *
	 * @param {string} item       Setting key.
	 * @param {Object} clickedObj Integrations map holding the modal component.
	 */

	const handelResponsiveBreakPoints = () => {
		setResponsiveModal( true );
	};

	/**
	 * Toggle an eb_settings flag (optimistic, reverts on failure).
	 *
	 * @param {string}  item  Setting key.
	 * @param {boolean} value New value.
	 * @param {string}  title Setting name for the notification.
	 */
	const handleOptimizationSwitch = ( item, value, title ) => {
		setSetting( item, value ).then( ( ok ) =>
			show(
				ok
					? {
							message: value
								? /* translators: %s: setting name. */
								  sprintf( __( '%s enabled', 'essential-blocks' ), title )
								: /* translators: %s: setting name. */
								  sprintf( __( '%s disabled', 'essential-blocks' ), title ),
					  }
					: {
							type: 'error',
							message: __( "Couldn't save the setting. Please try again.", 'essential-blocks' ),
					  }
			)
		);
	};



	// Guards against a second click while the request is running.
	const regenerating = useRef( false );
	const [ regenBusy, setRegenBusy ] = useState( false );
	const [ regenStatus, setRegenStatus ] = useState( '' );
	const confirm = useConfirm();

	// Enabling unfiltered uploads is a security trade-off: confirm first.
	// Checked by key, after eb_admin_option_settings ran, so a filtered
	// title/description still gets the confirmation.
	const requestToggle = async ( item, checked, config ) => {
		if ( item === 'unfilteredFile' && checked ) {
			const ok = await confirm( {
				title: __( 'Allow unfiltered file uploads?', 'essential-blocks' ),
				message: String( config?.description || '' ).replace( /<[^>]*>/g, '' ),
				confirmLabel: __( 'Enable', 'essential-blocks' ),
				tone: 'danger',
			} );
			if ( ! ok ) {
				return;
			}
		}
		handleOptimizationSwitch( item, checked, config?.title );
	};

	const regenerateAssets = async () => {
		if ( regenerating.current ) {
			return;
		}
		const ok = await confirm( {
			title: __( 'Regenerate assets?', 'essential-blocks' ),
			message: __(
				'This deletes the generated CSS and JS files in your Uploads folder. They are rebuilt the next time each page loads, so the first visit may be slower.',
				'essential-blocks'
			),
			confirmLabel: __( 'Regenerate', 'essential-blocks' ),
		} );
		if ( ! ok || regenerating.current ) {
			return;
		}
		regenerating.current = true;
		setRegenBusy( true );
		setRegenStatus( __( 'Regenerating assets…', 'essential-blocks' ) );
		let toast;
		try {
			toast = regenerateToast( await requestRegenerateAssets() );
		} catch ( e ) {
			toast = {
				type: 'error',
				message: __( "Couldn't regenerate assets. Please try again.", 'essential-blocks' ),
			};
		} finally {
			regenerating.current = false;
			setRegenBusy( false );
		}
		show( toast );
		setRegenStatus( toast.message );
	};

	const isOn = ( item, defaultValue ) =>
		isSettingOn( settingsData, item, !! defaultValue );

	const renderToggleCard = ( item, config, { html = false } = {} ) => {
		const titleId = `eb-setting-${ item }`;
		return (
			<div className="eb-card eb-setting-card" key={ item }>
				<div className="eb-setting-card__header">
					<span className="eb-setting-card__icon">
						<img src={ config.logo } alt="" width="28" height="28" />
					</span>
					<Toggle
						checked={ isOn( item, config.default ) }
						disabled={ loading }
						onChange={ ( checked ) =>
							requestToggle( item, checked, config )
						}
						labelledBy={ titleId }
					/>
				</div>
				<h3 className="eb-setting-card__title" id={ titleId }>
					{ config.title }
				</h3>
				{ html ? (
					<p
						className="eb-setting-card__text"
						dangerouslySetInnerHTML={ { __html: config.description } }
					/>
				) : (
					<p className="eb-setting-card__text">{ config.description }</p>
				) }
				{ config.doc && (
					<a
						target="_blank"
						href={ config.doc }
						className="eb-setting-card__link"
						rel="noopener noreferrer"
					>
						{ __( 'Documentation', 'essential-blocks' ) }
					</a>
				) }
			</div>
		);
	};

	// Settings sections (in-page navigation, deep-linkable with &section=).
	const sections = [
		{ id: 'general', label: __( 'General', 'essential-blocks' ) },
		{ id: 'performance', label: __( 'Optimization Options', 'essential-blocks' ) },
		{ id: 'breakpoints', label: __( 'Responsive Breakpoints', 'essential-blocks' ) },
		{ id: 'advanced', label: __( 'Advanced', 'essential-blocks' ) },
	];
	const sectionIds = sections.map( ( section ) => section.id );
	const [ currentSection, setCurrentSection ] = useState( () => {
		const fromUrl = getRouteParams().section;
		return sectionIds.includes( fromUrl ) ? fromUrl : 'general';
	} );

	const goToSection = ( id, { updateUrl = true } = {} ) => {
		setCurrentSection( id );
		if ( updateUrl ) {
			setSectionParam( id );
		}
		const el = document.getElementById( `eb-settings-${ id }` );
		if ( ! el ) {
			return;
		}
		const reduce =
			window.matchMedia &&
			window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
		el.scrollIntoView( { behavior: reduce ? 'auto' : 'smooth', block: 'start' } );
		document.getElementById( `eb-settings-${ id }-title` )?.focus( { preventScroll: true } );
	};

	// Deep link (&section=) on mount: scroll + focus once the tab rendered.
	useEffect( () => {
		const fromUrl = getRouteParams().section;
		if ( sectionIds.includes( fromUrl ) ) {
			window.requestAnimationFrame( () => goToSection( fromUrl, { updateUrl: false } ) );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	// eb_admin_option_settings runs once with its usual defaults; the result
	// is split after filtering: unfilteredFile → Advanced, the rest → General.
	const generalSettings = Object.keys( settings ).filter(
		( item ) => item !== 'unfilteredFile'
	);
	const advancedSettings = Object.keys( settings ).filter(
		( item ) => item === 'unfilteredFile'
	);

	return (
		<>
			<EBLoader settings={ loaderData } />

			<PageHeader
				title={ __( 'Settings', 'essential-blocks' ) }
				description={ __(
					'Connect services, control what Essential Blocks loads, and manage site-wide options.',
					'essential-blocks'
				) }
			/>

			{ /* A failed fetch must not look like a fresh install (defaults). */ }
			{ status === 'error' ? (
				<LoadErrorState onRetry={ retry } />
			) : (
			<div className="eb-settings-layout">
				<SectionNav
					className="eb-settings-layout__nav"
					label={ __( 'Settings sections', 'essential-blocks' ) }
					current={ currentSection }
					items={ sections.map( ( section ) => ( {
						...section,
						href: getTabUrl( 'options', { section: section.id } ),
					} ) ) }
					onSelect={ ( id ) => goToSection( id ) }
				/>
				<div className="eb-settings-layout__sections">
					<Section id="eb-settings-general" title={ __( 'General', 'essential-blocks' ) }>
						{ /* Extensions (incl. Quick Toolbar and the eb_admin_option_extensions
						   filter) live on the Extensions tab: deep-link to the card. */ }
						<p className="eb-moved-notice">
							<span id="eb-moved-notice-text">
								{ __(
									'Extensions such as Quick Action Toolbar have moved to their own tab.',
									'essential-blocks'
								) }
							</span>{ ' ' }
							<a
								href={ getTabUrl( 'extensions', { focus: 'eb-ext-quickToolbar' } ) }
								onClick={ onTabLinkClick( 'extensions', { focus: 'eb-ext-quickToolbar' } ) }
								aria-describedby="eb-moved-notice-text"
							>
								{ __( 'Open Extensions', 'essential-blocks' ) }
							</a>
						</p>
						<p className="eb-moved-notice">
							<span id="eb-moved-keys-text">
								{ __(
									'API keys for Google Maps, Instagram, Facebook, OpenSea and Openverse are now in Integrations.',
									'essential-blocks'
								) }
							</span>{ ' ' }
							<a
								href={ getTabUrl( 'integrations', { section: 'connected' } ) }
								onClick={ onTabLinkClick( 'integrations', { section: 'connected' } ) }
								aria-describedby="eb-moved-keys-text"
							>
								{ __( 'Open Connected services', 'essential-blocks' ) }
							</a>
						</p>
						<div className="eb-card-grid">
							{ generalSettings.map( ( item ) =>
								renderToggleCard( item, settings[ item ], { html: true } )
							) }
						</div>
					</Section>

					<Section
						id="eb-settings-performance"
						title={ __( 'Optimization Options', 'essential-blocks' ) }
					>
						<div className="eb-card-grid">
							{ Object.keys( optimizations ).map( ( item ) =>
								renderToggleCard( item, optimizations[ item ] )
							) }
						</div>
						<div className="eb-setting-rows">
							<div className="eb-card eb-setting-row">
								<div>
									<h3 className="eb-setting-card__title">
										{ __( 'Asset Regeneration', 'essential-blocks' ) }
									</h3>
									<p className="eb-setting-card__text">
										{ __(
											'Essential Blocks styles & scripts are saved in Uploads folder. This option will clear all those generated files.',
											'essential-blocks'
										) }
									</p>
								</div>
								<Button
									variant="secondary"
									loading={ regenBusy }
									disabled={ regenBusy }
									onClick={ regenerateAssets }
								>
									{ regenBusy
										? __( 'Regenerating…', 'essential-blocks' )
										: __( 'Regenerate Assets', 'essential-blocks' ) }
								</Button>
								<span className="eb-visually-hidden" role="status">
									{ regenStatus }
								</span>
							</div>

						</div>
					</Section>

					<Section
						id="eb-settings-breakpoints"
						title={ __( 'Responsive Breakpoints', 'essential-blocks' ) }
					>
						<p className="eb-section__description eb-breakpoints__intro">
							{ __(
								'Adjust the “Responsive Breakpoint” settings to define the screen widths at which your site will adapt for optimal viewing on tablets and mobile devices.',
								'essential-blocks'
							) }
						</p>
						<BreakpointsSection />
						{ /* fallback until review (plan T35) */ }
						<Button variant="link" onClick={ handelResponsiveBreakPoints }>
							{ __( 'Configure Breakpoints', 'essential-blocks' ) }
						</Button>
					</Section>

					<Section id="eb-settings-advanced" title={ __( 'Advanced', 'essential-blocks' ) }>
						<div className="eb-card-grid">
							{ advancedSettings.map( ( item ) =>
								renderToggleCard( item, settings[ item ], { html: true } )
							) }
						</div>
					</Section>
				</div>
			</div>
			) }


			{ responsiveModal && (
				<Modal
					title={ __( 'Responsive Breakpoints', 'essential-blocks' ) }
					onClose={ () => setResponsiveModal( false ) }
					className="option-modal-compat"
				>
					<ResponsiveBreakPoints
						setTrigger={ setResponsiveModal }
						settingsData={ settingsData }
						setSettingsData={ setSettingsData }
					/>
				</Modal>
			) }
		</>
	);
}
