import type { Field } from 'payload';
import { buildCrowdinJsonObject, getLocalizedFields } from '../..';

/**
 * #186: restoreVersion loads the current document with `locale: 'all'` and
 * passes that as `previousDoc` to afterChange. Localized array/blocks fields
 * are then locale maps (`{ en: [...], de_DE: [...] }`), not arrays.
 * `buildCrowdinJsonObject` calls `.map` and throws.
 */
const localizedArrayFields: Field[] = [
  {
    name: 'title',
    type: 'text',
    localized: true,
  },
  {
    name: 'items',
    type: 'array',
    localized: true,
    fields: [
      {
        name: 'label',
        type: 'text',
        localized: true,
      },
    ],
  },
];

const localeAllDoc = {
  title: {
    en: 'Hello',
    de_DE: 'Hallo',
  },
  items: {
    en: [{ id: 'item-1', label: { en: 'One' } }],
    de_DE: [{ id: 'item-1', label: { de_DE: 'Eins' } }],
  },
};

describe('fn: buildCrowdinJsonObject: restoreVersion previousDoc (#186)', () => {
  it('does not throw when a localized array is a locale map', () => {
    expect(
      buildCrowdinJsonObject({
        doc: localeAllDoc,
        fields: getLocalizedFields({ fields: localizedArrayFields }),
      }),
    ).toEqual({
      title: {
        en: 'Hello',
        de_DE: 'Hallo',
      },
    });
  });

  it('does not throw when localized blocks are a locale map', () => {
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
                name: 'textField',
                type: 'text',
                localized: true,
              },
            ],
          },
        ],
      },
    ];
    expect(
      buildCrowdinJsonObject({
        doc: {
          layout: {
            en: [
              {
                id: 'block-1',
                blockType: 'basic',
                textField: { en: 'Hello' },
              },
            ],
            de_DE: [
              {
                id: 'block-1',
                blockType: 'basic',
                textField: { de_DE: 'Hallo' },
              },
            ],
          },
        },
        fields: getLocalizedFields({ fields }),
      }),
    ).toEqual({});
  });
});
