/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { MenuItem } from '@wordpress/components';
import { seen, unseen } from '@wordpress/icons';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { BlockVisibilityModal, useBlockVisibility } from './';

export default function BlockVisibilityViewportMenuItem( { clientIds } ) {
	const { isHiddenAnywhere } = useBlockVisibility( { clientIds } );
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	return (
		<>
			<MenuItem
				icon={ isHiddenAnywhere ? unseen : seen }
				onClick={ () => setIsModalOpen( true ) }
			>
				{ isHiddenAnywhere ? __( 'Show' ) : __( 'Hide' ) }
			</MenuItem>
			{ isModalOpen && (
				<BlockVisibilityModal
					clientIds={ clientIds }
					onClose={ () => setIsModalOpen( false ) }
				/>
			) }
		</>
	);
}
