/**
 * Connected services: API-key cards and their configure modals (Google
 * Maps, Instagram, Facebook, OpenSea, Openverse, plus anything added via
 * `eb_admin_option_integrations`, e.g. Pro's reCAPTCHA and Mailchimp).
 *
 * Moved from the Settings tab unchanged: same filter (applied at render),
 * same item shape {logo, title, description, doc, component}, same modal
 * props {setTrigger, settingsKey, settingsData, setSettingsData(full)}.
 */

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { EB_LINKS } from "../../../../controls/src/helpers/ebLinks";
import { useRef, useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useEbSettings } from '../../context/SettingsContext';
import Facebook from '../modal/facebook';
import GoogleMaps from '../modal/googleMaps';
import Instagram from '../modal/instagram';
import OpenseaNft from '../modal/openseaNft';
import Openverse from '../modal/openverse';

/**
 * The 5 free services, in their historical order.
 *
 * @return {Object} Services keyed by eb_settings key.
 */
export const getDefaultConnectedServices = () => ( {
	facebookToken: {
		// Stopgap SVG — design to ship logo-facebook.png matching the other integration logos.
		logo: `${ EssentialBlocksLocalize.image_url }/admin/logo-facebook.svg`,
		title: __( 'Facebook', 'essential-blocks' ),
		description: __(
			'To showcase your Facebook Page feed on your website, add a Page Access Token and Page ID.',
			'essential-blocks'
		),
		doc: EB_LINKS.docs.facebookToken,
		component: Facebook,
	},
	googleMapApi: {
		logo: `${ EssentialBlocksLocalize.image_url }/admin/logo-google-map.png`,
		title: __( 'Google Maps', 'essential-blocks' ),
		description: __(
			'You have to retrieve API key to use Google Maps from Essential Blocks.',
			'essential-blocks'
		),
		doc: EB_LINKS.docs.googleMapsApi,
		component: GoogleMaps,
	},
	instagramToken: {
		logo: `${ EssentialBlocksLocalize.image_url }/admin/logo-instagram.png`,
		title: __( 'Instagram', 'essential-blocks' ),
		description: __(
			'To showcase your Instagram feed on your website, collect Instagram access tokens.',
			'essential-blocks'
		),
		doc: EB_LINKS.docs.instagramToken,
		component: Instagram,
	},
	openseaApi: {
		logo: `${ EssentialBlocksLocalize.image_url }/admin/logo-opensea.png`,
		title: 'Opensea NFT',
		description: __(
			'To display your OpenSea NFT items, collections, wallets, etc. connect the API key here.',
			'essential-blocks'
		),
		doc: EB_LINKS.docs.openseaApi,
		component: OpenseaNft,
	},
	openverseApi: {
		logo: `${ EssentialBlocksLocalize.image_url }/admin/logo-openverse.png`,
		title: 'Openverse',
		description: __(
			'To get unlimited access to Openverse images, provide your email & project name to generate API keys.',
			'essential-blocks'
		),
		doc: EB_LINKS.docs.openverseApi,
		component: Openverse,
	},
} );

/**
 * @return {JSX.Element} Service cards + configure modal.
 */
export default function ConnectedServices() {
	const { settings: settingsData, loading, setLocal } = useEbSettings();
	const setSettingsData = ( next ) => setLocal( next ?? {}, { replace: true } );

	// Filter applied at render, so Pro (loaded after this bundle) is included.
	const services = applyFilters(
		'eb_admin_option_integrations',
		getDefaultConnectedServices()
	);

	const [ open, setOpen ] = useState( false );
	const [ activeKey, setActiveKey ] = useState( '' );
	// Keep the item object: Pro components stay usable even if the filter
	// output changes between renders.
	const [ activeItem, setActiveItem ] = useState( null );
	const opener = useRef( null );

	const openModal = ( key, event ) => {
		opener.current = event?.currentTarget || null;
		setActiveKey( key );
		setActiveItem( services[ key ] );
		setOpen( true );
	};

	// setTrigger( false ) from a modal closes it; focus returns to the
	// Configure button that opened it.
	const setTrigger = ( value ) => {
		setOpen( !! value );
		if ( ! value ) {
			window.requestAnimationFrame( () => opener.current?.focus() );
		}
	};

	const ActiveComponent = activeItem?.component;

	return (
		<>
			<div className="eb-card-grid">
				{ Object.keys( services ).map( ( item ) => {
					const integration = services[ item ];
					const connected = !! settingsData?.[ item ];
					let status;
					if ( loading ) {
						status = (
							<span className="eb-setting-card__status">
								{ __( 'Checking…', 'essential-blocks' ) }
							</span>
						);
					} else if ( connected ) {
						status = (
							<Badge tone="active">{ __( 'Connected', 'essential-blocks' ) }</Badge>
						);
					} else {
						status = (
							<span className="eb-setting-card__status">
								{ __( 'Not connected', 'essential-blocks' ) }
							</span>
						);
					}
					return (
						<div className="eb-card eb-setting-card" key={ item }>
							<div className="eb-setting-card__header">
								<span className="eb-setting-card__icon">
									<img src={ integration.logo } alt="" width="28" height="28" />
								</span>
								{ status }
							</div>
							<h3 className="eb-setting-card__title">{ integration.title }</h3>
							<p className="eb-setting-card__text">{ integration.description }</p>
							<div className="eb-setting-card__footer">
								{ integration.doc ? (
									<a
										target="_blank"
										href={ integration.doc }
										className="eb-setting-card__link"
										rel="noopener noreferrer"
									>
										{ __( 'API Documentation', 'essential-blocks' ) }
									</a>
								) : (
									<span />
								) }
								{ integration.component && (
									<Button
										variant="secondary"
										size="sm"
										onClick={ ( event ) => openModal( item, event ) }
										aria-label={ sprintf(
											/* translators: %s: integration name. */
											__( 'Configure %s', 'essential-blocks' ),
											integration.title
										) }
									>
										{ __( 'Configure', 'essential-blocks' ) }
									</Button>
								) }
							</div>
						</div>
					);
				} ) }
			</div>

			{ open && ActiveComponent && (
				<Modal
					title={ activeItem?.title }
					onClose={ () => setTrigger( false ) }
					className="option-modal-compat"
				>
					<ActiveComponent
						setTrigger={ setTrigger }
						settingsKey={ activeKey }
						settingsData={ settingsData }
						setSettingsData={ setSettingsData }
					/>
				</Modal>
			) }
		</>
	);
}
