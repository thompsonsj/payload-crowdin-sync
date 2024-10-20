import payload from 'payload';
import { initPayloadTest } from '../helpers/config';
import { getArticleDirectory, utilities } from 'plugin';
import NestedFieldCollection from '../../collections/NestedFieldCollection';
import { fixture } from './lexical-editor-with-blocks-inside-array.fixture';
import nock from 'nock';
import { extractLexicalBlockContent } from 'plugin/src/lib/utilities/lexical';
import { mockCrowdinClient } from 'plugin/src/lib/api/mock/crowdin-api-responses';
import { pluginConfig } from '../helpers/plugin-config';
import {
  CrowdinArticleDirectory,
  NestedFieldCollection as NestedFieldCollectionType,
} from '../../payload-types';
import { getFilesByParent } from 'plugin/src/lib/api/helpers';
import { getRelationshipId } from 'plugin/src/lib/utilities/payload';

const pluginOptions = pluginConfig();
const mockClient = mockCrowdinClient(pluginOptions);

describe('Lexical editor with multiple blocks', () => {
  beforeAll(async () => {
    await initPayloadTest({});
  });

  afterEach((done) => {
    if (!nock.isDone()) {
      throw new Error(
        `Not all nock interceptors were used: ${JSON.stringify(
          nock.pendingMocks()
        )}`
      );
    }
    nock.cleanAll();
    done();
  });

  afterAll(async () => {
    if (typeof payload?.db?.destroy === 'function') {
      await payload.db.destroy(payload);
    }
  });

  it('builds a Crowdin HTML object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(3)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(5)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(5)
      .reply(200, mockClient.createFile({}));

    const doc: NestedFieldCollectionType = (await payload.create({
      collection: 'nested-field-collection',
      data: fixture,
    })) as any;

    const arrayIds =
      (doc.items || []).map((item) => item.id) || ([] as string[]);
    const blockIds =
      (doc.items || []).map(
        (item) => (item.block || []).find((x) => x !== undefined)?.id
      ) || ([] as string[]);

    expect(
      utilities.buildCrowdinHtmlObject({
        doc,
        fields: NestedFieldCollection.fields,
      })
    ).toEqual({
      [`items.${arrayIds[0]}.block.${blockIds[0]}.basicBlockLexical.content`]: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Lexical fields nested within complex layouts - such as this one (a ',
                  type: 'text',
                  version: 1,
                },
                {
                  detail: 0,
                  format: 16,
                  mode: 'normal',
                  style: '',
                  text: 'blocks',
                  type: 'text',
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: ' field in an ',
                  type: 'text',
                  version: 1,
                },
                {
                  detail: 0,
                  format: 16,
                  mode: 'normal',
                  style: '',
                  text: 'array',
                  type: 'text',
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: ' item within a ',
                  type: 'text',
                  version: 1,
                },
                {
                  detail: 0,
                  format: 16,
                  mode: 'normal',
                  style: '',
                  text: 'tab',
                  type: 'text',
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: '), are supported.',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      },
      [`items.${arrayIds[1]}.block.${blockIds[1]}.basicBlockLexical.content`]: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'If you add custom blocks, these will also be translated!',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
            {
              fields: {
                blockName: '',
                blockType: 'highlight',
                content: {
                  root: {
                    children: [
                      {
                        children: [
                          {
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: 'Note a key difference with regular blocks - all ',
                            type: 'text',
                            version: 1,
                          },
                          {
                            detail: 0,
                            format: 16,
                            mode: 'normal',
                            style: '',
                            text: 'text',
                            type: 'text',
                            version: 1,
                          },
                          {
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: ', ',
                            type: 'text',
                            version: 1,
                          },
                          {
                            detail: 0,
                            format: 16,
                            mode: 'normal',
                            style: '',
                            text: 'textarea',
                            type: 'text',
                            version: 1,
                          },
                          {
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: ' and ',
                            type: 'text',
                            version: 1,
                          },
                          {
                            detail: 0,
                            format: 16,
                            mode: 'normal',
                            style: '',
                            text: 'richText',
                            type: 'text',
                            version: 1,
                          },
                          {
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: ' fields will be sent to Crowdin regardless of whether or not they are ',
                            type: 'text',
                            version: 1,
                          },
                          {
                            children: [
                              {
                                detail: 0,
                                format: 0,
                                mode: 'normal',
                                style: '',
                                text: 'localized fields',
                                type: 'text',
                                version: 1,
                              },
                            ],
                            direction: 'ltr',
                            fields: {
                              linkType: 'custom',
                              newTab: false,
                              url: 'https://payloadcms.com/docs/configuration/localization#field-by-field-localization',
                            },
                            format: '',
                            indent: 0,
                            type: 'link',
                            version: 2,
                          },
                          {
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: '.',
                            type: 'text',
                            version: 1,
                          },
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        type: 'paragraph',
                        version: 1,
                      },
                    ],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    type: 'root',
                    version: 1,
                  },
                },
                heading: {
                  title: 'Block configuration in Lexical fields',
                },
                id: '6712ec66a81e050bf5f31b43',
              },
              format: '',
              type: 'block',
              version: 2,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      },
    });
  });

  it('builds a Crowdin JSON object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(2)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(5)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(5)
      .reply(200, mockClient.createFile({}));

    const doc: NestedFieldCollectionType = (await payload.create({
      collection: 'nested-field-collection',
      data: fixture,
    })) as any;
    const ids = (doc.items || []).map((item) => item.id) || ([] as string[]);

    expect(
      utilities.buildCrowdinJsonObject({
        doc,
        fields: NestedFieldCollection.fields,
      })
    ).toEqual({
      items: {
        [`${ids[0]}`]: {
          heading: 'Nested Lexical fields are supported',
        },
        [`${ids[1]}`]: {
          heading:
            'Nested Lexical fields are supported - and blocks in that Lexical field are also translated',
        },
      },
    });
  });

  it('builds a Payload update object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .twice()
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(5)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(5)
      .reply(200, mockClient.createFile({}));

    const doc: NestedFieldCollectionType = (await payload.create({
      collection: 'nested-field-collection',
      data: fixture,
    })) as any;

    const arrayIds =
      (doc.items || []).map((item) => item.id) || ([] as string[]);
    const blockIds =
      (doc.items || []).map(
        (item) => (item.block || []).find((x) => x !== undefined)?.id
      ) || ([] as string[]);
    const firstLexicalBlock = doc.items?.[1]?.block?.[0]?.content;

    const lexicalBlockIds = firstLexicalBlock
      ? extractLexicalBlockContent(firstLexicalBlock.root).map(
          (block) => block.id
        )
      : ['lexical-block-id-not-found'];

    const crowdinHtmlObject = utilities.buildCrowdinHtmlObject({
      doc,
      fields: NestedFieldCollection.fields,
    });
    const crowdinJsonObject = utilities.buildCrowdinJsonObject({
      doc,
      fields: NestedFieldCollection.fields,
    });
    expect(
      utilities.buildPayloadUpdateObject({
        crowdinJsonObject,
        crowdinHtmlObject,
        fields: NestedFieldCollection.fields,
        document: doc,
      })
    ).toEqual({
      items: [
        {
          block: [
            {
              blockType: 'basicBlockLexical',
              content: {
                root: {
                  children: [
                    {
                      children: [
                        {
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: 'Lexical fields nested within complex layouts - such as this one (a ',
                          type: 'text',
                          version: 1,
                        },
                        {
                          detail: 0,
                          format: 16,
                          mode: 'normal',
                          style: '',
                          text: 'blocks',
                          type: 'text',
                          version: 1,
                        },
                        {
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: ' field in an ',
                          type: 'text',
                          version: 1,
                        },
                        {
                          detail: 0,
                          format: 16,
                          mode: 'normal',
                          style: '',
                          text: 'array',
                          type: 'text',
                          version: 1,
                        },
                        {
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: ' item within a ',
                          type: 'text',
                          version: 1,
                        },
                        {
                          detail: 0,
                          format: 16,
                          mode: 'normal',
                          style: '',
                          text: 'tab',
                          type: 'text',
                          version: 1,
                        },
                        {
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: '), are supported.',
                          type: 'text',
                          version: 1,
                        },
                      ],
                      direction: 'ltr',
                      format: '',
                      indent: 0,
                      type: 'paragraph',
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  type: 'root',
                  version: 1,
                },
              },
              id: `${blockIds[0]}`,
            },
          ],
          heading: 'Nested Lexical fields are supported',
          id: `${arrayIds[0]}`,
        },
        {
          block: [
            {
              blockType: 'basicBlockLexical',
              content: {
                root: {
                  children: [
                    {
                      children: [
                        {
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: 'If you add custom blocks, these will also be translated!',
                          type: 'text',
                          version: 1,
                        },
                      ],
                      direction: 'ltr',
                      format: '',
                      indent: 0,
                      type: 'paragraph',
                      version: 1,
                    },
                    {
                      fields: {
                        blockName: '',
                        blockType: 'highlight',
                        content: {
                          root: {
                            children: [
                              {
                                children: [
                                  {
                                    detail: 0,
                                    format: 0,
                                    mode: 'normal',
                                    style: '',
                                    text: 'Note a key difference with regular blocks - all ',
                                    type: 'text',
                                    version: 1,
                                  },
                                  {
                                    detail: 0,
                                    format: 16,
                                    mode: 'normal',
                                    style: '',
                                    text: 'text',
                                    type: 'text',
                                    version: 1,
                                  },
                                  {
                                    detail: 0,
                                    format: 0,
                                    mode: 'normal',
                                    style: '',
                                    text: ', ',
                                    type: 'text',
                                    version: 1,
                                  },
                                  {
                                    detail: 0,
                                    format: 16,
                                    mode: 'normal',
                                    style: '',
                                    text: 'textarea',
                                    type: 'text',
                                    version: 1,
                                  },
                                  {
                                    detail: 0,
                                    format: 0,
                                    mode: 'normal',
                                    style: '',
                                    text: ' and ',
                                    type: 'text',
                                    version: 1,
                                  },
                                  {
                                    detail: 0,
                                    format: 16,
                                    mode: 'normal',
                                    style: '',
                                    text: 'richText',
                                    type: 'text',
                                    version: 1,
                                  },
                                  {
                                    detail: 0,
                                    format: 0,
                                    mode: 'normal',
                                    style: '',
                                    text: ' fields will be sent to Crowdin regardless of whether or not they are ',
                                    type: 'text',
                                    version: 1,
                                  },
                                  {
                                    children: [
                                      {
                                        detail: 0,
                                        format: 0,
                                        mode: 'normal',
                                        style: '',
                                        text: 'localized fields',
                                        type: 'text',
                                        version: 1,
                                      },
                                    ],
                                    direction: 'ltr',
                                    fields: {
                                      linkType: 'custom',
                                      newTab: false,
                                      url: 'https://payloadcms.com/docs/configuration/localization#field-by-field-localization',
                                    },
                                    format: '',
                                    indent: 0,
                                    type: 'link',
                                    version: 2,
                                  },
                                  {
                                    detail: 0,
                                    format: 0,
                                    mode: 'normal',
                                    style: '',
                                    text: '.',
                                    type: 'text',
                                    version: 1,
                                  },
                                ],
                                direction: 'ltr',
                                format: '',
                                indent: 0,
                                type: 'paragraph',
                                version: 1,
                              },
                            ],
                            direction: 'ltr',
                            format: '',
                            indent: 0,
                            type: 'root',
                            version: 1,
                          },
                        },
                        heading: {
                          title: 'Block configuration in Lexical fields',
                        },
                        id: `${lexicalBlockIds[0]}`,
                      },
                      format: '',
                      type: 'block',
                      version: 2,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  type: 'root',
                  version: 1,
                },
              },
              id: `${blockIds[1]}`,
            },
          ],
          heading:
            'Nested Lexical fields are supported - and blocks in that Lexical field are also translated',
          id: `${arrayIds[1]}`,
        },
      ],
    });
  });

  it('associates a parent Crowdin article directory with a lexical blocks Crowdin article directory', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(2)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(5)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(5)
      .reply(200, mockClient.createFile({}));

    const create = await payload.create({
      collection: 'nested-field-collection',
      data: fixture,
    });
    // update now that a Crowdin article directory is available
    const doc: NestedFieldCollectionType = (await payload.update({
      id: create.id,
      collection: 'nested-field-collection',
      data: {
        title: 'Test nested field collection',
      },
    })) as any;

    const files = await getFilesByParent(
      `${getRelationshipId(doc.crowdinArticleDirectory)}`,
      payload
    );

    expect(files.length).toEqual(2);

    expect(files[0].fileData).toMatchInlineSnapshot(`
      {
        "html": "<p>Note a key difference with regular blocks - all <code>text</code>, <code>textarea</code> and <code>richText</code> fields will be sent to Crowdin regardless of whether or not they are <a href="https://payloadcms.com/docs/configuration/localization#field-by-field-localization">localized fields</a>.</p>",
      }
    `);
    expect(files[1].fileData).toMatchInlineSnapshot(`
      {
        "json": {
          "blocks": {
            "6712ec66a81e050bf5f31b43": {
              "highlight": {
                "heading": {
                  "title": "Block configuration in Lexical fields",
                },
              },
            },
          },
        },
      }
    `);
  });
});
