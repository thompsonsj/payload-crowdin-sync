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

  it('preserves inherited localization when flattening row children', () => {
    const global: GlobalConfig = {
      slug: 'global',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'textInheritedLocalizedFieldInRowField',
              type: 'text',
            },
          ],
        },
      ],
    };

    expect(
      getRowLocalizedFields({ fields: global.fields, localizedParent: true }),
    ).toEqual([
      {
        name: 'textInheritedLocalizedFieldInRowField',
        type: 'text',
      },
    ]);
  });

  it('preserves inherited localization when flattening collapsible children', () => {
    const global: GlobalConfig = {
      slug: 'global',
      fields: [
        {
          label: 'Collapsible Field',
          type: 'collapsible',
          fields: [
            {
              name: 'textInheritedLocalizedFieldInCollapsible',
              type: 'text',
            },
          ],
        },
      ],
    };

    expect(
      getCollapsibleLocalizedFields({
        fields: global.fields,
        localizedParent: true,
      }),
    ).toEqual([
      {
        name: 'textInheritedLocalizedFieldInCollapsible',
        type: 'text',
      },
    ]);
  });

  it('returns empty array for row when localizedParent is false and no fields are explicitly localized', () => {
    const global: GlobalConfig = {
      slug: 'global',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'nonLocalizedField',
              type: 'text',
            },
          ],
        },
      ],
    };

    expect(getRowLocalizedFields({ fields: global.fields })).toEqual([]);
  });

  it('returns empty array for collapsible when localizedParent is false and no fields are explicitly localized', () => {
    const global: GlobalConfig = {
      slug: 'global',
      fields: [
        {
          label: 'Collapsible',
          type: 'collapsible',
          fields: [
            {
              name: 'nonLocalizedField',
              type: 'text',
            },
          ],
        },
      ],
    };

    expect(getCollapsibleLocalizedFields({ fields: global.fields })).toEqual([]);
  });

  it('filters by type json when localizedParent is true for row fields', () => {
    const global: GlobalConfig = {
      slug: 'global',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'textField',
              type: 'text',
            },
            {
              name: 'richTextField',
              type: 'richText',
            },
          ],
        },
      ],
    };

    const result = getRowLocalizedFields({
      fields: global.fields,
      localizedParent: true,
      type: 'json',
    });

    expect(result).toEqual([
      {
        name: 'textField',
        type: 'text',
      },
    ]);
  });

  it('filters by type html when localizedParent is true for collapsible fields', () => {
    const global: GlobalConfig = {
      slug: 'global',
      fields: [
        {
          label: 'Collapsible',
          type: 'collapsible',
          fields: [
            {
              name: 'textField',
              type: 'text',
            },
            {
              name: 'richTextField',
              type: 'richText',
            },
          ],
        },
      ],
    };

    const result = getCollapsibleLocalizedFields({
      fields: global.fields,
      localizedParent: true,
      type: 'html',
    });

    expect(result).toEqual([
      {
        name: 'richTextField',
        type: 'richText',
      },
    ]);
  });

  it('handles multiple row fields with mixed localizedParent and explicit localization', () => {
    const global: GlobalConfig = {
      slug: 'global',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'explicitLocalizedField',
              type: 'text',
              localized: true,
            },
            {
              name: 'nonLocalizedField',
              type: 'text',
            },
          ],
        },
      ],
    };

    // Without localizedParent, only explicitly localized fields are included
    expect(getRowLocalizedFields({ fields: global.fields })).toEqual([
      {
        name: 'explicitLocalizedField',
        type: 'text',
        localized: true,
      },
    ]);

    // With localizedParent, all text/richText/textarea fields are included
    expect(
      getRowLocalizedFields({ fields: global.fields, localizedParent: true }),
    ).toEqual([
      {
        name: 'explicitLocalizedField',
        type: 'text',
        localized: true,
      },
      {
        name: 'nonLocalizedField',
        type: 'text',
      },
    ]);
  });
});