import type { CollectionConfig, Field } from 'payload';
import { syncDocumentSource } from 'payload-localization-adapters';
import { isLocalizedField } from '../../utilities';

const disabledInternal: Field = {
  name: 'internal',
  type: 'text',
  localized: true,
  custom: { crowdinSync: { disable: true } },
};

describe('syncDocumentSource (Crowdin isLocalized)', () => {
  it('includes Crowdin-disabled fields unless a predicate is passed', async () => {
    const collection: CollectionConfig = {
      slug: 'pages',
      fields: [
        { name: 'title', type: 'text', localized: true },
        disabledInternal,
      ],
    };
    const json: object[] = [];

    await syncDocumentSource({
      writer: {
        writeJson: async ({ fileData }) => {
          if (typeof fileData === 'object') {
            json.push(fileData);
          }
        },
        writeHtml: async () => undefined,
      },
      collection,
      fields: collection.fields,
      doc: { title: 'Home', internal: 'Secret' },
      previousDoc: { title: 'Old', internal: 'Old secret' },
    });

    expect(json).toEqual([{ title: 'Home', internal: 'Secret' }]);
  });

  it('honours the Crowdin localized-field predicate when it is passed', async () => {
    const collection: CollectionConfig = {
      slug: 'pages',
      fields: [
        { name: 'title', type: 'text', localized: true },
        disabledInternal,
      ],
    };
    const json: object[] = [];

    await syncDocumentSource({
      writer: {
        writeJson: async ({ fileData }) => {
          if (typeof fileData === 'object') {
            json.push(fileData);
          }
        },
        writeHtml: async () => undefined,
      },
      collection,
      fields: collection.fields,
      doc: { title: 'Home', internal: 'Secret' },
      previousDoc: { title: 'Old', internal: 'Old secret' },
      isLocalized: isLocalizedField,
    });

    expect(json).toEqual([{ title: 'Home' }]);
  });
});
