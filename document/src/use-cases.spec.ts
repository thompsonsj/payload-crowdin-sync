import type { CollectionConfig, Field } from 'payload';
import {
  containsLocalizedFields,
  findField,
  getBlockFields,
  getLocalizedFields,
  isLocalizedField,
  reLocalizeField,
  restoreOrder,
  traverseFields,
} from '.';

type Doc = Record<string, any>;

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

/**
 * Walk a document using a field schema and copy matching values.
 * Import/export plugins use this shape: filter with `getLocalizedFields`,
 * then `traverseFields` to read or write the document.
 */
const pickBySchema = (fields: Field[], source: Doc): Doc => {
  const target: Doc = {};
  traverseFields(
    fields,
    { source, target },
    {
      skip: (field, ctx) => ctx.source?.[field.name] == null,
      group(field, ctx) {
        ctx.target[field.name] = pickBySchema(
          field.fields,
          ctx.source[field.name],
        );
      },
      array(field, ctx) {
        ctx.target[field.name] = ctx.source[field.name].map((item: Doc) => ({
          id: item.id,
          ...pickBySchema(field.fields, item),
        }));
      },
      blocks(field, ctx) {
        ctx.target[field.name] = ctx.source[field.name].flatMap((item: Doc) => {
          const blockFields = getBlockFields(field, item.blockType);
          if (blockFields.length === 0) {
            return [];
          }
          return [
            {
              id: item.id,
              blockType: item.blockType,
              ...pickBySchema(blockFields, item),
            },
          ];
        });
      },
      leaf(field, ctx) {
        ctx.target[field.name] = ctx.source[field.name];
      },
    },
  );
  return target;
};

describe('use case: pick localized fields for export', () => {
  // Same collection as the README example.
  const Pages: CollectionConfig = {
    slug: 'pages',
    fields: [
      { name: 'title', type: 'text', localized: true },
      { name: 'slug', type: 'text' },
      {
        name: 'hero',
        type: 'group',
        fields: [
          { name: 'heading', type: 'text', localized: true },
          { name: 'image', type: 'upload', relationTo: 'media' },
        ],
      },
    ],
  };

  it('drops non-localized leaves and empty containers', () => {
    expect(getLocalizedFields({ fields: Pages.fields })).toEqual([
      { name: 'title', type: 'text', localized: true },
      {
        name: 'hero',
        type: 'group',
        fields: [{ name: 'heading', type: 'text', localized: true }],
      },
    ]);
  });
});

describe('use case: export a nested document', () => {
  const fields: Field[] = [
    text('title'),
    { name: 'published', type: 'checkbox' },
    {
      name: 'hero',
      type: 'group',
      fields: [text('heading'), { name: 'image', type: 'upload', relationTo: 'media' }],
    },
    {
      name: 'items',
      type: 'array',
      fields: [text('label'), { name: 'url', type: 'text' }],
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        { slug: 'copy', fields: [richText('body')] },
        { slug: 'embed', fields: [{ name: 'url', type: 'text' }] },
      ],
    },
  ];

  it('copies localized values and keeps array/block ids', () => {
    const schema = getLocalizedFields({ fields });
    const doc = {
      title: 'Home',
      published: true,
      hero: { heading: 'Welcome', image: 'img-1' },
      items: [
        { id: 'a', label: 'One', url: '/one' },
        { id: 'b', label: 'Two', url: '/two' },
      ],
      layout: [
        { id: 'c', blockType: 'copy', body: [{ children: [{ text: 'Hello' }] }] },
        { id: 'd', blockType: 'embed', url: 'https://example.com' },
      ],
    };

    expect(pickBySchema(schema, doc)).toEqual({
      title: 'Home',
      hero: { heading: 'Welcome' },
      items: [
        { id: 'a', label: 'One' },
        { id: 'b', label: 'Two' },
      ],
      layout: [
        {
          id: 'c',
          blockType: 'copy',
          body: [{ children: [{ text: 'Hello' }] }],
        },
      ],
    });
  });
});

