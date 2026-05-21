# Dev Examples for Divi

Dev Examples for Divi is a WordPress plugin that provides code examples demonstrating how to use the Divi Builder API in third-party extensions. It is designed for demonstration, testing, and learning purposes.

## Installation and Requirement

After cloning the repository, run `composer install`. To enable certain examples, please check "Examples" section for more details.

Dev Examples for Divi plugin's minimum requirements are WordPress 6.6 and PHP 7.2.

## Examples

### Heading module — custom text size per heading level (Divi 5 Visual Builder)

This example changes the **default Text Size** ladder for the native **Heading** module (`divi/heading`) in the Visual Builder when the stored size is still driven by defaults (same idea as Divi’s `getSizeDefaultValue` + `fontDefaultSizeByHeadingLevel`, but with custom pixel values).

**Default ladder in this plugin**

| Level | Size   |
|-------|--------|
| H1    | 60px   |
| H2    | 50px   |
| H3    | 40px   |
| H4    | 30px   |
| H5    | 20px   |
| H6    | 10px   |

**How it works**

1. **`assets/js/heading-font-size-by-level-helpers.js`** — Vendored copies of Divi 5’s `inheritAttrValue`, `getAttrValue`, and `getSizeDefaultValue` (GPL). They attach `window.DED.getSizeDefaultValue`.
2. **`assets/js/heading-module-default-attributes.js`** — Registers `divi.moduleLibrary.moduleAttributes.divi.heading` and merges a custom `getDefaultValue` on `title.settings.decoration.font.item.component.props.fields.size` that calls `getSizeDefaultValue` with the mapping above. It also filters `divi.moduleLibrary.registerModule.moduleAttrs` for `divi/heading` so **VB canvas / module styles** get a resolved `title.decoration.font.font.*.*.size` when the stored size is still empty (Divi’s font declaration only outputs `font-size` when `size` is set).
3. **`includes/HeadingModuleDefaultAttributes.php`** — Registers both scripts with `PackageBuildManager::register_package_build()` in the VB app iframe (`lodash` → helpers → main script; `in_footer` false).
4. **`includes/HeadingModuleStyleAttrs.php`** — Filters `divi_module_library_register_module_attrs` for `divi/heading` with the same ladder logic so the **front end** matches the builder.

Edit the object `DED_HEADING_FONT_SIZE_BY_LEVEL` in `heading-module-default-attributes.js` and the `FONT_SIZE_BY_LEVEL` constant in `HeadingModuleStyleAttrs.php` together so VB and FE stay aligned.

**Module presets (Heading level default)**

Render-time size injection uses the same `getSizeDefaultValue` rules as the Text Size field. The baseline heading level for that math is taken from **merged** `title.decoration.font.font` (so a module or **module preset** default of H4 is respected once that level exists in attrs). If the preset never stores `headingLevel` on the title font attr, Divi may still fall back to the core module default (H1) until the preset payload includes that value—same as core behavior for “empty” heading level.

## Contributing

If you have requests, suggestions, or want to report bugs, [let me know](https://github.com/ayubadiputra/dev-examples-for-divi/issues).
