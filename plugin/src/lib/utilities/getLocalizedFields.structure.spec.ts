import type { Field } from 'payload';
import { getLocalizedFields } from '.';

const text = (name: string, localized = true): Field => ({
  name,
  type: 'text',
  ...(localized && { localized: true }),
});

const richText = (name: string): Field => ({
  name,
  type: 'richText',
  localized: true,
});

describe('fn: getLocalizedFields output structure', () => {
  it('returns top-level fields first, then tab, collapsible and row contents', () => {
    const fields: Field[] = [
      { type: 'row', fields: [text('inRow')] },
      { type: 'collapsible', label: 'c', fields: [text('inCollapsible')] },
      { type: 'tabs', tabs: [{ label: 'Tab', fields: [text('inTab')] }] },
      text('topLevel'),
    ];
    expect(getLocalizedFields({ fields }).map((field) => field.name)).toEqual([
      'topLevel',
      'inTab',
      'inCollapsible',
      'inRow',
    ]);
  });

  it('converts named tabs to groups', () => {
    const fields: Field[] = [
      {
        type: 'tabs',
        tabs: [{ name: 'namedTab', fields: [text('inTab')] }],
      },
    ];
    expect(getLocalizedFields({ fields })).toEqual([
      { type: 'group', name: 'namedTab', fields: [text('inTab')] },
    ]);
  });

  it('keeps only slug and localized fields for blocks, and drops blocks without localized fields', () => {
    const fields: Field[] = [
      {
        name: 'layout',
        type: 'blocks',
        blocks: [
          {
            slug: 'withText',
            labels: { singular: 'With text', plural: 'With text' },
            fields: [text('title'), text('internal', false)],
          },
          { slug: 'withoutText', fields: [text('internal', false)] },
        ],
      },
    ];
    expect(getLocalizedFields({ fields })).toEqual([
      {
        name: 'layout',
        type: 'blocks',
        blocks: [{ slug: 'withText', fields: [text('title')] }],
      },
    ]);
  });

  it('drops groups, arrays and blocks with no fields of the requested type', () => {
    const fields: Field[] = [
      { name: 'textGroup', type: 'group', fields: [text('title')] },
      { name: 'htmlGroup', type: 'group', fields: [richText('body')] },
      { name: 'textArray', type: 'array', fields: [text('title')] },
      {
        name: 'layout',
        type: 'blocks',
        blocks: [
          { slug: 'textBlock', fields: [text('title')] },
          { slug: 'htmlBlock', fields: [richText('body')] },
        ],
      },
    ];
    expect(getLocalizedFields({ fields, type: 'html' })).toEqual([
      { name: 'htmlGroup', type: 'group', fields: [richText('body')] },
      {
        name: 'layout',
        type: 'blocks',
        blocks: [{ slug: 'htmlBlock', fields: [richText('body')] }],
      },
    ]);
  });

  it('treats children of a localized group as localized', () => {
    const fields: Field[] = [
      {
        name: 'localizedGroup',
        type: 'group',
        localized: true,
        fields: [text('child', false)],
      },
    ];
    expect(getLocalizedFields({ fields })).toEqual(fields);
  });

  it('flattens layout fields with a custom isLocalized predicate', () => {
    const fields: Field[] = [
      text('topLevel', false),
      {
        type: 'collapsible',
        label: 'c',
        fields: [text('inCollapsible', false)],
      },
      { type: 'row', fields: [text('inRow', false)] },
    ];
    expect(
      getLocalizedFields({ fields, isLocalized: (field) => !!field }),
    ).toEqual([
      text('topLevel', false),
      text('inCollapsible', false),
      text('inRow', false),
    ]);
  });

  it('marks unnamed tab fields as localized using the default predicate', () => {
    const fields: Field[] = [
      {
        type: 'tabs',
        tabs: [{ label: 'Tab', fields: [text('inTab', false)] }],
      },
    ];
    expect(
      getLocalizedFields({ fields, isLocalized: (field) => !!field }),
    ).toEqual([text('inTab', false)]);
    expect(
      getLocalizedFields({
        fields,
        localizedParent: true,
        isLocalized: (field) => !!field,
      }),
    ).toEqual([{ ...text('inTab', false), localized: true }]);
  });
});
