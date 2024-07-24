import payload from 'payload';
import { initPayloadTest } from '../helpers/config';
import {
  getFilesByDocumentID,
  isDefined,
  payloadCrowdinSyncTranslationsApi,
  utilities,
} from 'plugin';
import Policies from '../../collections/Policies';
import { fixture } from './lexical-editor-with-multiple-blocks.fixture';
import nock from 'nock';
import { extractLexicalBlockContent } from 'plugin/src/lib/utilities/lexical';
import { mockCrowdinClient } from 'plugin/src/lib/api/mock/crowdin-api-responses';
import { pluginConfig } from '../helpers/plugin-config';

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

  it('extracts blocks into a format expected for a "blocks" field', async () => {
    expect(fixture && extractLexicalBlockContent(fixture.root))
      .toMatchInlineSnapshot(`
      [
        {
          "blockName": "",
          "blockType": "cta",
          "href": "https://www.npmjs.com/package/payload-crowdin-sync",
          "id": "65d67d2591c92e447e7472f7",
          "text": "Download payload-crowdin-sync on npm!",
          "type": "primary",
        },
        {
          "blockName": "",
          "blockType": "highlight",
          "color": "green",
          "content": {
            "root": {
              "children": [
                {
                  "children": [
                    {
                      "detail": 0,
                      "format": 0,
                      "mode": "normal",
                      "style": "",
                      "text": "The plugin parses your block configuration for the Lexical rich text editor. It extracts all block values from the rich text field and then treats this config/data combination as a regular \`blocks\` field.",
                      "type": "text",
                      "version": 1,
                    },
                  ],
                  "direction": "ltr",
                  "format": "",
                  "indent": 0,
                  "type": "paragraph",
                  "version": 1,
                },
                {
                  "children": [
                    {
                      "detail": 0,
                      "format": 0,
                      "mode": "normal",
                      "style": "",
                      "text": "Markers are placed in the html and this content is restored into the correct place on translation.",
                      "type": "text",
                      "version": 1,
                    },
                  ],
                  "direction": "ltr",
                  "format": "",
                  "indent": 0,
                  "type": "paragraph",
                  "version": 1,
                },
              ],
              "direction": "ltr",
              "format": "",
              "indent": 0,
              "type": "root",
              "version": 1,
            },
          },
          "heading": {
            "preTitle": "How the plugin handles blocks in the Lexical editor",
            "title": "Blocks are extracted into their own fields",
          },
          "id": "65d67d8191c92e447e7472f8",
        },
        {
          "blockName": "",
          "blockType": "imageText",
          "id": "65d67e2291c92e447e7472f9",
          "image": "65d67e6a7fb7e9426b3f9f5f",
          "title": "Testing a range of fields",
        },
      ]
    `);
  });

  it('builds a Crowdin HTML object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .twice()
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(4)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(4)
      .reply(200, mockClient.createFile({}));

    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: fixture,
      },
    });
    expect(
      utilities.buildCrowdinHtmlObject({
        doc: policy,
        fields: Policies.fields,
      })
    ).toMatchInlineSnapshot(`
      {
        "content": {
          "root": {
            "children": [
              {
                "children": [
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "Sample content for a Lexical rich text field with multiple blocks.",
                    "type": "text",
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "paragraph",
                "version": 1,
              },
              {
                "fields": {
                  "blockName": "",
                  "blockType": "cta",
                  "href": "https://www.npmjs.com/package/payload-crowdin-sync",
                  "id": "65d67d2591c92e447e7472f7",
                  "text": "Download payload-crowdin-sync on npm!",
                  "type": "primary",
                },
                "format": "",
                "type": "block",
                "version": 2,
              },
              {
                "children": [
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "A bulleted list in-between some blocks consisting of:",
                    "type": "text",
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "paragraph",
                "version": 1,
              },
              {
                "children": [
                  {
                    "children": [
                      {
                        "detail": 0,
                        "format": 0,
                        "mode": "normal",
                        "style": "",
                        "text": "one bullet list item; and",
                        "type": "text",
                        "version": 1,
                      },
                    ],
                    "direction": "ltr",
                    "format": "",
                    "indent": 0,
                    "type": "listitem",
                    "value": 1,
                    "version": 1,
                  },
                  {
                    "children": [
                      {
                        "detail": 0,
                        "format": 0,
                        "mode": "normal",
                        "style": "",
                        "text": "another!",
                        "type": "text",
                        "version": 1,
                      },
                    ],
                    "direction": "ltr",
                    "format": "",
                    "indent": 0,
                    "type": "listitem",
                    "value": 2,
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "listType": "bullet",
                "start": 1,
                "tag": "ul",
                "type": "list",
                "version": 1,
              },
              {
                "fields": {
                  "blockName": "",
                  "blockType": "highlight",
                  "color": "green",
                  "content": {
                    "root": {
                      "children": [
                        {
                          "children": [
                            {
                              "detail": 0,
                              "format": 0,
                              "mode": "normal",
                              "style": "",
                              "text": "The plugin parses your block configuration for the Lexical rich text editor. It extracts all block values from the rich text field and then treats this config/data combination as a regular \`blocks\` field.",
                              "type": "text",
                              "version": 1,
                            },
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
                          "type": "paragraph",
                          "version": 1,
                        },
                        {
                          "children": [
                            {
                              "detail": 0,
                              "format": 0,
                              "mode": "normal",
                              "style": "",
                              "text": "Markers are placed in the html and this content is restored into the correct place on translation.",
                              "type": "text",
                              "version": 1,
                            },
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
                          "type": "paragraph",
                          "version": 1,
                        },
                      ],
                      "direction": "ltr",
                      "format": "",
                      "indent": 0,
                      "type": "root",
                      "version": 1,
                    },
                  },
                  "heading": {
                    "preTitle": "How the plugin handles blocks in the Lexical editor",
                    "title": "Blocks are extracted into their own fields",
                  },
                  "id": "65d67d8191c92e447e7472f8",
                },
                "format": "",
                "type": "block",
                "version": 2,
              },
              {
                "fields": {
                  "blockName": "",
                  "blockType": "imageText",
                  "id": "65d67e2291c92e447e7472f9",
                  "image": "65d67e6a7fb7e9426b3f9f5f",
                  "title": "Testing a range of fields",
                },
                "format": "",
                "type": "block",
                "version": 2,
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "listitem",
                    "value": 1,
                    "version": 1,
                  },
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "listType": "bullet",
                "start": 1,
                "tag": "ul",
                "type": "list",
                "version": 1,
              },
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "type": "root",
            "version": 1,
          },
        },
      }
    `);
  });

  it('builds a Crowdin JSON object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(4)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(4)
      .reply(200, mockClient.createFile({}));

    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: fixture,
      },
    });
    expect(
      utilities.buildCrowdinJsonObject({
        doc: policy,
        fields: Policies.fields,
      })
    ).toMatchInlineSnapshot(`
      {
        "title": "Test policy",
      }
    `);
  });

  it('builds a Payload update object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(4)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(4)
      .reply(200, mockClient.createFile({}));

    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: fixture,
      },
    });
    const crowdinHtmlObject = utilities.buildCrowdinHtmlObject({
      doc: policy,
      fields: Policies.fields,
    });
    const crowdinJsonObject = utilities.buildCrowdinJsonObject({
      doc: policy,
      fields: Policies.fields,
    });
    expect(
      utilities.buildPayloadUpdateObject({
        crowdinJsonObject,
        crowdinHtmlObject,
        fields: Policies.fields,
        document: policy,
      })
    ).toMatchInlineSnapshot(`
      {
        "content": {
          "root": {
            "children": [
              {
                "children": [
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "Sample content for a Lexical rich text field with multiple blocks.",
                    "type": "text",
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "paragraph",
                "version": 1,
              },
              {
                "fields": {
                  "blockName": "",
                  "blockType": "cta",
                  "href": "https://www.npmjs.com/package/payload-crowdin-sync",
                  "id": "65d67d2591c92e447e7472f7",
                  "text": "Download payload-crowdin-sync on npm!",
                  "type": "primary",
                },
                "format": "",
                "type": "block",
                "version": 2,
              },
              {
                "children": [
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "A bulleted list in-between some blocks consisting of:",
                    "type": "text",
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "paragraph",
                "version": 1,
              },
              {
                "children": [
                  {
                    "children": [
                      {
                        "detail": 0,
                        "format": 0,
                        "mode": "normal",
                        "style": "",
                        "text": "one bullet list item; and",
                        "type": "text",
                        "version": 1,
                      },
                    ],
                    "direction": "ltr",
                    "format": "",
                    "indent": 0,
                    "type": "listitem",
                    "value": 1,
                    "version": 1,
                  },
                  {
                    "children": [
                      {
                        "detail": 0,
                        "format": 0,
                        "mode": "normal",
                        "style": "",
                        "text": "another!",
                        "type": "text",
                        "version": 1,
                      },
                    ],
                    "direction": "ltr",
                    "format": "",
                    "indent": 0,
                    "type": "listitem",
                    "value": 2,
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "listType": "bullet",
                "start": 1,
                "tag": "ul",
                "type": "list",
                "version": 1,
              },
              {
                "fields": {
                  "blockName": "",
                  "blockType": "highlight",
                  "color": "green",
                  "content": {
                    "root": {
                      "children": [
                        {
                          "children": [
                            {
                              "detail": 0,
                              "format": 0,
                              "mode": "normal",
                              "style": "",
                              "text": "The plugin parses your block configuration for the Lexical rich text editor. It extracts all block values from the rich text field and then treats this config/data combination as a regular \`blocks\` field.",
                              "type": "text",
                              "version": 1,
                            },
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
                          "type": "paragraph",
                          "version": 1,
                        },
                        {
                          "children": [
                            {
                              "detail": 0,
                              "format": 0,
                              "mode": "normal",
                              "style": "",
                              "text": "Markers are placed in the html and this content is restored into the correct place on translation.",
                              "type": "text",
                              "version": 1,
                            },
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
                          "type": "paragraph",
                          "version": 1,
                        },
                      ],
                      "direction": "ltr",
                      "format": "",
                      "indent": 0,
                      "type": "root",
                      "version": 1,
                    },
                  },
                  "heading": {
                    "preTitle": "How the plugin handles blocks in the Lexical editor",
                    "title": "Blocks are extracted into their own fields",
                  },
                  "id": "65d67d8191c92e447e7472f8",
                },
                "format": "",
                "type": "block",
                "version": 2,
              },
              {
                "fields": {
                  "blockName": "",
                  "blockType": "imageText",
                  "id": "65d67e2291c92e447e7472f9",
                  "image": "65d67e6a7fb7e9426b3f9f5f",
                  "title": "Testing a range of fields",
                },
                "format": "",
                "type": "block",
                "version": 2,
              },
              {
                "children": [
                  {
                    "children": [],
                    "direction": null,
                    "format": "",
                    "indent": 0,
                    "type": "listitem",
                    "value": 1,
                    "version": 1,
                  },
                ],
                "direction": null,
                "format": "",
                "indent": 0,
                "listType": "bullet",
                "start": 1,
                "tag": "ul",
                "type": "list",
                "version": 1,
              },
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "type": "root",
            "version": 1,
          },
        },
        "title": "Test policy",
      }
    `);
  });

  it('creates HTML files for Crowdin as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(4)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(4)
      .reply(200, mockClient.createFile({}));

    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: fixture,
      },
    });
    // update now that a Crowdin article directory is available
    await payload.update({
      id: policy.id,
      collection: 'policies',
      data: {
        title: 'Test policy',
      },
    });
    const crowdinFiles = await getFilesByDocumentID(policy.id, payload);
    const contentHtmlFile = crowdinFiles.find(
      (file) => file.field === 'content'
    );
    expect(contentHtmlFile?.fileData?.html).toMatchInlineSnapshot(
      `"<p>Sample content for a Lexical rich text field with multiple blocks.</p><span data-block-id=65d67d2591c92e447e7472f7></span><p>A bulleted list in-between some blocks consisting of:</p><ul class="bullet"><li value=1>one bullet list item; and</li><li value=2>another!</li></ul><span data-block-id=65d67d8191c92e447e7472f8></span><span data-block-id=65d67e2291c92e447e7472f9></span><ul class="bullet"><li value=1></li></ul>"`
    );
    const contentBlocksHtmlFile = crowdinFiles.find(
      (file) =>
        file.field?.endsWith('.highlight.content') &&
        file.field?.startsWith('content--blocks.')
    );
    expect(contentBlocksHtmlFile?.fileData?.html).toMatchInlineSnapshot(
      `"<p>The plugin parses your block configuration for the Lexical rich text editor. It extracts all block values from the rich text field and then treats this config/data combination as a regular \`blocks\` field.</p><p>Markers are placed in the html and this content is restored into the correct place on translation.</p>"`
    );
  });

  it('creates HTML files for Crowdin as expected for lexical content within an array field that is embedded in a group', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(7)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(7)
      .reply(200, mockClient.createFile({}));

    const policy = await payload.create({
      collection: 'policies',
      data: {
        group: {
          array: [
            {
              title: 'Test sub-policy 1',
              content: fixture,
            },
            {
              title: 'Test sub-policy 2',
              content: fixture,
            },
          ],
        },
      },
    });

    const arrayField = isDefined(policy['group']?.['array'])
      ? policy['group']?.['array']
      : [];
    const ids = arrayField.map((item) => item.id) || ([] as string[]);

    const crowdinFiles = await getFilesByDocumentID(`${policy.id}`, payload);
    expect(crowdinFiles.length).toEqual(7);

    const htmlFileOne = crowdinFiles.find(
      (file) => file.name === `group.array.${ids[0]}.content.html`
    );
    const htmlFileTwo = crowdinFiles.find(
      (file) => file.name === `group.array.${ids[1]}.content.html`
    );

    expect(htmlFileOne).toBeDefined();
    expect(htmlFileTwo).toBeDefined();
    expect(
      crowdinFiles.find((file) => file.name === 'fields.json')
    ).toBeDefined();

    expect(htmlFileOne?.fileData?.html).toMatchInlineSnapshot(
      `"<p>Sample content for a Lexical rich text field with multiple blocks.</p><span data-block-id=65d67d2591c92e447e7472f7></span><p>A bulleted list in-between some blocks consisting of:</p><ul class="bullet"><li value=1>one bullet list item; and</li><li value=2>another!</li></ul><span data-block-id=65d67d8191c92e447e7472f8></span><span data-block-id=65d67e2291c92e447e7472f9></span><ul class="bullet"><li value=1></li></ul>"`
    );

    expect(htmlFileTwo?.fileData?.html).toMatchInlineSnapshot(
      `"<p>Sample content for a Lexical rich text field with multiple blocks.</p><span data-block-id=65d67d2591c92e447e7472f7></span><p>A bulleted list in-between some blocks consisting of:</p><ul class="bullet"><li value=1>one bullet list item; and</li><li value=2>another!</li></ul><span data-block-id=65d67d8191c92e447e7472f8></span><span data-block-id=65d67e2291c92e447e7472f9></span><ul class="bullet"><li value=1></li></ul>"`
    );
  });

  it('updates a Payload article with a rich text field that uses the Lexical editor with multiple blocks with a translation received from Crowdin', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(4)
      .reply(200, mockClient.addStorage())
      // file 1 creation
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .reply(
        200,
        mockClient.createFile({
          fileId: 56641,
        })
      )
      // file 2 creation
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .reply(
        200,
        mockClient.createFile({
          fileId: 56642,
        })
      )
      // file 3 creation
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .reply(
        200,
        mockClient.createFile({
          fileId: 56643,
        })
      )
      // file 4 creation
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .reply(
        200,
        mockClient.createFile({
          fileId: 56644,
        })
      )
      // de - file 1 get translation
      .post(
        `/api/v2/projects/${
          pluginOptions.projectId
        }/translations/builds/files/${56641}`,
        {
          targetLanguageId: 'de',
        }
      )
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${
            pluginOptions.projectId
          }/translations/builds/${56641}/download?targetLanguageId=fr`,
        })
      )
      // de - file 4 get translation
      .post(
        `/api/v2/projects/${
          pluginOptions.projectId
        }/translations/builds/files/${56644}`,
        {
          targetLanguageId: 'de',
        }
      )
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${
            pluginOptions.projectId
          }/translations/builds/${56644}/download?targetLanguageId=fr`,
        })
      )
      // de - file 3 get translation
      .post(
        `/api/v2/projects/${
          pluginOptions.projectId
        }/translations/builds/files/${56643}`,
        {
          targetLanguageId: 'de',
        }
      )
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${
            pluginOptions.projectId
          }/translations/builds/${56643}/download?targetLanguageId=fr`,
        })
      )
      // fr - file 1 get translation
      .post(
        `/api/v2/projects/${
          pluginOptions.projectId
        }/translations/builds/files/${56641}`,
        {
          targetLanguageId: 'fr',
        }
      )
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${
            pluginOptions.projectId
          }/translations/builds/${56641}/download?targetLanguageId=fr`,
        })
      )
      .get(
        `/api/v2/projects/${
          pluginOptions.projectId
        }/translations/builds/${56641}/download`
      )
      .times(2)
      .query({
        targetLanguageId: 'fr',
      })
      .reply(200, {})
      // fr - file 2 get translation
      /**
      .post(
        `/api/v2/projects/${pluginOptions.projectId}/translations/builds/files/${56642}`,
        {
          targetLanguageId: 'fr',
        }
      )
      .reply(200, mockClient.buildProjectFileTranslation({
        url: `https://api.crowdin.com/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56642}/download?targetLanguageId=fr`
      }))
      .get(
        `/api/v2/projects/${pluginOptions.projectId}/translations/builds/${56642}/download`
      )
      .query({
        targetLanguageId: 'fr',
      })
      .reply(200, {})
      */
      // fr - file 3 get translation
      .post(
        `/api/v2/projects/${
          pluginOptions.projectId
        }/translations/builds/files/${56643}`,
        {
          targetLanguageId: 'fr',
        }
      )
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${
            pluginOptions.projectId
          }/translations/builds/${56643}/download?targetLanguageId=fr`,
        })
      )
      .get(
        `/api/v2/projects/${
          pluginOptions.projectId
        }/translations/builds/${56643}/download`
      )
      .times(2)
      .query({
        targetLanguageId: 'fr',
      })
      // all files have the same fileID - we provide the same response for each translation request, therefore only one file can be tested in each test
      .reply(200, "<p>Poste d'essai</p>")
      // fr - file 4 get translation
      .post(
        `/api/v2/projects/${
          pluginOptions.projectId
        }/translations/builds/files/${56644}`,
        {
          targetLanguageId: 'fr',
        }
      )
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${
            pluginOptions.projectId
          }/translations/builds/${56644}/download?targetLanguageId=fr`,
        })
      )
      .get(
        `/api/v2/projects/${
          pluginOptions.projectId
        }/translations/builds/${56644}/download`
      )
      .times(2)
      .query({
        targetLanguageId: 'fr',
      })
      .reply(
        200,
        `<p>Exemple de contenu pour un champ de texte enrichi lexical avec plusieurs blocs.</p><span data-block-id=65d67d2591c92e447e7472f7}></span><p>Une liste à puces entre certains blocs composée de:</p><ul class="bullet"><li value=1>un élément de liste à puces ; et</li><li value=2>
      un autre!</li></ul><span data-block-id=65d67d8191c92e447e7472f8}></span><span data-block-id=65d67e2291c92e447e7472f9}></span><ul class="bullet"><li value=1></li></ul>`
      );

    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: fixture,
      },
    });
    const crowdinFiles = await getFilesByDocumentID(policy.id, payload);

    // check file ids are always mapped in the same way
    const fileIds = crowdinFiles.map((file) => ({
      fileId: file.originalId,
      field: file.field,
    }));
    expect(fileIds).toEqual([
      {
        field: 'content',
        fileId: 56644,
      },
      {
        field: 'content--blocks.65d67d8191c92e447e7472f8.highlight.content',
        fileId: 56643,
      },
      {
        field: 'content--blocks',
        fileId: 56642,
      },
      {
        field: 'fields',
        fileId: 56641,
      },
    ]);
    const translationsApi = new payloadCrowdinSyncTranslationsApi(
      pluginOptions,
      payload
    );
    await translationsApi.updateTranslation({
      documentId: `${policy.id}`,
      collection: 'policies',
      dryRun: false,
    });
    // retrieve translated post from Payload
    const result = await payload.findByID({
      collection: 'policies',
      id: `${policy.id}`,
      locale: 'fr_FR',
    });
    expect(result['content']).toMatchInlineSnapshot(`
      {
        "root": {
          "children": [
            {
              "children": [
                {
                  "detail": 0,
                  "format": 0,
                  "mode": "normal",
                  "style": "",
                  "text": "Exemple de contenu pour un champ de texte enrichi lexical avec plusieurs blocs.",
                  "type": "text",
                  "version": 1,
                },
              ],
              "direction": null,
              "format": "",
              "indent": 0,
              "type": "paragraph",
              "version": 1,
            },
            {
              "children": [
                {
                  "detail": 0,
                  "format": 0,
                  "mode": "normal",
                  "style": "",
                  "text": "Une liste à puces entre certains blocs composée de:",
                  "type": "text",
                  "version": 1,
                },
              ],
              "direction": null,
              "format": "",
              "indent": 0,
              "type": "paragraph",
              "version": 1,
            },
            {
              "children": [
                {
                  "detail": 0,
                  "format": 0,
                  "mode": "normal",
                  "style": "",
                  "text": "un élément de liste à puces ; etun autre!",
                  "type": "text",
                  "version": 1,
                },
              ],
              "direction": null,
              "format": "",
              "indent": 0,
              "type": "paragraph",
              "version": 1,
            },
          ],
          "direction": null,
          "format": "",
          "indent": 0,
          "type": "root",
          "version": 1,
        },
      }
    `);
  });
});
