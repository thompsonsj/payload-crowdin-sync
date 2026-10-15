import type { Field } from 'payload';
import {
  buildHtmlObject,
  buildJsonObject,
  buildUpdateObject,
} from '.';

const titleAndBody: Field[] = [
  { name: 'title', type: 'text', localized: true },
  { name: 'body', type: 'richText', localized: true },
  { name: 'slug', type: 'text' },
];

const slateBody = [
  {
    type: 'p',
    children: [{ text: 'Hello' }],
  },
];

describe('buildJsonObject', () => {
  it('omits missing values and non-localized fields', () => {
    expect(
      buildJsonObject({
        doc: {
          id: '1',
          title: 'Home',
          slug: 'home',
        },
        fields: titleAndBody,
      }),
    ).toEqual({ title: 'Home' });
  });

  it('omits rich text (that belongs in the html object)', () => {
    expect(
      buildJsonObject({
        doc: {
          title: 'Home',
          body: slateBody,
        },
        fields: titleAndBody,
      }),
    ).toEqual({ title: 'Home' });
  });

  it('keys array items by id so round-trip does not depend on order', () => {
    expect(
      buildJsonObject({
        doc: {
          title: 'Home',
          items: [
            { id: 'a', label: 'One' },
            { id: 'b', label: 'Two' },
          ],
        },
        fields: [
          { name: 'title', type: 'text', localized: true },
          {
            name: 'items',
            type: 'array',
            localized: true,
            fields: [{ name: 'label', type: 'text', localized: true }],
          },
        ],
      }),
    ).toEqual({
      title: 'Home',
      items: {
        a: { label: 'One' },
        b: { label: 'Two' },
      },
    });
  });

  it('keys blocks by id and blockType', () => {
    expect(
      buildJsonObject({
        doc: {
          layout: [
            {
              id: 'hero-1',
              blockType: 'hero',
              heading: 'Welcome',
            },
          ],
        },
        fields: [
          {
            name: 'layout',
            type: 'blocks',
            localized: true,
            blocks: [
              {
                slug: 'hero',
                fields: [{ name: 'heading', type: 'text', localized: true }],
              },
            ],
          },
        ],
      }),
    ).toEqual({
      layout: {
        'hero-1': {
          hero: { heading: 'Welcome' },
        },
      },
    });
  });

  it('skips locale maps from locale: all instead of calling .map', () => {
    expect(
      buildJsonObject({
        doc: {
          title: { en: 'Hello', de_DE: 'Hallo' },
          items: {
            en: [{ id: 'item-1', label: { en: 'One' } }],
            de_DE: [{ id: 'item-1', label: { de_DE: 'Eins' } }],
          },
        },
        fields: [
          { name: 'title', type: 'text', localized: true },
          {
            name: 'items',
            type: 'array',
            localized: true,
            fields: [{ name: 'label', type: 'text', localized: true }],
          },
        ],
      }),
    ).toEqual({
      title: { en: 'Hello', de_DE: 'Hallo' },
    });
  });
});

describe('buildHtmlObject', () => {
  it('omits strings (that belong in the json object)', () => {
    expect(
      buildHtmlObject({
        doc: {
          title: 'Home',
          body: slateBody,
        },
        fields: titleAndBody,
      }),
    ).toEqual({ body: slateBody });
  });

  it('uses dotted paths for nested rich text', () => {
    expect(
      buildHtmlObject({
        doc: {
          items: [
            {
              id: 'a',
              copy: slateBody,
            },
          ],
        },
        fields: [
          {
            name: 'items',
            type: 'array',
            localized: true,
            fields: [{ name: 'copy', type: 'richText', localized: true }],
          },
        ],
      }),
    ).toEqual({
      'items.a.copy': slateBody,
    });
  });
});

describe('buildUpdateObject', () => {
  it('merges dotted html paths into json and restores array order', () => {
    const fields: Field[] = [
      { name: 'title', type: 'text', localized: true },
      {
        name: 'items',
        type: 'array',
        localized: true,
        fields: [
          { name: 'label', type: 'text', localized: true },
          { name: 'copy', type: 'richText', localized: true },
        ],
      },
    ];
    const document = {
      title: 'Home',
      items: [
        { id: 'a', label: 'One', copy: slateBody },
        { id: 'b', label: 'Two', copy: slateBody },
      ],
    };

    expect(
      buildUpdateObject({
        jsonObject: {
          title: 'Accueil',
          items: {
            b: { label: 'Deux' },
            a: { label: 'Un' },
          },
        },
        htmlObject: {
          'items.a.copy': slateBody,
          'items.b.copy': slateBody,
        },
        fields,
        document,
      }),
    ).toEqual({
      title: 'Accueil',
      items: [
        { id: 'a', label: 'Un', copy: slateBody },
        { id: 'b', label: 'Deux', copy: slateBody },
      ],
    });
  });

  it('does not mutate the caller json or html slices', () => {
    const fields: Field[] = [
      { name: 'title', type: 'text', localized: true },
      {
        name: 'items',
        type: 'array',
        localized: true,
        fields: [
          { name: 'label', type: 'text', localized: true },
          { name: 'copy', type: 'richText', localized: true },
        ],
      },
    ];
    const jsonObject = {
      title: 'Accueil',
      items: { a: { label: 'Un' } },
    };
    const htmlObject = { 'items.a.copy': slateBody };
    const jsonBefore = structuredClone(jsonObject);
    const htmlBefore = structuredClone(htmlObject);

    buildUpdateObject({
      jsonObject,
      htmlObject,
      fields,
      document: {
        title: 'Home',
        items: [{ id: 'a', label: 'One', copy: slateBody }],
      },
    });

    expect(jsonObject).toEqual(jsonBefore);
    expect(htmlObject).toEqual(htmlBefore);
  });
});
