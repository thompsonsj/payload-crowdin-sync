import type { Field } from 'payload';
import { applyDocumentSlice } from './applySlice';

const slate = [{ type: 'p', children: [{ text: 'Hello' }] }];

const fields: Field[] = [
  { name: 'title', type: 'text', localized: true },
  { name: 'body', type: 'richText', localized: true },
];

describe('applyDocumentSlice', () => {
  it('turns a json/html slice into a Payload update, restoring array order', () => {
    const fieldsWithItems: Field[] = [
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
        { id: 'a', label: 'One', copy: slate },
        { id: 'b', label: 'Two', copy: slate },
      ],
    };

    expect(
      applyDocumentSlice({
        slice: {
          json: {
            title: 'Accueil',
            items: {
              b: { label: 'Deux' },
              a: { label: 'Un' },
            },
          },
          html: {
            'items.a.copy': slate,
            'items.b.copy': slate,
          },
        },
        fields: fieldsWithItems,
        document,
      }),
    ).toEqual({
      title: 'Accueil',
      items: [
        { id: 'a', label: 'Un', copy: slate },
        { id: 'b', label: 'Deux', copy: slate },
      ],
    });
  });

  it('applies json-only slices without html', () => {
    expect(
      applyDocumentSlice({
        slice: { json: { title: 'Accueil' } },
        fields,
        document: { title: 'Home', body: slate },
      }),
    ).toEqual({ title: 'Accueil' });
  });
});
