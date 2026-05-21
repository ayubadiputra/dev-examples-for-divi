<?php
/**
 * Heading module: inject resolved title font `size` at render time so CSS matches per-level defaults.
 *
 * @package DED
 */

namespace DED;

use ET\Builder\Framework\Breakpoint\Breakpoint;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;
use ET\Builder\Packages\ModuleUtils\ModuleUtils;

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Direct access forbidden.' );
}

/**
 * Mirrors VB `divi.moduleLibrary.registerModule.moduleAttrs` for the front end.
 */
final class HeadingModuleStyleAttrs {

	/**
	 * Same ladder as `heading-module-default-attributes.js` (keep in sync).
	 */
	private const FONT_SIZE_BY_LEVEL = [
		'h1' => '60px',
		'h2' => '50px',
		'h3' => '40px',
		'h4' => '30px',
		'h5' => '20px',
		'h6' => '10px',
	];

	/**
	 * Minimal `defaultAttr` for `get_size_default_value`, aligned with Divi’s heading default render attrs.
	 *
	 * Uses merged `title.decoration.font.font` when it carries `headingLevel`; otherwise falls back to
	 * `ModuleRegistration::get_default_attrs( 'divi/heading' )` (same source as core FE defaults, including PHP filters).
	 *
	 * @param array<string,mixed> $font_tree `title.decoration.font.font`.
	 * @return array<string,mixed>
	 */
	private static function title_font_default_attr_from_tree( $font_tree ) {
		$level = null;

		if ( is_array( $font_tree ) ) {
			$from_desktop = $font_tree['desktop']['value']['headingLevel'] ?? null;
			if ( is_string( $from_desktop ) && '' !== $from_desktop ) {
				$level = $from_desktop;
			} else {
				foreach ( Breakpoint::get_default_breakpoint_names() as $bp ) {
					$bp_branch = $font_tree[ $bp ] ?? null;
					$v         = is_array( $bp_branch ) ? ( $bp_branch['value']['headingLevel'] ?? null ) : null;
					if ( is_string( $v ) && '' !== $v ) {
						$level = $v;
						break;
					}
				}
			}
		}

		if ( null === $level || '' === $level ) {
			$level = self::get_core_heading_default_level();
		}

		return [
			'desktop' => [
				'value' => [
					'headingLevel' => $level,
				],
			],
		];
	}

	/**
	 * Default `headingLevel` from Divi core heading module render defaults (filtered).
	 *
	 * @return string
	 */
	private static function get_core_heading_default_level() {
		if ( ! class_exists( ModuleRegistration::class ) ) {
			return 'h1';
		}

		$core      = ModuleRegistration::get_default_attrs( 'divi/heading' );
		$core_font = $core['title']['decoration']['font']['font'] ?? [];
		$from_core = $core_font['desktop']['value']['headingLevel'] ?? null;

		return is_string( $from_core ) && '' !== $from_core ? $from_core : 'h1';
	}

	/**
	 * Hook into WordPress.
	 */
	public static function init(): void {
		add_filter( 'divi_module_library_register_module_attrs', [ __CLASS__, 'filter_register_module_attrs' ], 10, 2 );
	}

