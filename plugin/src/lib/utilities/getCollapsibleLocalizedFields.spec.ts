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

  it('returns empty array when no collapsible fields are present', () => {
    const global: GlobalConfig = {
      slug: 'global',
      fields: [
        {
          name: 'textLocalizedField',
          type: 'text',
          localized: true,
        },
      ],
    };

    expect(getCollapsibleLocalizedFields({ fields: global.fields })).toEqual(
      [],
    );
  });

  it('returns empty array when no row fields are present', () => {
    const global: GlobalConfig = {
      slug: 'global',
      fields: [
        {
          name: 'textLocalizedField',
          type: 'text',
          localized: true,
        },
      ],
    };

    expect(getRowLocalizedFields({ fields: global.fields })).toEqual([]);
  });

  it('does not include non-localized fields without localizedParent from a collapsible field', () => {
    const global: GlobalConfig = {
      slug: 'global',
      fields: [
        {
          label: 'Collapsible Field',
          type: 'collapsible',
          fields: [
            {
              name: 'nonLocalized',
              type: 'text',
            },
          ],
        },
      ],
    };

    // localizedParent defaults to false — non-localized fields should be excluded
    expect(
      getCollapsibleLocalizedFields({ fields: global.fields }),
    ).toEqual([]);
  });

  it('does not include non-localized fields without localizedParent from a row field', () => {
    const global: GlobalConfig = {
      slug: 'global',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'nonLocalized',
              type: 'text',
            },
          ],
        },
      ],
    };

    // localizedParent defaults to false — non-localized fields should be excluded
    expect(getRowLocalizedFields({ fields: global.fields })).toEqual([]);
  });

  it('flattens multiple collapsible fields and collects all localized children', () => {
    const global: GlobalConfig = {
      slug: 'global',
      fields: [
        {
          label: 'Collapsible A',
          type: 'collapsible',
          fields: [
            {
              name: 'fieldA',
              type: 'text',
              localized: true,
            },
          ],
        },
        {
          label: 'Collapsible B',
          type: 'collapsible',
          fields: [
            {
              name: 'fieldB',
              type: 'text',
              localized: true,
            },
            {
              name: 'notIncluded',
              type: 'text',
            },
          ],
        },
      ],
    };

    expect(
      getCollapsibleLocalizedFields({ fields: global.fields }),
    ).toEqual([
      { name: 'fieldA', type: 'text', localized: true },
      { name: 'fieldB', type: 'text', localized: true },
    ]);
  });

  it('flattens multiple row fields and collects all localized children', () => {
    const global: GlobalConfig = {
      slug: 'global',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'firstName', type: 'text', localized: true },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'lastName', type: 'text', localized: true },
            { name: 'age', type: 'number' },
          ],
        },
      ],
    };

    expect(getRowLocalizedFields({ fields: global.fields })).toEqual([
      { name: 'firstName', type: 'text', localized: true },
      { name: 'lastName', type: 'text', localized: true },
    ]);
  });

  it('getCollapsibleLocalizedFields filters by type when type is specified', () => {
    const global: GlobalConfig = {
      slug: 'global',
      fields: [
        {
          label: 'Collapsible',
          type: 'collapsible',
          fields: [
            { name: 'textField', type: 'text', localized: true },
            { name: 'richTextField', type: 'richText', localized: true },
          ],
        },
      ],
    };

    // type 'json' should include text but not richText
    const jsonFields = getCollapsibleLocalizedFields({
      fields: global.fields,
      type: 'json',
    });
    expect(jsonFields.map((f: any) => f.name)).toContain('textField');
    expect(jsonFields.map((f: any) => f.name)).not.toContain('richTextField');

    // type 'html' should include richText but not text
    const htmlFields = getCollapsibleLocalizedFields({
      fields: global.fields,
      type: 'html',
    });
    expect(htmlFields.map((f: any) => f.name)).toContain('richTextField');
    expect(htmlFields.map((f: any) => f.name)).not.toContain('textField');
  });

  it('getRowLocalizedFields filters by type when type is specified', () => {
    const global: GlobalConfig = {
      slug: 'global',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'textField', type: 'text', localized: true },
            { name: 'richTextField', type: 'richText', localized: true },
          ],
        },
      ],
    };

    // type 'json' should include text but not richText
    const jsonFields = getRowLocalizedFields({
      fields: global.fields,
      type: 'json',
    });
    expect(jsonFields.map((f: any) => f.name)).toContain('textField');
    expect(jsonFields.map((f: any) => f.name)).not.toContain('richTextField');
  });
});