describe('use case: apply an update and restore editor order', () => {
  const fields: Field[] = [
    text('title'),
    {
      name: 'items',
      type: 'array',
      fields: [text('label')],
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [{ slug: 'copy', fields: [text('heading')] }],
    },
  ];

  it('keeps the CMS array and blocks order when translations arrive shuffled', () => {
    const document = {
      title: 'Home',
      items: [
        { id: 'b', label: 'Second' },
        { id: 'a', label: 'First' },
      ],
      layout: [
        { id: 'd', blockType: 'copy', heading: 'Footer' },
        { id: 'c', blockType: 'copy', heading: 'Intro' },
      ],
    };
    const updateDocument = {
      title: 'Accueil',
      items: [
        { id: 'a', label: 'Premier' },
        { id: 'b', label: 'Deuxième' },
      ],
      layout: [
        { id: 'c', blockType: 'copy', heading: 'Introduit' },
        { id: 'd', blockType: 'copy', heading: 'Pied' },
      ],
    };

    expect(restoreOrder({ updateDocument, document, fields })).toEqual({
      title: 'Accueil',
      items: [
        { id: 'b', label: 'Deuxième' },
        { id: 'a', label: 'Premier' },
      ],
      layout: [
        { id: 'd', blockType: 'copy', heading: 'Pied' },
        { id: 'c', blockType: 'copy', heading: 'Introduit' },
      ],
    });
  });
});

describe('use case: split rich text from strings', () => {
  const fields: Field[] = [text('title'), richText('body')];

  it('lets a consumer write HTML and JSON files from the same schema', () => {
    const html = getLocalizedFields({
      fields,
      include: (field) => field.type === 'richText',
    });
    const json = getLocalizedFields({
      fields,
      include: (field) => field.type !== 'richText',
    });

    expect(html).toEqual([richText('body')]);
    expect(json).toEqual([text('title')]);
  });
});

describe('use case: skip fields the consumer does not export', () => {
  const isLocalized: typeof isLocalizedField = (field, parent) =>
    isLocalizedField(field, parent) &&
    !(field as { custom?: { skipExport?: boolean } }).custom?.skipExport;

  it('wraps isLocalizedField instead of forking the walk', () => {
    const fields: Field[] = [
      text('title'),
      {
        name: 'internalName',
        type: 'text',
        localized: true,
        custom: { skipExport: true },
      },
    ];

    expect(getLocalizedFields({ fields, isLocalized })).toEqual([text('title')]);
    expect(containsLocalizedFields({ fields, isLocalized })).toBe(true);
  });
});

describe('use case: fields inside Lexical blocks have no localized flag', () => {
  it('passes reLocalizeField so text/textarea/richText still export', () => {
    const fields: Field[] = [
      {
        name: 'cta',
        type: 'group',
        fields: [
          { name: 'label', type: 'text' },
          { name: 'url', type: 'text' },
          { name: 'page', type: 'relationship', relationTo: 'pages' },
        ],
      },
    ];

    expect(
      getLocalizedFields({ fields, isLocalized: reLocalizeField }),
    ).toEqual([
      {
        name: 'cta',
        type: 'group',
        fields: [
          { name: 'label', type: 'text' },
          { name: 'url', type: 'text' },
        ],
      },
    ]);
  });
});

describe('use case: look up a field by path', () => {
  const fields: Field[] = [
    {
      name: 'hero',
      type: 'group',
      fields: [richText('heading')],
    },
    {
      name: 'items',
      type: 'array',
      fields: [text('label')],
    },
  ];

  it('finds the field for a nested file name such as items.<id>.label', () => {
    expect(
      findField({ dotNotation: 'hero.heading', fields })?.type,
    ).toBe('richText');
    expect(
      findField({
        dotNotation: 'items.6474baaf73b854f4d464e38f.label',
        fields,
      }),
    ).toEqual(text('label'));
  });
});