	/**
	 * @param array<string,mixed> $module_attrs Merged module attrs for render.
	 * @param array<string,mixed> $filter_args  Contains `name`, `attrs`, etc.
	 * @return array<string,mixed>
	 */
	public static function filter_register_module_attrs( $module_attrs, $filter_args ) {
		if ( ( $filter_args['name'] ?? '' ) !== 'divi/heading' ) {
			return $module_attrs;
		}

		if ( ! class_exists( ModuleUtils::class ) || ! class_exists( Breakpoint::class ) || ! class_exists( ModuleRegistration::class ) ) {
			return $module_attrs;
		}

		$font_tree = $module_attrs['title']['decoration']['font']['font'] ?? null;
		if ( ! is_array( $font_tree ) ) {
			return $module_attrs;
		}

		$breakpoint_names = Breakpoint::get_default_breakpoint_names();
		$base_breakpoint  = 'desktop';
		$default_attr     = self::title_font_default_attr_from_tree( $font_tree );
		$out              = $module_attrs;
		$mutated          = false;

		foreach ( $font_tree as $breakpoint => $by_state ) {
			if ( ! is_string( $breakpoint ) || ! is_array( $by_state ) ) {
				continue;
			}
			foreach ( $by_state as $state => $value_obj ) {
				if ( ! is_string( $state ) || ! is_array( $value_obj ) ) {
					continue;
				}
				if ( isset( $value_obj['size'] ) && null !== $value_obj['size'] && '' !== $value_obj['size'] ) {
					continue;
				}

				$resolved = self::get_size_default_value(
					$font_tree,
					$default_attr,
					$breakpoint,
					$state,
					self::FONT_SIZE_BY_LEVEL,
					$base_breakpoint,
					$breakpoint_names
				);

				if ( ! is_string( $resolved ) || '' === $resolved ) {
					continue;
				}

				$out     = self::patch_title_font_size( $out, $breakpoint, $state, $resolved );
				$mutated = true;
			}
		}

		return $mutated ? $out : $module_attrs;
	}

	/**
	 * @param array<string,mixed> $module_attrs .
	 * @param string              $breakpoint   .
	 * @param string              $state        .
	 * @param string              $size         .
	 * @return array<string,mixed>
	 */
	private static function patch_title_font_size( $module_attrs, $breakpoint, $state, $size ) {
		$patch = [
			'title' => [
				'decoration' => [
					'font' => [
						'font' => [
							$breakpoint => [
								$state => [
									'size' => $size,
								],
							],
						],
					],
				],
			],
		];

		return array_replace_recursive( $module_attrs, $patch );
	}

	/**
	 * Same rules as Divi `get-size-default-value` + custom `mappings`.
	 *
	 * @param array<string,mixed> $attr_value        Full `title.decoration.font.font` tree.
	 * @param array<string,mixed> $default_attr      Default font attr tree (module defaults).
	 * @param string              $responsive_mode   Breakpoint name.
	 * @param string              $state_mode        State key (e.g. `value`, `hover`).
	 * @param array<string,string> $mappings         heading level => size.
	 * @param string              $base_breakpoint   .
	 * @param array<int,string>   $breakpoint_names  .
	 * @return string|null
	 */
	private static function get_size_default_value(
		$attr_value,
		$default_attr,
		$responsive_mode,
		$state_mode,
		$mappings,
		$base_breakpoint,
		$breakpoint_names
	) {
		$default_attr_value = ModuleUtils::get_attr_value(
			[
				'attr'            => $default_attr,
				'breakpoint'      => $responsive_mode,
				'state'           => $state_mode,
				'baseBreakpoint'  => $base_breakpoint,
				'breakpointNames' => $breakpoint_names,
			]
		);

		if ( ! is_array( $default_attr_value ) ) {
			$default_attr_value = [];
		}

		$heading_level_default = isset( $default_attr_value['headingLevel'] ) && is_string( $default_attr_value['headingLevel'] )
			? $default_attr_value['headingLevel']
			: 'h1';

		$current_attr_value = ModuleUtils::get_attr_value(
			[
				'attr'            => $attr_value,
				'breakpoint'      => $responsive_mode,
				'state'           => $state_mode,
				'baseBreakpoint'  => $base_breakpoint,
				'breakpointNames' => $breakpoint_names,
			]
		);

		if ( ! is_array( $current_attr_value ) ) {
			$current_attr_value = [];
		}

		$heading_level = isset( $current_attr_value['headingLevel'] ) && is_string( $current_attr_value['headingLevel'] )
			? $current_attr_value['headingLevel']
			: $heading_level_default;

		if ( array_key_exists( 'size', $default_attr_value ) && null !== $default_attr_value['size'] ) {
			$size = $default_attr_value['size'];
			return is_string( $size ) ? $size : null;
		}

		if ( $heading_level_default !== $heading_level ) {
			return $mappings[ $heading_level ] ?? null;
		}

		return $mappings[ $heading_level_default ] ?? null;
	}
}
