/**
 * WordPress dependencies
 */
import { useViewportMatch } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../store';
import { isAnyBlockHidden } from './utils';
import { deviceTypeKey } from '../../store/private-keys';
import { BLOCK_VISIBILITY_VIEWPORTS } from './constants';

const EMPTY_ARRAY = [];

export default function useBlockVisibility( { clientIds } ) {
	const hasClientIds = clientIds?.length > 0;

	const { blocks, deviceType } = useSelect(
		( select ) => {
			if ( ! hasClientIds ) {
				return {
					blocks: EMPTY_ARRAY,
				};
			}

			const { getBlocksByClientId, getSettings } =
				select( blockEditorStore );

			return {
				blocks: getBlocksByClientId( clientIds ) || EMPTY_ARRAY,
				deviceType:
					getSettings()?.[ deviceTypeKey ]?.toLowerCase() ||
					'desktop',
			};
		},
		[ clientIds, hasClientIds ]
	);

	// When Desktop is selected, use actual viewport detection
	// When Mobile/Tablet is selected, override with device type
	// All hooks must be called unconditionally
	const isLargerThanMobile = useViewportMatch( 'mobile', '>=' ); // >= 480px
	const isLargerThanTablet = useViewportMatch( 'medium', '>=' ); // >= 782px

	// Determine current viewport based on deviceType and/or viewport detection.
	const currentViewport = useMemo( () => {
		if ( deviceType === BLOCK_VISIBILITY_VIEWPORTS.mobile.key ) {
			return BLOCK_VISIBILITY_VIEWPORTS.mobile.key;
		}
		if ( deviceType === BLOCK_VISIBILITY_VIEWPORTS.tablet.key ) {
			return BLOCK_VISIBILITY_VIEWPORTS.tablet.key;
		}
		if ( ! isLargerThanMobile ) {
			// Desktop: use actual viewport detection
			// Mobile: viewport < 480px (matches block-visibility.php: max-width: 479px)
			return BLOCK_VISIBILITY_VIEWPORTS.mobile.key;
		}
		if ( isLargerThanMobile && ! isLargerThanTablet ) {
			// Tablet: viewport >= 480px and < 782px (matches block-visibility.php: 480px-781px)
			return BLOCK_VISIBILITY_VIEWPORTS.tablet.key;
		}
		// Desktop: viewport >= 782px (matches block-visibility.php: min-width: 782px)
		return BLOCK_VISIBILITY_VIEWPORTS.desktop.key;
	}, [ deviceType, isLargerThanMobile, isLargerThanTablet ] );

	/*
	 * Determine if all blocks are hidden at the current viewport (or everywhere).
	 * Typically, this would be a single block checked, but this is a more general approach to match the clientIds array arg.
	 *
	 * @return {boolean} `true` if all blocks are hidden at the current viewport (or everywhere), `false` otherwise.
	 */
	const areBlocksCurrentlyHidden = useMemo( () => {
		// Hidden everywhere takes precedence.
		const hiddenBlocksLength = blocks.filter(
			( block ) =>
				block && block?.attributes?.metadata?.blockVisibility === false
		).length;

		if ( hiddenBlocksLength > 0 && hiddenBlocksLength === blocks.length ) {
			return true;
		}
		if ( window.__experimentalHideBlocksBasedOnScreenSize ) {
			const hiddenBlocksOnCurrentViewportLength = blocks.filter(
				( block ) =>
					block?.attributes?.metadata?.blockVisibility?.[
						currentViewport
					] === false
			).length;
			if (
				hiddenBlocksOnCurrentViewportLength > 0 &&
				hiddenBlocksOnCurrentViewportLength === blocks.length
			) {
				return true;
			}
		}
		return false;
	}, [ blocks, currentViewport ] );

	/**
	 * Checks if any block is hidden either everywhere or according to viewport visibility settings.
	 * This is used to determine if the block visibility button should be shown in the toolbar.
	 * TODO: This is temporary to show icon states and what not. Later the UI will
	 * want to know where exactly the block is hidden, e.g., to display icons or other things.
	 *
	 * @return {boolean} `true` if at least one block meets the visibility criteria, `false` otherwise.
	 */
	const isHiddenAnywhere = useMemo(
		() => ( hasClientIds ? isAnyBlockHidden( blocks ) : false ),
		[ blocks, hasClientIds ]
	);

	return {
		blocks,
		isHiddenAnywhere,
		areBlocksCurrentlyHidden,
	};
}
