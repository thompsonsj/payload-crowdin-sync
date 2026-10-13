import type { Field } from 'payload';
import { getLocalizedFields } from './localizedFields';

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

const isRichText = (field: Field) => field.type === 'richText';

describe('fn: getLocalizedFields (document)', () => {
  it('filters leaves with include, and drops containers that have no matching fields', () => {
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
    expect(getLocalizedFields({ fields, include: isRichText })).toEqual([
      { name: 'htmlGroup', type: 'group', fields: [richText('body')] },
      {
        name: 'layout',
        type: 'blocks',
        blocks: [{ slug: 'htmlBlock', fields: [richText('body')] }],
      },
    ]);
  });

  it('does not take a Crowdin json/html type option', () => {
    const fields: Field[] = [text('title'), richText('body')];
    expect(getLocalizedFields({ fields, include: isRichText })).toEqual([
      richText('body'),
    ]);
    expect(getLocalizedFields({ fields })).toEqual([text('title'), richText('body')]);
  });
});
