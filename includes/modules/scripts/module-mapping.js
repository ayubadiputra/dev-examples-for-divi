/**
 * Add custom field to modules.
 *
 * @since 1.0.1
 *
 * @param {[type]} divi.moduleLibrary.moduleMapping [divi.moduleLibrary.moduleMapping description]
 * @param {[type]} divi                             [divi description]
 * @param {[type]} modules                          [modules description]
 *
 * @return {[type]}                                  [return description]
 */
window.vendor.wp.hooks.addFilter('divi.moduleLibrary.moduleMapping1', 'divi', modules => {
  // Helper functions and constants.
  const {
    set,
    get,
    has,
  } = window.lodash;

  /**
   * Add metadata to a module at a given path.
   *
   * @param {Object} modules   The modules object to modify.
   * @param {Array}  path      The path to the module to modify.
   * @param {string} metaKey   The key of the metadata to add.
   * @param {any}    metaValue The value of the metadata to add.
   * @return {void}
   * @since 1.0.1
   * @private
   * @ignore
   * @example
   * addMetadata(
   *   modules,
   *   ['divi/contact-form', 'metadata', 'settings', 'groups'],
   *   'newOptionsGroup',
   *   {
   *     panel:         'content',
   *     priority:      19,
   *     groupName:     'newOptionsGroup',
   *     multiElements: true,
   *     component:     {
   *       name:  'divi/composite',
   *       props: {
   *         groupLabel: 'New Options Group Title',
   *       },
   *     },
   *   }
   * );
   */
  const addMetadata = (modules, path, metaKey, metaValue) => {
    // Ensure the path exists by setting an empty object if not present.
    if (! has(modules, path)) {
      set(modules, path, {});
    }

    // Get the target group at the path and add the new options group.
    const target    = get(modules, path);
    target[metaKey] = metaValue;
  }

  // Contact Form - Options Group - `settings.groups`.
  addMetadata(
    modules,
    ['divi/contact-form', 'metadata', 'settings', 'groups'],
    'newOptionsGroup',
    {
      panel:         'content',
      priority:      19,
      groupName:     'newOptionsGroup',
      multiElements: true,
      component:     {
        name:  'divi/composite',
        props: {
          groupLabel: 'New Options Group Title',
        },
      },
    }
  );

  // Contact Form - Options Field - `attributes`.
  addMetadata(
    modules,
    ['divi/contact-form', 'metadata', 'attributes'],
    'newOptionsField',
    {
      type: 'object',
      settings: {
        innerContent: {
          groupType: 'group-items',
          items: {
            customToggle: {
              groupSlug: 'newOptionsGroup',
              attrName: 'customToggle',
              subName: 'testToggle',
              label: 'Custom Field Custom Toggle',
              description: 'This is a test description',
              features: {
                hover: false,
                sticky: false,
                responsive: false,
                preset: 'content',
              },
              render: true,
              priority: 0,
              component: {
                type: 'field',
                name: 'divi/toggle',
              },
            },
            customColorPicker: {
              groupSlug: 'newOptionsGroup',
              attrName: 'customColorPicker',
              label: 'Custom Field Color',
              description: 'This is a test description',
              render: true,
              priority: 0,
              component: {
                type: 'field',
                name: 'divi/color-picker',
              },
              visible: ({
                attrs,
                attrName,
                responsiveMode,
                stateMode,
              }) => {
                return 'on' === attrs?.customToggle?.desktop?.value;
              },
            },
            customIconPicker: {
              groupSlug: 'newOptionsGroup',
              attrName: 'customIconPicker',
              label: 'Custom Field Icon Picker',
              description: 'This is a test description',
              render: true,
              priority: 0,
              component: {
                type: 'field',
                name: 'divi/icon-picker',
              },
            },
          },
        },
      },
    }
  );

  // Return the modified modules.
  return modules;

  // const path = ['divi/contact-form', 'metadata', 'attributes'];
  // const {set, get, has} = window.lodash;
  // const target = get(modules, path) ? get(modules, path) : set(modules, path, {});
  // const doesPathExist = has(modules, path);
  // console.log('Test - doesPathExist', doesPathExist)
  // if (doesPathExist) {

  //     target.customFields = {
  //         type: 'object',
  //         settings: {
  //             innerContent: {
  //                 groupType: 'group-items',
  //                 items: {
  //                     customToggle: {
  //                         groupSlug: 'newOptionsGroup',
  //                         attrName: 'customToggle',
  //                         label: 'Custom Field Custom Toggle',
  //                         description: 'This is a test description',
  //                         features: {
  //                             hover: false,
  //                             sticky: false,
  //                             responsive: false,
  //                             preset: 'content',
  //                         },
  //                         render: true,
  //                         priority: 0,
  //                         component: {
  //                             type: 'field',
  //                             name: 'divi/toggle',
  //                         },
  //                     },
  //                     customColorPicker: {
  //                         groupSlug: 'newOptionsGroup',
  //                         attrName: 'customColorPicker',
  //                         label: 'Custom Field Color',
  //                         description: 'This is a test description',
  //                         render: true,
  //                         priority: 0,
  //                         component: {
  //                             type: 'field',
  //                             name: 'divi/color-picker',
  //                         },
  //                     },
  //                     customIconPicker: {
  //                         groupSlug: 'newOptionsGroup',
  //                         attrName: 'customIconPicker',
  //                         label: 'Custom Field Icon Picker',
  //                         description: 'This is a test description',
  //                         render: true,
  //                         priority: 0,
  //                         component: {
  //                             type: 'field',
  //                             name: 'divi/icon-picker',
  //                         },
  //                     },
  //                 },
  //             },
  //         },
  //     };
  // }
  // return modules;
});

