import type { Field } from 'payload';
import {
  getCollapsibleLocalizedFields,
  getFieldSlugs,
  getLocalizedFields,
  getRowLocalizedFields,
  isLocalizedField,
  reLocalizeField,
} from '.';

const text = (name: string, extra?: object): Field => ({
  name,
  type: 'text',
  localized: true,
  ...extra,
});

const richText = (name: string): Field => ({
  name,
  type: 'richText',
  localized: true,
});

describe('Crowdin getLocalizedFields wrappers', () => {
  it('excludes a localized text field based on the admin description', () => {
    const fields: Field[] = [
      text('textLocalizedField'),
      text('textLocalizedFieldWithExcludeDescription', {
        admin: {
          description: 'Not sent to Crowdin. Localize in the CMS.',
        },
      }),
    ];
    expect(getLocalizedFields({ fields })).toEqual([text('textLocalizedField')]);
  });

  it('excludes a localized text field based on the custom field property', () => {
    const fields: Field[] = [
      text('textLocalizedField'),
      text('textLocalizedFieldWithExcludeCustomProperty', {
        custom: {
          crowdinSync: {
            disable: true,
          },
        },
      }),
    ];
    expect(getLocalizedFields({ fields })).toEqual([text('textLocalizedField')]);
  });

  it('excludes a localized parent with custom.crowdinSync.disable', () => {
    const fields: Field[] = [
      text('title'),
      {
        name: 'arrayField',
        type: 'array',
        localized: true,
        custom: {
          crowdinSync: {
            disable: true,
          },
        },
        fields: [{ name: 'itemTitle', type: 'text' }],
      },
    ];
    expect(getLocalizedFields({ fields })).toEqual([text('title')]);
  });

  it('maps type html to richText leaves', () => {
    expect(
      getLocalizedFields({
        fields: [text('title'), richText('body')],
        type: 'html',
      }),
    ).toEqual([richText('body')]);
  });

  it('maps type json to non-richText leaves', () => {
    expect(
      getLocalizedFields({
        fields: [text('title'), richText('body')],
        type: 'json',
      }),
    ).toEqual([text('title')]);
  });

  it('isLocalizedField excludes Crowdin-disabled fields', () => {
    expect(
      isLocalizedField(
        text('internalTitle', {
          admin: {
            description: 'Not sent to Crowdin. Localize in the CMS.',
          },
        }),
      ),
    ).toBe(false);
    expect(
      isLocalizedField(
        text('internalTitle', {
          custom: { crowdinSync: { disable: true } },
        }),
      ),
    ).toBe(false);
  });

  it('reLocalizeField excludes Crowdin-disabled fields', () => {
    const fields: Field[] = [
      { name: 'textLocalizedField', type: 'text' },
      {
        name: 'textLocalizedFieldWithExcludeDescription',
        type: 'text',
        admin: {
          description: 'Not sent to Crowdin. Localize in the CMS.',
        },
      },
    ];
    expect(
      getLocalizedFields({ fields, isLocalized: reLocalizeField }),
    ).toEqual([{ name: 'textLocalizedField', type: 'text' }]);
  });

  it('getCollapsibleLocalizedFields filters by Crowdin type', () => {
    const fields: Field[] = [
      {
        label: 'Collapsible',
        type: 'collapsible',
        fields: [text('textField'), richText('richTextField')],
      },
    ];
    expect(
      getCollapsibleLocalizedFields({ fields, type: 'json' }).map(
        (field: Field) => ('name' in field ? field.name : undefined),
      ),
    ).toEqual(['textField']);
    expect(
      getCollapsibleLocalizedFields({ fields, type: 'html' }).map(
        (field: Field) => ('name' in field ? field.name : undefined),
      ),
    ).toEqual(['richTextField']);
  });

  it('getRowLocalizedFields filters by Crowdin type', () => {
    const fields: Field[] = [
      {
        type: 'row',
        fields: [text('textField'), richText('richTextField')],
      },
    ];
    expect(
      getRowLocalizedFields({ fields, type: 'json' }).map((field: Field) =>
        'name' in field ? field.name : undefined,
      ),
    ).toEqual(['textField']);
  });

  it('getFieldSlugs sees html-filtered fields', () => {
    const htmlFields = getLocalizedFields({
      fields: [text('title'), richText('content')],
      type: 'html',
    });
    expect(getFieldSlugs(htmlFields)).toEqual(['content']);
  });
});
