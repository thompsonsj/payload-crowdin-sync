import type { CollectionConfig } from 'payload';
import { syncDocumentSource } from './syncSource';
import type { SourceWriter } from './types';

const slate = [{ type: 'p', children: [{ text: 'Hello' }] }];
const slateFr = [{ type: 'p', children: [{ text: 'Bonjour' }] }];

const Pages: CollectionConfig = {
  slug: 'pages',
  fields: [
    { name: 'title', type: 'text', localized: true },
    { name: 'body', type: 'richText', localized: true },
    { name: 'slug', type: 'text' },
  ],
};

const memoryWriter = () => {
  const json: object[] = [];
  const html: { name: string; value: unknown }[] = [];
  const writer: SourceWriter = {
    writeJson: async ({ fileData }) => {
      json.push(fileData);
    },
    writeHtml: async ({ name, value }) => {
      html.push({ name, value });
    },
  };
  return { writer, json, html };
};

describe('syncDocumentSource', () => {
  it('writes json when string fields change', async () => {
    const { writer, json, html } = memoryWriter();

    await syncDocumentSource({
      writer,
      collection: Pages,
      fields: Pages.fields,
      doc: { title: 'Home', body: slate, slug: 'home' },
      previousDoc: { title: 'Old', body: slate, slug: 'home' },
    });

    expect(json).toEqual([{ title: 'Home' }]);
    expect(html).toEqual([]);
  });

  it('writes html when a rich text field changes', async () => {
    const { writer, json, html } = memoryWriter();

    await syncDocumentSource({
      writer,
      collection: Pages,
      fields: Pages.fields,
      doc: { title: 'Home', body: slateFr },
      previousDoc: { title: 'Home', body: slate },
    });

    expect(json).toEqual([]);
    expect(html).toEqual([{ name: 'body', value: slateFr }]);
  });

  it('writes nothing when the document slice is unchanged', async () => {
    const { writer, json, html } = memoryWriter();
    const doc = { title: 'Home', body: slate };

    await syncDocumentSource({
      writer,
      collection: Pages,
      fields: Pages.fields,
      doc,
      previousDoc: doc,
    });

    expect(json).toEqual([]);
    expect(html).toEqual([]);
  });

  it('writes both slices when alwaysUpdate is set even if unchanged', async () => {
    const { writer, json, html } = memoryWriter();
    const doc = { title: 'Home', body: slate };

    await syncDocumentSource({
      writer,
      collection: Pages,
      fields: Pages.fields,
      doc,
      previousDoc: doc,
      alwaysUpdate: true,
    });

    expect(json).toEqual([{ title: 'Home' }]);
    expect(html).toEqual([{ name: 'body', value: slate }]);
  });

  it('does not write an empty json slice unless alwaysUpdate is set', async () => {
    const { writer, json } = memoryWriter();

    await syncDocumentSource({
      writer,
      collection: Pages,
      fields: Pages.fields,
      doc: { slug: 'home' },
      previousDoc: { slug: 'old' },
    });

    expect(json).toEqual([]);
  });
});