// Callback function to determine if the custom "This is a test color picker" Option Field should be visible or not.
function testColorPickerVisibleCallback({
  attrs,
  attrName,
  responsiveMode,
  stateMode,
}) {
  return 'on' === attrs?.testAttribute?.innerContent?.desktop?.value?.testToggle;
}

window.vendor.wp.hooks.addFilter('divi.moduleLibrary.moduleMapping', 'divi', modules => {
  // A path to select and and modify in the `modules` object.
  const path = ['divi/blurb', 'metadata', 'attributes'];

  // Helper functions and constants.
  const { set, get, has } = window.lodash;
  const target            = get(modules, path) ? get(modules, path) : set(modules, path, {});
  const doesPathExist     = has(modules, path);

  // Checks if path exists, then adds some new custom Option Fields.
  if (doesPathExist) {
    target.testAttribute = {
      type:     'object',
      settings: {
        innerContent: {
          groupType: 'group-items',
          items:     {
            testToggle: {
              groupSlug:   'contentImageIcon',
              attrName:    'testAttribute.innerContent',
              subName:     'testToggle',
              label:       'This is a test toggle',
              description: 'This is a test description',
              features:    {
                hover:      false,
                sticky:     false,
                responsive: false,
                preset:     'content',
              },
              render:   true,
              priority: 10,

              component: {
                type: 'field',
                name: 'divi/toggle',
              },
            },
            testColorPicker: {
              groupSlug:   'contentImageIcon',
              attrName:    'testAttribute.innerContent',
              subName:     'testColorPicker',
              label:       'This is a test color picker',
              description: 'This is a test description',
              features:    {
                hover:      false,
                sticky:     false,
                responsive: false,
                preset:     'content',
              },
              render:   true,
              priority: 20,
              visible:  testColorPickerVisibleCallback,

              component: {
                type: 'field',
                name: 'divi/color-picker',
              },
            },
          },
        },
      },
    };
  } else {
    console.error('Path is not found.');
  }

  // Return the modified modules.
  return modules;
});
