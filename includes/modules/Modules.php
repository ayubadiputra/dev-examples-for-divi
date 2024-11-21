<?php
/**
 * DED_Modules class file.
 *
 * @class   DED_Modules
 * @package Dev_Examples_For_Divi\Modules
 * @since   1.0.1
 */

namespace DED\Modules;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * DED_Modules class.
 *
 * The main class to set examples for Modules API.
 *
 * @since 1.0.1
 */
class DED_Modules {
	/**
	 * Constructor.
	 *
	 * @since 1.0.1
	 */
	public function __construct() {
		// Ensure the examples are enabled on `data.php`.
		if ( ! defined( 'DED_MODULES' ) || empty( DED_MODULES ) || ! is_array( DED_MODULES ) ) {
			return;
		}

		$class = __CLASS__;

		add_action( 'wp_enqueue_scripts', "{$class}::enqueue_scripts" );
		add_filter( 'divi_module_library_register_module_attrs', "{$class}::register_module_attrs", 10, 2);
	}

	/**
	 * Enqueue scripts.
	 *
	 * @since 1.0.1
	 *
	 * @return void
	 */
	public static function enqueue_scripts(): void {
		/*
		 * Module Mapping.
		 *
		 * Goals:
		 * -
		 */
		if ( true === ( DED_MODULES['module_mapping'] ?? false ) ) {
			wp_enqueue_script(
				'ded-modules-module-mapping',
				esc_url( plugins_url( '/includes/modules/scripts/module-mapping.js', DED_PLUGIN_FILE ) ),
				[
					'lodash',
					'divi-vendor-wp-hooks'
				],
				DED_PLUGIN_VERSION,
				true
			);
		}
	}

	public static function register_module_attrs( $module_attrs, $filter_args ) {
		$module_name = $filter_args['name'];

		if ( $module_name !== 'divi/blurb' ) {
			return $module_attrs;
		}

		$module_attrs['testAttribute'] = [
			'type'     => 'object',
			'settings' => [
				'innerContent' => [
					'groupType' => 'group-items',
					'items'     => [
						'testToggle' => [
							'groupSlug'   => 'contentImageIcon',
							'attrName'    => 'testAttribute.innerContent',
							'subName'     => 'testToggle',
							'label'       => 'This is a test toggle',
							'description' => 'This is a test description',
							'features'    => [
								'hover'      => false,
								'sticky'     => false,
								'responsive' => false,
								'preset'     => 'content',
							],
							'render'   => true,
							'priority' => 10,
							'component' => [
								'type' => 'field',
								'name' => 'divi/toggle',
							],
						],
						'testColorPicker' => [
							'groupSlug'   => 'contentImageIcon',
							'attrName'    => 'testAttribute.innerContent',
							'subName'     => 'testColorPicker',
							'label'       => 'This is a test color picker',
							'description' => 'This is a test description',
							'features'    => [
								'hover'      => false,
								'sticky'     => false,
								'responsive' => false,
								'preset'     => 'content',
							],
							'render'   => true,
							'priority' => 20,
							'component' => [
								'type' => 'field',
								'name' => 'divi/color-picker',
							],
						],
					],
				],
			],
		];

		return $module_attrs;
	}
}

new DED_Modules();
