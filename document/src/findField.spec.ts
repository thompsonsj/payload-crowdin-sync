import type { Block, Field } from 'payload';
import { findField } from '.';

const fields: Field[] = [
  {
    name: 'hero',
    type: 'group',
    localized: true,
    fields: [
      {
        name: 'title',
        type: 'richText',
        editor: () => undefined,
      },
    ],
  },
  {
    name: 'form',
    type: 'group',
    localized: true,
    fields: [
      { type: 'text', name: 'title' },
      {
        type: 'group',
        name: 'content',
        localized: true,
        fields: [
          {
            name: 'items',
            type: 'array',
            localized: true,
            fields: [{ type: 'text', name: 'text' }],
          },
        ],
      },
    ],
  },
  {
    name: 'logoTitle',
    type: 'text',
    required: true,
    localized: true,
  },
];

describe('fn: findField', () => {
  it('finds a top-level field', () => {
    expect(
      findField({
        dotNotation: 'logoTitle',
        fields,
      }),
    ).toMatchInlineSnapshot(`
      {
        "localized": true,
        "name": "logoTitle",
        "required": true,
        "type": "text",
      }
    `);
  });
  it('finds a field nested in a group', () => {
    expect(
      findField({
        dotNotation: 'form.title',
        fields,
      }),
    ).toMatchInlineSnapshot(`
      {
        "editor": [Function],
        "name": "title",
        "type": "richText",
      }
    `);
  });
  it('finds a field nested in an array in a group', () => {
    expect(
      findField({
        dotNotation: 'form.content.items.6474baaf73b854f4d464e38f.text',
        fields,
      }),
    ).toMatchInlineSnapshot(`
      {
        "name": "text",
        "type": "text",
      }
    `);
  });
  it('finds a block field definition', () => {
    const TestBlockOne: Block = {
      slug: 'testBlockOne',
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
        },
        {
          name: 'text',
          type: 'text',
          localized: true,
        },
        {
          name: 'select',
          type: 'select',
          localized: true,
          options: ['one', 'two'],
        },
      ],
    };
    const TestBlockTwo: Block = {
      slug: 'testBlockTwo',
      fields: [
        {
          name: 'url',
          type: 'text',
          localized: true,
        },
      ],
    };
    const blockFields: Field[] = [
      {
        name: 'title',
        type: 'text',
        localized: true,
      },
      // select not supported yet
      {
        name: 'select',
        type: 'select',
        localized: true,
        options: ['one', 'two'],
      },
      {
        name: 'blocksField',
        type: 'blocks',
        blocks: [TestBlockOne, TestBlockTwo],
      },
    ];
    expect(
      findField({
        dotNotation: 'blocksField.6474baaf73b854f4d464e38f.testBlockTwo.url',
        fields: blockFields,
      }),
    ).toMatchInlineSnapshot(`
      {
        "localized": true,
        "name": "url",
        "type": "text",
      }
    `);
  });
});
