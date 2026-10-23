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
  const json: Array<string | object> = [];
  const html: { name: string; value: unknown }[] = [];
  const deleted: string[] = [];
  const writer: SourceWriter = {
    writeJson: async ({ fileData }) => {
      json.push(fileData);
    },
    writeHtml: async ({ name, value }) => {
      html.push({ name, value });
    },
    deleteHtml: async ({ name }) => {
      deleted.push(name);
    },
  };
  return { writer, json, html, deleted };
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

  it('writes html when a rich text field is added', async () => {
    const { writer, json, html } = memoryWriter();

    await syncDocumentSource({
      writer,
      collection: Pages,
      fields: Pages.fields,
      doc: { title: 'Home', body: slate },
      previousDoc: { title: 'Home' },
    });

    expect(json).toEqual([]);
    expect(html).toEqual([{ name: 'body', value: slate }]);
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

  it('writes empty json when alwaysUpdate is set', async () => {
    const { writer, json } = memoryWriter();

    await syncDocumentSource({
      writer,
      collection: Pages,
      fields: Pages.fields,
      doc: { slug: 'home' },
      previousDoc: { slug: 'home' },
      alwaysUpdate: true,
    });

    expect(json).toEqual([{}]);
  });

  it('writes json and html when both slices change', async () => {
    const { writer, json, html } = memoryWriter();

    await syncDocumentSource({
      writer,
      collection: Pages,
      fields: Pages.fields,
      doc: { title: 'Home', body: slateFr },
      previousDoc: { title: 'Old', body: slate },
    });

    expect(json).toEqual([{ title: 'Home' }]);
    expect(html).toEqual([{ name: 'body', value: slateFr }]);
  });

  it('writes only the rich text fields that changed', async () => {
    const TwoBodies: CollectionConfig = {
      slug: 'pages',
      fields: [
        { name: 'intro', type: 'richText', localized: true },
        { name: 'body', type: 'richText', localized: true },
      ],
    };
    const { writer, html } = memoryWriter();

    await syncDocumentSource({
      writer,
      collection: TwoBodies,
      fields: TwoBodies.fields,
      doc: { intro: slateFr, body: slate },
      previousDoc: { intro: slate, body: slate },
    });

    expect(html).toEqual([{ name: 'intro', value: slateFr }]);
  });

  it('does not write html if json write rejects', async () => {
    const html: { name: string }[] = [];
    const writer: SourceWriter = {
      writeJson: async () => {
        throw new Error('json failed');
      },
      writeHtml: async ({ name }) => {
        html.push({ name });
      },
    };

    await expect(
      syncDocumentSource({
        writer,
        collection: Pages,
        fields: Pages.fields,
        doc: { title: 'Home', body: slateFr },
        previousDoc: { title: 'Old', body: slate },
      }),
    ).rejects.toThrow('json failed');
    expect(html).toEqual([]);
  });

  it('continues writing other html files if one write fails', async () => {
    const TwoBodies: CollectionConfig = {
      slug: 'pages',
      fields: [
        { name: 'intro', type: 'richText', localized: true },
        { name: 'body', type: 'richText', localized: true },
      ],
    };
    const written: string[] = [];
    const writer: SourceWriter = {
      writeJson: async () => undefined,
      writeHtml: async ({ name }) => {
        if (name === 'intro') {
          throw new Error('intro failed');
        }
        written.push(name);
      },
    };

    await expect(
      syncDocumentSource({
        writer,
        collection: TwoBodies,
        fields: TwoBodies.fields,
        doc: { intro: slateFr, body: slateFr },
        previousDoc: { intro: slate, body: slate },
      }),
    ).rejects.toThrow('intro failed');
    expect(written).toEqual(['body']);
  });

  it('rejects with AggregateError when more than one html write fails', async () => {
    const TwoBodies: CollectionConfig = {
      slug: 'pages',
      fields: [
        { name: 'intro', type: 'richText', localized: true },
        { name: 'body', type: 'richText', localized: true },
      ],
    };
    const writer: SourceWriter = {
      writeJson: async () => undefined,
      writeHtml: async ({ name }) => {
        throw new Error(`${name} failed`);
      },
    };

    const error = await syncDocumentSource({
      writer,
      collection: TwoBodies,
      fields: TwoBodies.fields,
      doc: { intro: slateFr, body: slateFr },
      previousDoc: { intro: slate, body: slate },
    }).catch((reason) => reason);

    expect(error).toBeInstanceOf(AggregateError);
    expect((error as AggregateError).errors.map((item) => item.message)).toEqual(
      ['intro failed', 'body failed'],
    );
  });

  it('asks the writer to delete html when a rich-text path is removed', async () => {
    const { writer, json, html, deleted } = memoryWriter();

    await syncDocumentSource({
      writer,
      collection: Pages,
      fields: Pages.fields,
      doc: { title: 'Home' },
      previousDoc: { title: 'Home', body: slate },
    });

    expect(json).toEqual([]);
    expect(html).toEqual([]);
    expect(deleted).toEqual(['body']);
  });

  it('deletes only the removed rich-text paths', async () => {
    const TwoBodies: CollectionConfig = {
      slug: 'pages',
      fields: [
        { name: 'intro', type: 'richText', localized: true },
        { name: 'body', type: 'richText', localized: true },
      ],
    };
    const { writer, html, deleted } = memoryWriter();

    await syncDocumentSource({
      writer,
      collection: TwoBodies,
      fields: TwoBodies.fields,
      doc: { body: slate },
      previousDoc: { intro: slate, body: slate },
    });

    expect(html).toEqual([]);
    expect(deleted).toEqual(['intro']);
  });

  it('does not delete html if the writer has no deleteHtml', async () => {
    const writer: SourceWriter = {
      writeJson: async () => undefined,
      writeHtml: async () => undefined,
    };

    await expect(
      syncDocumentSource({
        writer,
        collection: Pages,
        fields: Pages.fields,
        doc: { title: 'Home' },
        previousDoc: { title: 'Home', body: slate },
      }),
    ).resolves.toBeUndefined();
  });

  it('rejects when deleteHtml fails after other deletes settle', async () => {
    const TwoBodies: CollectionConfig = {
      slug: 'pages',
      fields: [
        { name: 'intro', type: 'richText', localized: true },
        { name: 'body', type: 'richText', localized: true },
      ],
    };
    const deleted: string[] = [];
    const writer: SourceWriter = {
      writeJson: async () => undefined,
      writeHtml: async () => undefined,
      deleteHtml: async ({ name }) => {
        if (name === 'intro') {
          throw new Error('intro delete failed');
        }
        deleted.push(name);
      },
    };

    await expect(
      syncDocumentSource({
        writer,
        collection: TwoBodies,
        fields: TwoBodies.fields,
        doc: {},
        previousDoc: { intro: slate, body: slate },
      }),
    ).rejects.toThrow('intro delete failed');
    expect(deleted).toEqual(['body']);
  });
});
