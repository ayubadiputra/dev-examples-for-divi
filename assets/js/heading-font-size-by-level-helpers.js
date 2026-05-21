/**
 * Vendored from Divi 5 (@divi/module-utils, @divi/module) for use in a plain VB script.
 * Source references:
 * - includes/builder-5/visual-builder/packages/module-utils/src/inherit-attr-value/index.ts
 * - includes/builder-5/visual-builder/packages/module-utils/src/get-attr-value/index.ts
 * - includes/builder-5/visual-builder/packages/module/src/options/font/group/utils/get-size-default-value/index.ts
 *
 * @package DevExamplesForDivi
 */

/* global lodash, _ */
(function attachDedHeadingFontHelpers(global) {
	'use strict';

	const _ = global.lodash || global._;
	if (!_) {
		return;
	}

	const { isObject, merge, isPlainObject, slice } = _;

	const defaultBreakpointNames = ['desktop', 'tablet', 'phone'];

	/**
	 * @param {object} params
	 * @returns {*}
	 */
	function inheritAttrValue(params) {
		const {
			attr,
			breakpoint,
			state,
			inheritMode = 'all',
			breakpointNames = defaultBreakpointNames,
			baseBreakpoint = 'desktop',
		} = params;

		const isDefaultState = 'value' === state;
		const isBaseBreakpoint = baseBreakpoint === breakpoint;

		if (-1 === breakpointNames.indexOf(baseBreakpoint)) {
			return null;
		}

		if (isBaseBreakpoint && isDefaultState) {
			return null;
		}

		const baseBreakpointIndex = breakpointNames.indexOf(baseBreakpoint);
		const breakpointIndex = breakpointNames.indexOf(breakpoint);
		const isWiderThanBaseBreakpoint = baseBreakpointIndex > breakpointIndex;

		const filteredBreakpointNames = isWiderThanBaseBreakpoint
			? slice(breakpointNames, 0, baseBreakpointIndex + 1).reverse()
			: slice(breakpointNames, baseBreakpointIndex, breakpointNames.length);

		const breakpointIndexOnFilteredBreakpointNames = filteredBreakpointNames.indexOf(breakpoint);
		const largerOrderBreakpoints = slice(filteredBreakpointNames, 0, breakpointIndexOnFilteredBreakpointNames).reverse();

		let inheritedAttrValue;

		if (!isDefaultState) {
			inheritedAttrValue = attr?.[breakpoint]?.value;
		}

		for (let largerOrderBreakpointsIndex = 0; largerOrderBreakpointsIndex < largerOrderBreakpoints.length; largerOrderBreakpointsIndex++) {
			const currentLargerBreakpoint = largerOrderBreakpoints?.[largerOrderBreakpointsIndex];
			const largerOrderBreakpointValue = attr?.[currentLargerBreakpoint]?.value;

			if (isPlainObject(largerOrderBreakpointValue) && 'all' === inheritMode) {
				inheritedAttrValue = merge({}, largerOrderBreakpointValue, inheritedAttrValue);
			} else if (Array.isArray(largerOrderBreakpointValue)) {
				if ('undefined' === typeof inheritedAttrValue) {
					inheritedAttrValue = largerOrderBreakpointValue;
				}
				break;
			} else if ('undefined' !== typeof largerOrderBreakpointValue && 'undefined' === typeof inheritedAttrValue) {
				inheritedAttrValue = largerOrderBreakpointValue;
				break;
			} else if ('undefined' !== typeof inheritedAttrValue && 'closest' === inheritMode) {
				break;
			}
		}

		return inheritedAttrValue ?? null;
	}

	/**
	 * @param {object} params
	 * @returns {*}
	 */
	function getAttrValue(params) {
		const {
			attr,
			breakpoint,
			state,
			defaultValue,
			mode = 'getOrInheritAll',
			breakpointNames = defaultBreakpointNames,
			baseBreakpoint = 'desktop',
		} = params;

		const breakpointValue = attr?.[breakpoint];
		let attrValue;
		if (Array.isArray(breakpointValue) && 0 === breakpointValue.length) {
			attrValue = null;
		} else {
			const stateValue = breakpointValue?.[state];
			attrValue = Array.isArray(stateValue) && 0 === stateValue.length ? null : stateValue;
		}

		let inheritedAttrValue;

		switch (mode) {
			case 'getAndInheritClosest':
			case 'getOrInheritClosest':
			case 'inheritClosest':
				inheritedAttrValue = inheritAttrValue({
					attr,
					breakpoint,
					state,
					inheritMode: 'closest',
					breakpointNames,
					baseBreakpoint,
				});
				break;
			default:
				inheritedAttrValue = inheritAttrValue({
					attr,
					breakpoint,
					state,
					inheritMode: 'all',
					breakpointNames,
					baseBreakpoint,
				});
				break;
		}

		let returnedAttrValue;

		switch (mode) {
			case 'getAndInheritAll':
			case 'getAndInheritClosest':
				if (Array.isArray(attrValue) && Array.isArray(inheritedAttrValue)) {
					returnedAttrValue = inheritedAttrValue.concat(attrValue);
				} else if (
					isObject(attrValue) &&
					!Array.isArray(attrValue) &&
					isObject(inheritedAttrValue) &&
					!Array.isArray(inheritedAttrValue)
				) {
					returnedAttrValue = merge({}, inheritedAttrValue, attrValue);
				} else {
					returnedAttrValue = attrValue ?? inheritedAttrValue;
				}
				break;
			case 'getOrInheritAll':
			case 'getOrInheritClosest':
				returnedAttrValue = attrValue ?? inheritedAttrValue;
				break;
			case 'inheritAll':
			case 'inheritClosest':
				returnedAttrValue = inheritedAttrValue;
				break;
			default:
				returnedAttrValue = attrValue;
				break;
		}

		return returnedAttrValue ?? defaultValue ?? null;
	}

	/**
	 * @param {object} params
	 * @returns {string}
	 */
	function getSizeDefaultValue(params) {
		const {
			attrValue,
			responsiveMode,
			stateMode,
			defaultAttr,
			mappings,
			baseBreakpoint,
			breakpointNames,
		} = params;

		const defaultAttrValue = getAttrValue({
			attr: defaultAttr,
			breakpoint: responsiveMode,
			state: stateMode,
			baseBreakpoint,
			breakpointNames,
		});

		const headingLevelDefault = defaultAttrValue?.headingLevel ?? 'h1';
		const defaultSize = defaultAttrValue?.size;

		const headingLevel =
			getAttrValue({
				attr: attrValue,
				breakpoint: responsiveMode,
				state: stateMode,
				baseBreakpoint,
				breakpointNames,
			})?.headingLevel ?? headingLevelDefault;

		if (null !== defaultSize && 'undefined' !== typeof defaultSize) {
			return defaultSize;
		}

		if (headingLevelDefault !== headingLevel) {
			return mappings[headingLevel];
		}

		return mappings?.[headingLevelDefault];
	}

	global.DED = global.DED || {};
	global.DED.getSizeDefaultValue = getSizeDefaultValue;
})(typeof window !== 'undefined' ? window : this);
