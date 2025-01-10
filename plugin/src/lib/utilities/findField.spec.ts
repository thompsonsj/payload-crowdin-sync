import BookDemo from './tests/inline-snapshots/collections/BookDemo';
import { findField } from '.';
import type { Block, Field } from 'payload';

describe('fn: findField', () => {
  it('finds a top-level field', () => {
    expect(
      findField({
        dotNotation: 'logoTitle',
        fields: BookDemo.fields,
      })
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
        fields: BookDemo.fields,
      })
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
        fields: BookDemo.fields,
      })
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

    const fields: Field[] = [
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
        fields,
      })
    ).toMatchInlineSnapshot(`
      {
        "localized": true,
        "name": "url",
        "type": "text",
      }
    `);
  });
});
