<?php
/**
 * Visual Builder scripts: Heading module custom default text sizes per heading level (H1–H6).
 *
 * @package DED
 */

namespace DED;

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Direct access forbidden.' );
}

/**
 * Registers VB package builds (lodash helpers + main filter script).
 */
final class HeadingModuleDefaultAttributes {

	private const HELPERS_HANDLE = 'ded-heading-font-size-helpers';

	private const SCRIPT_HANDLE = 'ded-heading-module-default-attributes';

	/**
	 * Hook into WordPress.
	 */
	public static function init(): void {
		add_action( 'divi_visual_builder_assets_before_enqueue_scripts', [ __CLASS__, 'register_package_builds' ] );
	}

	/**
	 * Register package builds so scripts load in the VB app iframe in dependency order.
	 */
	public static function register_package_builds(): void {
		if ( ! function_exists( 'et_builder_d5_enabled' ) || ! et_builder_d5_enabled() ) {
			return;
		}

		if ( ! function_exists( 'et_core_is_fb_enabled' ) || ! et_core_is_fb_enabled() ) {
			return;
		}

		if ( ! class_exists( \ET\Builder\VisualBuilder\Assets\PackageBuildManager::class ) ) {
			return;
		}

		$no_enqueue_style = [
			'enqueue_top_window' => false,
			'enqueue_app_window' => false,
		];

		\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
			[
				'name'    => self::HELPERS_HANDLE,
				'version' => self::get_asset_version( 'assets/js/heading-font-size-by-level-helpers.js' ),
				'script'  => [
					'src'                => plugins_url( 'assets/js/heading-font-size-by-level-helpers.js', DED_DEV_EXAMPLES_FOR_DIVI_FILE ),
					'deps'               => [ 'lodash' ],
					'enqueue_top_window' => false,
					'enqueue_app_window' => true,
					'args'               => [
						'in_footer' => false,
					],
				],
				'style'   => $no_enqueue_style,
			]
		);

		\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
			[
				'name'    => self::SCRIPT_HANDLE,
				'version' => self::get_asset_version( 'assets/js/heading-module-default-attributes.js' ),
				'script'  => [
					'src'                => plugins_url( 'assets/js/heading-module-default-attributes.js', DED_DEV_EXAMPLES_FOR_DIVI_FILE ),
					'deps'               => [
						'lodash',
						'divi-vendor-wp-hooks',
						self::HELPERS_HANDLE,
					],
					'enqueue_top_window' => false,
					'enqueue_app_window' => true,
					'args'               => [
						'in_footer' => false,
					],
				],
				'style'   => $no_enqueue_style,
			]
		);
	}

	/**
	 * Bust browser cache in dev when a file changes.
	 *
	 * @param string $relative_path Path relative to the plugin root.
	 * @return string
	 */
	private static function get_asset_version( string $relative_path ): string {
		$path = dirname( DED_DEV_EXAMPLES_FOR_DIVI_FILE ) . '/' . ltrim( $relative_path, '/' );

		if ( is_readable( $path ) ) {
			return (string) filemtime( $path );
		}

		return '1.0.0';
	}
}
