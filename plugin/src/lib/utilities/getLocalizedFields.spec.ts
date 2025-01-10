import { slateEditor } from '@payloadcms/richtext-slate';
import type { Block, CollectionConfig, Field, GlobalConfig } from 'payload';
import { getLocalizedFields } from '.';

describe('fn: getLocalizedFields', () => {
  describe('basic field types', () => {
    it('includes a text field', () => {
      const fields: Field[] = [
        {
          name: 'textLocalizedField',
          type: 'text',
          localized: true,
        },
      ];
      expect(getLocalizedFields({ fields })).toEqual(fields);
    });

    it('excludes a localized text field based on the admin description', () => {
      const fields: Field[] = [
        {
          name: 'textLocalizedField',
          type: 'text',
          localized: true,
        },
        {
          name: 'textLocalizedFieldWithExcludeDescription',
          type: 'text',
          localized: true,
          admin: {
            description: 'Not sent to Crowdin. Localize in the CMS.',
          },
        },
      ];
      expect(getLocalizedFields({ fields })).toEqual([
        {
          name: 'textLocalizedField',
          type: 'text',
          localized: true,
        },
      ]);
    });

    it('includes a richText field', () => {
      const fields: Field[] = [
        {
          name: 'richTextLocalizedField',
          type: 'richText',
          localized: true,
        },
      ];
      expect(getLocalizedFields({ fields })).toEqual(fields);
    });

    it('includes a textarea field', () => {
      const fields: Field[] = [
        {
          name: 'textareaLocalizedField',
          type: 'textarea',
          localized: true,
        },
      ];
      expect(getLocalizedFields({ fields })).toEqual(fields);
    });
  });

  describe('include fields from groups and arrays', () => {
    const mixedFieldCollection: Field[] = [
      {
        name: 'textLocalizedField',
        type: 'text',
        localized: true,
      },
      {
        name: 'textNonLocalizedField',
        type: 'text',
      },
      {
        name: 'richTextLocalizedField',
        type: 'richText',
        localized: true,
      },
      {
        name: 'richTextNonLocalizedField',
        type: 'richText',
      },
      {
        name: 'textareaLocalizedField',
        type: 'text',
        localized: true,
      },
      {
        name: 'textareaNonLocalizedField',
        type: 'text',
      },
      // select fields not supported yet
      {
        name: 'text',
        type: 'select',
        localized: true,
        options: ['one', 'two'],
      },
    ];

    const localizedFieldCollection: Field[] = [
      {
        name: 'textLocalizedField',
        type: 'text',
        localized: true,
      },
      {
        name: 'richTextLocalizedField',
        type: 'richText',
        localized: true,
      },
      {
        name: 'textareaLocalizedField',
        type: 'text',
        localized: true,
      },
    ];

    it('includes localized fields from a group field', () => {
      const fields: Field[] = [
        ...mixedFieldCollection,
        {
          name: 'groupField',
          type: 'group',
          fields: [...mixedFieldCollection],
        },
      ];
      const expected = [
        ...localizedFieldCollection,
        {
          name: 'groupField',
          type: 'group',
          fields: [...localizedFieldCollection],
        },
      ];
      expect(getLocalizedFields({ fields })).toEqual(expected);
    });

    it('includes localized fields from an array field', () => {
      const fields: Field[] = [
        ...mixedFieldCollection,
        {
          name: 'arrayField',
          type: 'array',
          fields: [...mixedFieldCollection],
        },
      ];
      const expected = [
        ...localizedFieldCollection,
        {
          name: 'arrayField',
          type: 'array',
          fields: [...localizedFieldCollection],
        },
      ];
      expect(getLocalizedFields({ fields })).toEqual(expected);
    });

    it('includes localized fields from an array with a localization setting on the array field', () => {
      const fields: Field[] = [
        ...mixedFieldCollection,
        {
          name: 'arrayField',
          type: 'array',
          localized: true,
          fields: [
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'text',
              type: 'text',
            },
            {
              name: 'textarea',
              type: 'textarea',
            },
            {
              name: 'select',
              type: 'select',
              options: ['one', 'two'],
            },
          ],
        },
      ];
      const expected = [
        ...localizedFieldCollection,
        {
          name: 'arrayField',
          type: 'array',
          localized: true,
          fields: [
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'text',
              type: 'text',
            },
            {
              name: 'textarea',
              type: 'textarea',
            },
          ],
        },
      ];
      expect(getLocalizedFields({ fields })).toEqual(expected);
    });

    it('includes localized fields from an array inside a collapsible field where the top-level field group only contains collapsible fields', () => {
      const fields: Field[] = [
        {
          label: 'Array fields',
          type: 'collapsible',
          fields: [
            {
              name: 'arrayField',
              type: 'array',
              fields: [...mixedFieldCollection],
            },
          ],
        },
      ];
      const expected = [
        {
          name: 'arrayField',
          type: 'array',
          fields: [...localizedFieldCollection],
        },
      ];
      expect(getLocalizedFields({ fields })).toEqual(expected);
    });

    /**
     * * help ensure no errors during version 0 development
     * * mitigate against errors if a new field type is introduced by Payload CMS
     */
    it('does not include unrecognized field types', () => {
      const global: any = {
        slug: 'global',
        fields: [
          {
            name: 'textLocalizedField',
            type: 'text',
            localized: true,
          },
          {
            name: 'textNonLocalizedField',
            type: 'text',
          },
          {
            name: 'unknownLocalizedField',
            type: 'weird',
            localized: true,
          },
          {
            name: 'Unknown Field type',
            type: 'strange',
            fields: [
              {
                name: 'textLocalizedFieldInCollapsibleField',
                type: 'text',
                localized: true,
              },
              {
                name: 'textNonLocalizedFieldInCollapsibleField',
                type: 'text',
              },
              // select fields not supported yet
              {
                name: 'selectLocalizedFieldInCollapsibleField',
                type: 'select',
                localized: true,
                options: ['one', 'two'],
              },
            ],
          },
        ],
      };
      const expected = [
        {
          name: 'textLocalizedField',
          type: 'text',
          localized: true,
        },
      ];
      expect(getLocalizedFields({ fields: global.fields })).toEqual(expected);
    });

    it('includes localized fields from a group field with a localization setting on the group field', () => {
      const fields: Field[] = [
        ...mixedFieldCollection,
        {
          name: 'groupField',
          type: 'group',
          localized: true,
          fields: [
            {
              name: 'text',
              type: 'text',
            },
            {
              name: 'richText',
              type: 'richText',
            },
            {
              name: 'textarea',
              type: 'textarea',
            },
            // select fields not supported yet
            {
              name: 'text',
              type: 'select',
              options: ['one', 'two'],
            },
          ],
        },
      ];
      const expected = [
        ...localizedFieldCollection,
        {
          name: 'groupField',
          type: 'group',
          localized: true,
          fields: [
            {
              name: 'text',
              type: 'text',
            },
            {
              name: 'richText',
              type: 'richText',
            },
            {
              name: 'textarea',
              type: 'textarea',
            },
          ],
        },
      ];
      expect(getLocalizedFields({ fields })).toEqual(expected);
    });

    it('includes localized fields from a blocks field', () => {
      const TestBlock: Block = {
        slug: 'text',
        imageAltText: 'Text',
        fields: [
          {
            name: 'title',
            type: 'text',
            localized: true,
          },
          {
            name: 'text',
            type: 'richText',
            localized: true,
          },
          {
            name: 'select',
            type: 'select',
            localized: true,
            options: ['one', 'two'],
          },
        ],
      };
      const TestBlockLocalizedFieldsOnly: Block = {
        slug: 'text',
        imageAltText: 'Text',
        fields: [
          {
            name: 'title',
            type: 'text',
            localized: true,
          },
          {
            name: 'text',
            type: 'richText',
            localized: true,
          },
        ],
      };
      const global: GlobalConfig = {
        slug: 'global',
        fields: [
          {
            name: 'simpleLocalizedField',
            type: 'text',
            localized: true,
          },
          {
            name: 'simpleNonLocalizedField',
            type: 'text',
          },
          {
            name: 'blocksField',
            type: 'blocks',
            blocks: [TestBlock],
          },
        ],
      };
      const expected = [
        {
          name: 'simpleLocalizedField',
          type: 'text',
          localized: true,
        },
        {
          name: 'blocksField',
          type: 'blocks',
          blocks: [
            {
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'text',
                  type: 'richText',
                  localized: true,
                },
              ],
              slug: 'text',
            },
          ],
        },
      ];
      expect(getLocalizedFields({ fields: global.fields })).toEqual(expected);
    });
  });

  it('extract rich text localized fields', () => {
    const global: GlobalConfig = {
      slug: 'global',
      fields: [
        {
          name: 'simpleLocalizedField',
          type: 'richText',
          localized: true,
        },
        {
          name: 'simpleNonLocalizedField',
          type: 'text',
        },
        {
          name: 'arrayField',
          type: 'array',
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
            },
            {
              name: 'richText',
              type: 'richText',
              localized: true,
            },
            {
              name: 'select',
              type: 'select',
              localized: true,
              options: ['one', 'two'],
            },
          ],
        },
        {
          name: 'groupField',
          type: 'group',
          fields: [
            {
              name: 'simpleLocalizedField',
              type: 'richText',
              localized: true,
            },
            {
              name: 'simpleNonLocalizedField',
              type: 'text',
            },
            // select fields not supported yet
            {
              name: 'text',
              type: 'select',
              localized: true,
              options: ['one', 'two'],
            },
          ],
        },
      ],
    };
    const expected = [
      {
        name: 'simpleLocalizedField',
        type: 'richText',
        localized: true,
      },
      {
        name: 'arrayField',
        type: 'array',
        fields: [
          {
            name: 'richText',
            type: 'richText',
            localized: true,
          },
        ],
      },
      {
        name: 'groupField',
        type: 'group',
        fields: [
          {
            name: 'simpleLocalizedField',
            type: 'richText',
            localized: true,
          },
        ],
      },
    ];
    expect(getLocalizedFields({ fields: global.fields, type: 'html' })).toEqual(
      expected
    );
  });

  it('returns nested json fields in a group inside an array', () => {
    const linkField: Field = {
      name: 'link',
      type: 'group',
      fields: [
        {
          name: 'text',
          type: 'text',
          localized: true,
        },
        {
          name: 'href',
          type: 'text',
        },
        {
          name: 'type',
          type: 'select',
          options: ['ctaPrimary', 'ctaSecondary'],
        },
      ],
    };
    const Promos: CollectionConfig = {
      slug: 'promos',
      admin: {
        defaultColumns: ['title', 'updatedAt'],
        useAsTitle: 'title',
        group: 'Shared',
      },
      access: {
        read: () => true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
        },
        {
          name: 'text',
          type: 'text',
          localized: true,
        },
        {
          name: 'ctas',
          type: 'array',
          minRows: 1,
          maxRows: 2,
          fields: [linkField],
        },
      ],
    };
    const expected = [
      {
        name: 'title',
        type: 'text',
        localized: true,
      },
      {
        name: 'text',
        type: 'text',
        localized: true,
      },
      {
        name: 'ctas',
        type: 'array',
        minRows: 1,
        maxRows: 2,
        fields: [
          {
            name: 'link',
            type: 'group',
            fields: [
              {
                name: 'text',
                type: 'text',
                localized: true,
              },
            ],
          },
        ],
      },
    ];
    const jsonFields = getLocalizedFields({
      fields: Promos.fields,
      type: 'json',
    });
    expect(jsonFields).toEqual(expected);
  });

  describe('empty tests', () => {
    it('ignore non-localized group field', () => {
      const fields: Field[] = [
        {
          name: 'simpleLocalizedField',
          type: 'text',
        },
        {
          name: 'simpleNonLocalizedField',
          type: 'text',
        },
        {
          name: 'groupField',
          type: 'group',
          fields: [
            {
              name: 'simpleLocalizedField',
              type: 'text',
            },
            {
              name: 'simpleNonLocalizedField',
              type: 'text',
            },
            // select fields not supported yet
            {
              name: 'text',
              type: 'select',
              options: ['one', 'two'],
            },
          ],
        },
      ];

      expect(getLocalizedFields({ fields })).toEqual([]);
    });

    it('ignore non-localized array field', () => {
      const fields: Field[] = [
        {
          name: 'simpleLocalizedField',
          type: 'text',
        },
        {
          name: 'simpleNonLocalizedField',
          type: 'text',
        },
        {
          name: 'arrayField',
          type: 'array',
          fields: [
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'text',
              type: 'text',
            },
            {
              name: 'select',
              type: 'select',
              localized: true,
              options: ['one', 'two'],
            },
          ],
        },
      ];
      expect(getLocalizedFields({ fields })).toEqual([]);
    });

    it('ignore non-localized fields from an array inside a collapsible field where the top-level field group only contains collapsible fields', () => {
      const fields: Field[] = [
        {
          label: 'Array fields',
          type: 'collapsible',
          fields: [
            {
              name: 'arrayField',
              type: 'array',
              fields: [
                {
                  name: 'title',
                  type: 'richText',
                },
                {
                  name: 'content',
                  type: 'richText',
                },
                {
                  name: 'select',
                  type: 'select',
                  options: ['one', 'two'],
                },
              ],
            },
          ],
        },
      ];
      expect(getLocalizedFields({ fields })).toEqual([]);
    });

    /**
     * * help ensure no errors during version 0 development
     * * mitigate against errors if a new field type is introduced by Payload CMS
     */
    it('does not include unrecognized field types', () => {
      const global: any = {
        slug: 'global',
        fields: [
          {
            name: 'textLocalizedField',
            type: 'text',
          },
          {
            name: 'textNonLocalizedField',
            type: 'text',
          },
          {
            name: 'unknownLocalizedField',
            type: 'weird',
            localized: true,
          },
          {
            name: 'Unknown Field type',
            type: 'strange',
            fields: [
              {
                name: 'textLocalizedFieldInCollapsibleField',
                type: 'text',
                localized: true,
              },
              {
                name: 'textNonLocalizedFieldInCollapsibleField',
                type: 'text',
              },
              // select fields not supported yet
              {
                name: 'selectLocalizedFieldInCollapsibleField',
                type: 'select',
                localized: true,
                options: ['one', 'two'],
              },
            ],
          },
        ],
      };
      expect(getLocalizedFields({ fields: global.fields })).toEqual([]);
    });

    /**
     * blocks not supported yet
    it ("includes localized fields from a blocks field", () => {
      const TestBlock: Block = {
        slug: 'text',
        imageAltText: 'Text',
        fields: [
          {
            name: 'title',
            type: 'text',
            localized: true,
          },
          {
            name: 'text',
            type: 'richText',
            localized: true,
          },
          {
            name: 'select',
            type: 'select',
            localized: true,
            options: [
              'one',
              'two'
            ]
          },
        ]
      }
      const TestBlockLocalizedFieldsOnly: Block = {
        slug: 'text',
        imageAltText: 'Text',
        fields: [
          {
            name: 'title',
            type: 'text',
            localized: true,
          },
          {
            name: 'text',
            type: 'richText',
            localized: true,
          },
        ]
      }
      const global: GlobalConfig = {
        slug: "global",
        fields: [
          {
            name: 'simpleLocalizedField',
            type: 'text',
            localized: true,
          },
          {
            name: 'simpleNonLocalizedField',
            type: 'text',
          },
          {
            name: 'blocksField',
            type: 'blocks',
            blocks: [
              TestBlock
            ]
          },
        ]
      }
      const expected = [
        {
          name: 'simpleLocalizedField',
          type: 'text',
          localized: true,
        },
        {
          name: 'blocksField',
          type: 'blocks',
          blocks: [
            {
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'text',
                  type: 'richText',
                  localized: true,
                },
              ]
            }
          ]
        },
      ]
      expect(getLocalizedFields(global.fields)).toEqual(expected)
    })
    */
  });

  /**
   * @see https://github.com/payloadcms/plugin-seo
   *
   * payloadcms/plugin-seo adds localized fields.
   * If there are no other localized fields, we don't
   * want to submit to Crowdin.
   */
  describe('payloadcms/plugin-seo tests', () => {
    const seoFields: Field[] = [
      {
        name: 'meta',
        label: 'SEO',
        type: 'group',
        fields: [
          /**{
            "name": "overview",
            "label": "Overview",
            "type": "ui",
            "admin": {
              "components": {}
            }
          },*/
          {
            name: 'title',
            type: 'text',
            localized: true,
            admin: {
              components: {},
            },
          },
          {
            name: 'description',
            type: 'textarea',
            localized: true,
            admin: {
              components: {},
            },
          },
          /**{
            "name": "preview",
            "label": "Preview",
            "type": "ui",
            "admin": {
              "components": {}
            }
          }**/
        ],
      },
    ];

    it('includes payloadcms/plugin-seo localized fields if there are no localized fields on the collection/global', () => {
      const nonLocalizedFieldCollection: Field[] = [
        {
          name: 'textLocalizedField',
          type: 'text',
        },
        {
          name: 'richTextLocalizedField',
          type: 'richText',
        },
        {
          name: 'textareaLocalizedField',
          type: 'text',
        },
      ];
      const fields: Field[] = [...nonLocalizedFieldCollection, ...seoFields];
      expect(getLocalizedFields({ fields })).toEqual([
        {
          fields: [
            {
              admin: {
                components: {},
              },
              localized: true,
              name: 'title',
              type: 'text',
            },
            {
              admin: {
                components: {},
              },
              localized: true,
              name: 'description',
              type: 'textarea',
            },
          ],
          label: 'SEO',
          name: 'meta',
          type: 'group',
        },
      ]);
    });

    it('includes payloadcms/plugin-seo localized fields if there are localized fields on the collection/global', () => {
      const localizedFieldCollection: Field[] = [
        {
          name: 'textLocalizedField',
          type: 'text',
          localized: true,
        },
        {
          name: 'richTextLocalizedField',
          type: 'richText',
          localized: true,
        },
        {
          name: 'textareaLocalizedField',
          type: 'text',
          localized: true,
        },
      ];
      const fields: Field[] = [...localizedFieldCollection, ...seoFields];
      expect(getLocalizedFields({ fields })).toMatchInlineSnapshot(`
        [
          {
            "localized": true,
            "name": "textLocalizedField",
            "type": "text",
          },
          {
            "localized": true,
            "name": "richTextLocalizedField",
            "type": "richText",
          },
          {
            "localized": true,
            "name": "textareaLocalizedField",
            "type": "text",
          },
          {
            "fields": [
              {
                "admin": {
                  "components": {},
                },
                "localized": true,
                "name": "title",
                "type": "text",
              },
              {
                "admin": {
                  "components": {},
                },
                "localized": true,
                "name": "description",
                "type": "textarea",
              },
            ],
            "label": "SEO",
            "name": "meta",
            "type": "group",
          },
        ]
      `);
    });

    it('includes payloadcms/plugin-seo localized fields if there are localized fields within tabs on the collection/global', () => {
      const localizedFieldCollection: Field[] = [
        {
          type: 'tabs',
          tabs: [
            {
              label: 'Content',
              fields: [
                {
                  name: 'unusedField',
                  type: 'text',
                  localized: true,
                  admin: {
                    description:
                      'This field is not used, it has been added to activate CrowdIn localization for SEO fields. It will be removed in a future release.',
                  },
                  label: 'Unused Field',
                  hooks: {},
                  access: {},
                },
                {
                  type: 'collapsible',
                  label: 'Hero',
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: 'hero',
                      type: 'group',
                      localized: true,
                      fields: [
                        {
                          name: 'title',
                          type: 'richText',
                          editor: slateEditor({
                            admin: {
                              elements: [],
                              leaves: ['bold'],
                            },
                          }),
                          label: 'Title',
                          hooks: {},
                          access: {},
                        },
                        {
                          name: 'text',
                          type: 'richText',
                          editor: slateEditor({
                            admin: {
                              elements: [],
                              leaves: ['bold'],
                            },
                          }),
                          label: 'Text',
                          hooks: {},
                          access: {},
                        },
                      ],
                      label: 'Hero',
                      hooks: {},
                      access: {},
                      admin: {},
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: 'Promo',
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: 'promo',
                      type: 'relationship',
                      relationTo: 'promos',
                      hasMany: false,
                      label: 'Promo',
                      hooks: {},
                      access: {},
                      admin: {},
                    },
                  ],
                },
              ],
            },
            {
              label: 'SEO',
              fields: [
                {
                  name: 'meta',
                  label: 'SEO',
                  type: 'group',
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      localized: true,
                      admin: {
                        components: {},
                      },
                      label: 'Title',
                      hooks: {},
                      access: {},
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                      localized: true,
                      admin: {
                        components: {},
                      },
                      label: 'Description',
                      hooks: {},
                      access: {},
                    },
                    {
                      name: 'image',
                      label: 'Meta Image',
                      type: 'upload',
                      localized: true,
                      relationTo: 'share-images',
                      admin: {
                        description:
                          'Maximum upload file size: 12MB. Recommended file size for images is <500KB.',
                        components: {},
                      },
                      hooks: {},
                      access: {},
                    },
                  ],
                  hooks: {},
                  access: {},
                  admin: {},
                },
              ],
            },
          ],
          admin: {},
        },
        {
          name: 'crowdinArticleDirectory',
          type: 'relationship',
          relationTo: 'crowdin-article-directories',
          hasMany: false,
          label: 'Crowdin Article Directory',
          hooks: {},
          access: {},
          admin: {},
        },
        {
          name: '_status',
          label: {
            ar: 'الحالة',
            az: 'Status',
            bg: 'Статус',
            cs: 'Stav',
            de: 'Status',
            en: 'Status',
            es: 'Estado',
            fa: 'وضعیت',
            fr: 'Statut',
            hr: 'Status',
            hu: 'Állapot',
            it: 'Stato',
            ja: 'ステータス',
            my: 'အခြေအနေ',
            nb: 'Status',
            nl: 'Status',
            pl: 'Status',
            pt: 'Status',
            ro: 'Status',
            ru: 'Статус',
            sv: 'Status',
            th: 'สถานะ',
            tr: 'Durum',
            ua: 'Статус',
            vi: 'Trạng thái',
            zh: '状态',
          },
          type: 'select',
          options: [
            {
              label: {
                ar: 'مسودة',
                az: 'Qaralama',
                bg: 'Чернова',
                cs: 'Koncept',
                de: 'Entwurf',
                en: 'Draft',
                es: 'Borrador',
                fa: 'پیش‌نویس',
                fr: 'Brouillon',
                hr: 'Nacrt',
                hu: 'Piszkozat',
                it: 'Bozza',
                ja: 'ドラフト',
                my: 'မူကြမ်း',
                nb: 'Utkast',
                nl: 'Concept',
                pl: 'Szkic',
                pt: 'Rascunho',
                ro: 'Proiect',
                ru: 'Черновик',
                sv: 'Utkast',
                th: 'ฉบับร่าง',
                tr: 'Taslak',
                ua: 'Чернетка',
                vi: 'Bản nháp',
                zh: '草稿',
              },
              value: 'draft',
            },
            {
              label: {
                ar: 'تم النشر',
                az: 'Dərc edilmiş',
                bg: 'Публикувано',
                cs: 'Publikováno',
                de: 'Veröffentlicht',
                en: 'Published',
                es: 'Publicado',
                fa: 'انتشار یافته',
                fr: 'Publié',
                hr: 'Objavljeno',
                hu: 'Közzétett',
                it: 'Pubblicato',
                ja: '公開済み',
                my: 'တင်ပြီးပြီ။',
                nb: 'Publisert',
                nl: 'Gepubliceerd',
                pl: 'Opublikowano',
                pt: 'Publicado',
                ro: 'Publicat',
                ru: 'Опубликовано',
                sv: 'Publicerad',
                th: 'เผยแพร่แล้ว',
                tr: 'Yayınlandı',
                ua: 'Опубліковано',
                vi: 'Đã xuất bản',
                zh: '已发布',
              },
              value: 'published',
            },
          ],
          defaultValue: 'draft',
          admin: {
            disableBulkEdit: true,
            components: {},
          },
          hooks: {},
          access: {},
        },
        {
          name: 'updatedAt',
          label: 'Updated At',
          type: 'date',
          admin: {
            hidden: true,
            disableBulkEdit: true,
          },
          hooks: {},
          access: {},
        },
        {
          name: 'createdAt',
          label: 'Created At',
          type: 'date',
          admin: {
            hidden: true,
            disableBulkEdit: true,
          },
          hooks: {},
          access: {},
        },
      ];
      const fields: Field[] = localizedFieldCollection;
      expect(getLocalizedFields({ fields })).toMatchInlineSnapshot(`
        [
          {
            "access": {},
            "admin": {
              "description": "This field is not used, it has been added to activate CrowdIn localization for SEO fields. It will be removed in a future release.",
            },
            "hooks": {},
            "label": "Unused Field",
            "localized": true,
            "name": "unusedField",
            "type": "text",
          },
          {
            "access": {},
            "admin": {},
            "fields": [
              {
                "access": {},
                "editor": [Function],
                "hooks": {},
                "label": "Title",
                "name": "title",
                "type": "richText",
              },
              {
                "access": {},
                "editor": [Function],
                "hooks": {},
                "label": "Text",
                "name": "text",
                "type": "richText",
              },
            ],
            "hooks": {},
            "label": "Hero",
            "localized": true,
            "name": "hero",
            "type": "group",
          },
          {
            "access": {},
            "admin": {},
            "fields": [
              {
                "access": {},
                "admin": {
                  "components": {},
                },
                "hooks": {},
                "label": "Title",
                "localized": true,
                "name": "title",
                "type": "text",
              },
              {
                "access": {},
                "admin": {
                  "components": {},
                },
                "hooks": {},
                "label": "Description",
                "localized": true,
                "name": "description",
                "type": "textarea",
              },
            ],
            "hooks": {},
            "label": "SEO",
            "name": "meta",
            "type": "group",
          },
        ]
      `);
    });
  });
});
