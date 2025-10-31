import type { GlobalConfig } from 'payload';
import { getCollapsibleLocalizedFields, getRowLocalizedFields } from '.';

describe('fn: getCollapsibleLocalizedFields', () => {
  it('includes only localized fields from a collapsible field', () => {
    const global: GlobalConfig = {
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
          label: 'Collapsible Field',
          type: 'collapsible',
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
        name: 'textLocalizedFieldInCollapsibleField',
        type: 'text',
        localized: true,
      },
    ];
    expect(getCollapsibleLocalizedFields({ fields: global.fields })).toEqual(
      expected,
    );
  });

  it('includes only localized fields from a row field', () => {
    const global: GlobalConfig = {
      slug: 'global',
      fields: [
        {
          name: 'textLocalizedField',
          type: 'text',
          localized: true,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'textLocalizedFieldInRowField',
              type: 'text',
              localized: true,
            },
            {
              name: 'textNonLocalizedFieldInRowField',
              type: 'text',
            },
            {
              name: 'textareaLocalizedFieldInRowField',
              type: 'textarea',
              localized: true,
            },
          ],
        },
      ],
    };
    const expected = [
      {
        name: 'textLocalizedFieldInRowField',
        type: 'text',
        localized: true,
      },
      {
        name: 'textareaLocalizedFieldInRowField',
        type: 'textarea',
        localized: true,
      },
    ];
    expect(getRowLocalizedFields({ fields: global.fields })).toEqual(
      expected,
    );
  });
});
