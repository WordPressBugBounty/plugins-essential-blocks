/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { ExternalLink } from '@wordpress/components';
import { useState } from '@wordpress/element';
/**
 * Internal dependencies
 */
import useSettingMutation from '../../hooks/useSettingMutation';
import { SecretField, TextField } from '../ui/Field';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const Facebook = ( props ) => {
	const { setTrigger, settingsKey, settingsData, setSettingsData } = props;
	const { saveSetting } = useSettingMutation();
	const [ apikey, setApiKey ] = useState( settingsData[ settingsKey ] );
	// Page ID is a sibling global setting (Instagram-style "connect once").
	const [ pageId, setPageId ] = useState( settingsData.facebookPageId || '' );
	const [ saveBtnText, setSaveBtnText ] = useState(
		__( 'Save Changes', 'essential-blocks' )
	);
	const [ error, setError ] = useState( '' );
	const [ saving, setSaving ] = useState( false );

	// The two keys are saved one after the other through the shared
	// eb_settings queue: the server saves the whole option on each request,
	// so parallel writes could drop one of them.
	const handleClick = async () => {
		if ( saving ) {
			return;
		}
		setError( '' );
		setSaving( true );
		setSaveBtnText( __( 'Saving…', 'essential-blocks' ) );

		try {
			const first = await saveSetting( settingsKey, apikey ?? '' );
			if ( ! first.ok ) {
				setSaveBtnText( __( 'Save Changes', 'essential-blocks' ) );
				setError(
					__(
						"Couldn't save the access token. Please try again.",
						'essential-blocks'
					)
				);
				return;
			}

			const second = await saveSetting( 'facebookPageId', pageId ?? '' );
			if ( ! second.ok ) {
				// The token did save: keep the cache in line with the server.
				setSettingsData( { ...settingsData, [ settingsKey ]: apikey } );
				setSaveBtnText( __( 'Save Changes', 'essential-blocks' ) );
				setError(
					__(
						"The access token was saved, but the Page ID couldn't be saved. Please try again.",
						'essential-blocks'
					)
				);
				return;
			}

			setSaveBtnText( __( 'Saved', 'essential-blocks' ) );
			setSettingsData( {
				...settingsData,
				[ settingsKey ]: apikey,
				facebookPageId: pageId,
			} );

			setTimeout( () => {
				setTrigger( false );
			}, 300 );
		} catch ( e ) {
			setSaveBtnText( __( 'Save Changes', 'essential-blocks' ) );
			setError(
				__(
					'Something went wrong! Please try again.',
					'essential-blocks'
				)
			);
		} finally {
			setSaving( false );
		}
	};

	return (
		<div className="option-modal-content">
			<h2 className="option-modal__title">
				{ __( 'Connect Facebook Page', 'essential-blocks' ) }
			</h2>
			<p className="option-modal__content">
				{ __(
					'To display posts from your Facebook Page, paste a long-lived Page Access Token and the Page ID below. ',
					'essential-blocks'
				) }
				{ __( 'Follow the ', 'essential-blocks' ) }
				<ExternalLink href="https://developers.facebook.com/docs/pages-api/getting-started">
					{ __(
						'Pages API getting-started guide',
						'essential-blocks'
					) }
				</ExternalLink>
				{ __(
					' to generate a token with the pages_show_list and pages_read_engagement scopes, then paste and save.',
					'essential-blocks'
				) }
			</p>

			<SecretField
				id="eb-fb-token"
				className="eb-modal-field"
				label={ __( 'Page Access Token', 'essential-blocks' ) }
				placeholder={ __(
					'Paste your Facebook Page access token',
					'essential-blocks'
				) }
				value={ apikey && 'undefined' !== apikey ? apikey : '' }
				onChange={ setApiKey }
			/>

			<TextField
				id="eb-fb-page-id"
				className="eb-modal-field"
				label={ __( 'Page ID', 'essential-blocks' ) }
				placeholder={ __(
					'e.g. 1234567890 or your @page-handle',
					'essential-blocks'
				) }
				value={ pageId && 'undefined' !== pageId ? pageId : '' }
				onChange={ setPageId }
			/>

			<Button
				variant="primary"
				onClick={ () => handleClick() }
				loading={ saving }
				disabled={ saving }
			>
				{ saveBtnText }
			</Button>
			{ error && (
				<Alert tone="error" role="alert" className="eb-modal-alert">
					{ error }
				</Alert>
			) }
		</div>
	);
};

export default Facebook;
