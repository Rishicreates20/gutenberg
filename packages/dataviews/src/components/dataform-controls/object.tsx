/**
 * WordPress dependencies
 */
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import type { DataFormControlProps, DeepPartial } from '../../types';

/**
 * Object field control.
 *
 * Auto-generates a form with controls for each property in `properties`.
 */
export default function ObjectControl< Item >( {
	data,
	field,
	onChange,
	hideLabelFromVision,
	validity,
}: DataFormControlProps< Item > ) {
	const { properties } = field;

	const currentValue = field.getValue( { item: data } ) ?? {};
	const handlePropertyChange = useCallback(
		( updates: DeepPartial< Item > ) => {
			onChange(
				field.setValue( {
					item: data,
					value: { ...currentValue, ...updates },
				} )
			);
		},
		[ onChange ]
	);

	if (
		! properties ||
		typeof properties !== 'object' ||
		Object.keys( properties ).length === 0
	) {
		return null;
	}

	return (
		<VStack spacing={ 4 }>
			{ Object.entries( properties ).map( ( [ propKey, propField ] ) => {
				if ( ! propField.Edit ) {
					return null;
				}

				// TODO: validity
				const propValidity = validity?.children?.[ propKey ];
				return (
					<propField.Edit
						key={ propKey }
						data={ currentValue }
						field={ propField }
						onChange={ handlePropertyChange }
						hideLabelFromVision={ hideLabelFromVision }
						validity={ propValidity }
					/>
				);
			} ) }
		</VStack>
	);
}
