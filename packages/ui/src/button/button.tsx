/**
 * External dependencies
 */
import { forwardRef, useEffect } from '@wordpress/element';
import { Button as _Button } from '@base-ui/react/button';
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { speak } from '@wordpress/a11y';

/**
 * Internal dependencies
 */
import { type ButtonProps } from './types';
import styles from './style.module.css';
import resetStyles from '../utils/css/resets.module.css';
import focusStyles from '../utils/css/focus.module.css';

export const Button = forwardRef< HTMLButtonElement, ButtonProps >(
	function Button(
		{
			tone = 'brand',
			variant = 'solid',
			size = 'default',
			className,
			focusableWhenDisabled = true,
			disabled,
			loading,
			loadingAnnouncement,
			children,
			...props
		},
		ref
	) {
		const mergedClassName = clsx(
			resetStyles[ 'box-sizing' ],
			focusStyles[ 'outset-ring--focus-except-active' ],
			variant !== 'unstyled' && styles.button,
			styles[ `is-${ tone }` ],
			styles[ `is-${ variant }` ],
			styles[ `is-${ size }` ],
			loading && styles[ 'is-loading' ],
			className
		);

		// Announce loading state to assistive technology
		useEffect( () => {
			if ( loading && loadingAnnouncement ) {
				speak( loadingAnnouncement );
			}
		}, [ loading, loadingAnnouncement ] );

		return (
			<_Button
				ref={ ref }
				className={ mergedClassName }
				focusableWhenDisabled={ focusableWhenDisabled }
				disabled={ disabled ?? loading }
				{ ...props }
			>
				{ children }
			</_Button>
		);
	}
);
