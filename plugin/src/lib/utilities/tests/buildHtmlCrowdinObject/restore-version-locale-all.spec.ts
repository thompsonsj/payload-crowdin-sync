import type { Field } from 'payload';
import { buildCrowdinHtmlObject } from '../..';

/**
 * #186: restoreVersion previousDoc uses locale: all. Localized array/blocks
 * are locale maps, not arrays. The HTML builder must skip them instead of
 * calling `.map`.
 */
const slateParagraph = (text: string) => [
  {
    type: 'p',
    children: [{ text }],
  },
];

describe('fn: buildCrowdinHtmlObject: restoreVersion previousDoc (#186)', () => {
  it('skips a localized array that is a locale map', () => {
    const fields: Field[] = [
      {
        name: 'content',
        type: 'richText',
        localized: true,
      },
      {
        name: 'items',
        type: 'array',
        localized: true,
        fields: [
          {
            name: 'body',
            type: 'richText',
            localized: true,
          },
        ],
      },
    ];

    expect(
      buildCrowdinHtmlObject({
        doc: {
          content: slateParagraph('Hello'),
          items: {
            en: [{ id: 'item-1', body: slateParagraph('One') }],
            de_DE: [{ id: 'item-1', body: slateParagraph('Eins') }],
          },
        },
        fields,
      }),
    ).toEqual({
      content: slateParagraph('Hello'),
    });
  });

  it('skips localized blocks that are a locale map', () => {
    const fields: Field[] = [
      {
        name: 'layout',
        type: 'blocks',
        localized: true,
        blocks: [
          {
            slug: 'basic',
            fields: [
              {
                name: 'richTextField',
                type: 'richText',
                localized: true,
              },
            ],
          },
        ],
      },
    ];

    expect(
      buildCrowdinHtmlObject({
        doc: {
          layout: {
            en: [
              {
                id: 'block-1',
                blockType: 'basic',
                richTextField: slateParagraph('Hello'),
              },
            ],
            de_DE: [
              {
                id: 'block-1',
                blockType: 'basic',
                richTextField: slateParagraph('Hallo'),
              },
            ],
          },
        },
        fields,
      }),
    ).toEqual({});
  });
});
