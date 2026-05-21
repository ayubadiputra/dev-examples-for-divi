/**
 * Divi 5 Visual Builder — custom Heading text-size defaults per HTML heading level (H1–H6).
 *
 * Uses `divi.moduleLibrary.moduleAttributes.divi.heading` to override the font `size` field
 * `getDefaultValue` (same approach as core `getSizeDefaultValue`, custom mapping), and
 * `divi.moduleLibrary.registerModule.moduleAttrs` so VB style output includes `font-size` when `size` is unset.
 *
 * Helpers are in `heading-font-size-by-level-helpers.js` (vendored from Divi 5 sources).
 *
 * @package DevExamplesForDivi
 */
(function () {
	'use strict';

	const hooks = window.vendor?.wp?.hooks;
	const getSizeDefaultValue = window.DED?.getSizeDefaultValue;
	const _ = window.lodash || window._;

	if (!hooks || typeof getSizeDefaultValue !== 'function' || !_) {
		return;
	}

	/** @type {Record<string, string>} */
	const DED_HEADING_FONT_SIZE_BY_LEVEL = {
		h1: '60px',
		h2: '50px',
		h3: '40px',
		h4: '30px',
		h5: '20px',
		h6: '10px',
	};

	const DED_BREAKPOINT_NAMES = ['desktop', 'tablet', 'phone'];

	/**
	 * Baseline heading level for `getSizeDefaultValue` when merging module + preset attrs (avoid hardcoding H1 only).
	 *
	 * @param {Record<string, unknown>} titleFont `title.decoration.font.font`
	 * @returns {string}
	 */
	const dedPickHeadingLevelForSizeDefaults = (titleFont) => {
		if (!titleFont || typeof titleFont !== 'object') {
			return 'h1';
		}
		const fromDesktop = titleFont?.desktop?.value?.headingLevel;
		if (typeof fromDesktop === 'string' && fromDesktop) {
			return fromDesktop;
		}
		for (let i = 0; i < DED_BREAKPOINT_NAMES.length; i++) {
			const bp = DED_BREAKPOINT_NAMES[i];
			const v = titleFont?.[bp]?.value?.headingLevel;
			if (typeof v === 'string' && v) {
				return v;
			}
		}
		return 'h1';
	};

	/**
	 * Minimal `defaultAttr` tree for `getSizeDefaultValue` (matches core shape; level comes from merged attrs).
	 *
	 * @param {Record<string, unknown>} titleFont
	 */
	const dedTitleFontDefaultAttrFromTree = (titleFont) => ({
		desktop: {
			value: {
				headingLevel: dedPickHeadingLevelForSizeDefaults(titleFont),
			},
		},
	});

	/**
	 * `fontStyleDeclaration` only prints font-size when `size` is set; merge the same ladder used by the field default.
	 *
	 * @param {Record<string, unknown>} moduleAttrs
	 * @returns {Record<string, unknown>}
	 */
	const dedResolveHeadingTitleFontSizesForRender = (moduleAttrs) => {
		const titleFont = moduleAttrs?.title?.decoration?.font?.font;
		if (!titleFont || typeof titleFont !== 'object') {
			return moduleAttrs;
		}

		const defaultAttr = dedTitleFontDefaultAttrFromTree(titleFont);

		/** @type {{ breakpoint: string, state: string, resolved: string }[]} */
		const toApply = [];

		Object.keys(titleFont).forEach((breakpoint) => {
			const byState = titleFont[breakpoint];
			if (!byState || typeof byState !== 'object') {
				return;
			}
			Object.keys(byState).forEach((state) => {
				const val = byState[state];
				if (!val || typeof val !== 'object') {
					return;
				}
				const size = val.size;
				if (size !== null && size !== undefined && size !== '') {
					return;
				}
				const resolved = getSizeDefaultValue({
					attrValue: titleFont,
					defaultAttr,
					responsiveMode: breakpoint,
					stateMode: state,
					mappings: DED_HEADING_FONT_SIZE_BY_LEVEL,
					baseBreakpoint: 'desktop',
					breakpointNames: DED_BREAKPOINT_NAMES,
				});
				if (!resolved || typeof resolved !== 'string') {
					return;
				}
				toApply.push({ breakpoint, state, resolved });
			});
		});

		if (toApply.length === 0) {
			return moduleAttrs;
		}

		const out = _.merge({}, moduleAttrs);
		toApply.forEach(({ breakpoint, state, resolved }) => {
			_.set(out, ['title', 'decoration', 'font', 'font', breakpoint, state, 'size'], resolved);
		});
		return out;
	};

	const registerHeadingAttributesFilter = () => {
		hooks.addFilter(
			'divi.moduleLibrary.moduleAttributes.divi.heading',
			'dev-examples-for-divi-heading-font-size-by-level',
			(attributes) => {
				if (!attributes) {
					return attributes;
				}

				const out = _.merge({}, attributes);
				const sizeFieldPath = [
					'title',
					'settings',
					'decoration',
					'font',
					'item',
					'component',
					'props',
					'fields',
					'size',
				];
				const prevSize = _.get(out, sizeFieldPath) ?? {};
				_.set(out, sizeFieldPath, {
					...prevSize,
					getDefaultValue: (params) =>
						getSizeDefaultValue({
							...params,
							mappings: DED_HEADING_FONT_SIZE_BY_LEVEL,
						}),
				});
				return out;
			}
		);
	};

	/**
	 * Register before the module library registers official modules so `moduleAttributes` filters apply.
	 *
	 * @see divi/module-library/src/store/index.ts — doAction('divi.moduleLibrary.registerModuleLibraryStore.before')
	 */
	let dedHeadingFontFilterRegistered = false;
	hooks.addAction('divi.moduleLibrary.registerModuleLibraryStore.before', 'dev-examples-for-divi-heading-font-size-by-level', () => {
		if (dedHeadingFontFilterRegistered) {
			return;
		}
		dedHeadingFontFilterRegistered = true;
		registerHeadingAttributesFilter();
	});

	hooks.addFilter(
		'divi.moduleLibrary.registerModule.moduleAttrs',
		'dev-examples-for-divi-heading-font-size-render',
		(moduleAttrs, context) => {
			if ((context?.name ?? '') !== 'divi/heading') {
				return moduleAttrs;
			}
			return dedResolveHeadingTitleFontSizesForRender(moduleAttrs);
		}
	);
})();
