/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { useRef, useEffect, useState, useMemo } from '@wordpress/element';
import { seen, unseen } from '@wordpress/icons';
import { hasBlockSupport } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../store';
import { BlockVisibilityModal, useBlockVisibility } from './';

export default function BlockVisibilityViewportToolbar( { clientIds } ) {
	const { isHiddenAnywhere } = useBlockVisibility( {
		clientIds,
	} );
	const hasBlockVisibilityButtonShownRef = useRef( false );
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const blocks = useSelect(
		( select ) =>
			select( blockEditorStore ).getBlockNamesByClientId( clientIds ),
		[ clientIds ]
	);
	const isToolbarButtonEnabled = useMemo(
		() =>
			blocks.every( ( blockName ) =>
				hasBlockSupport( blockName, 'visibility', true )
			),
		[ blocks ]
	);

	/*
	 * If the block visibility button has been shown, we don't want to
	 * remove it from the toolbar until the toolbar is rendered again
	 * without it. Removing it beforehand can cause focus loss issues.
	 * It needs to return focus from whence it came, and to do that,
	 * we need to leave the button in the toolbar.
	 */
	useEffect( () => {
		if ( isHiddenAnywhere ) {
			hasBlockVisibilityButtonShownRef.current = true;
		}
	}, [ isHiddenAnywhere ] );

	if ( ! isHiddenAnywhere && ! hasBlockVisibilityButtonShownRef.current ) {
		return null;
	}

	return (
		<>
			<ToolbarGroup className="block-editor-block-visibility-toolbar">
				<ToolbarButton
					disabled={ ! isToolbarButtonEnabled }
					icon={ isHiddenAnywhere ? unseen : seen }
					label={
						isHiddenAnywhere ? __( 'Hidden' ) : __( 'Visible' )
					}
					onClick={ () => setIsModalOpen( true ) }
					aria-expanded={ isModalOpen }
					aria-haspopup={ ! isModalOpen ? 'dialog' : undefined }
				/>
			</ToolbarGroup>
			{ isModalOpen && (
				<BlockVisibilityModal
					clientIds={ clientIds }
					onClose={ () => setIsModalOpen( false ) }
				/>
			) }
		</>
	);
}
