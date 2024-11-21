<?php
/**
 * Plugin Name:       Dev Examples for Divi
 * Plugin URI:        https://ayubna.work/plugins/dev-examples-for-divi
 * Description:       Dev Examples for Divi is a WordPress plugin that provides code examples demonstrating how to use the Divi Builder API in third-party extensions. It is designed for demonstration, testing, and learning purposes.
 * Version:           1.0.1
 * Requires at least: 6.6
 * Requires PHP:      7.2
 * Author:            Ayub Adiputra
 * Author URI:        https://ayubna.work
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       dev-examples-for-divi
 * Domain Path:       /languages
 */

if ( ! defined( 'DED_PLUGIN_FILE' ) ) {
	/**
	 * Plugin file constant.
	 *
	 * @since 1.0.0
	 *
	 * @var string
	 */
	define( 'DED_PLUGIN_FILE', __FILE__ );
}

if ( ! defined( 'DED_PLUGIN_VERSION' ) ) {
	/**
	 * Plugin version constant.
	 *
	 * @since 1.0.1
	 *
	 * @var string
	 */
	define( 'DED_PLUGIN_VERSION', '1.0.1' );
}

// Load the autoloader.
require_once __DIR__ . '/vendor/autoload.php';

// Load the examples.
require_once __DIR__ . '/data.php';
require_once __DIR__ . '/includes/modules/Modules.php';

