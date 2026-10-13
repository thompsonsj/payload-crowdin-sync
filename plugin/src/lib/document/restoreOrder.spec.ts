import type { Field } from 'payload';
import { restoreOrder } from './restoreOrder';

describe('fn: restoreOrder (document)', () => {
  it('reorders array items to match the source document', () => {
    const fields: Field[] = [
      {
        name: 'items',
        type: 'array',
        fields: [{ name: 'title', type: 'text', localized: true }],
      },
    ];
    const document = {
      items: [
        { id: 'b', title: 'Second' },
        { id: 'a', title: 'First' },
      ],
    };
    const updateDocument = {
      items: [
        { id: 'a', title: 'Premier' },
        { id: 'b', title: 'Deuxième' },
      ],
    };
    expect(restoreOrder({ updateDocument, document, fields })).toEqual({
      items: [
        { id: 'b', title: 'Deuxième' },
        { id: 'a', title: 'Premier' },
      ],
    });
  });
});
