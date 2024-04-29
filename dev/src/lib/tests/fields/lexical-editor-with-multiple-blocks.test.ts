import payload from 'payload';
import { initPayloadTest } from '../helpers/config';
import { getFilesByDocumentID, isDefined, utilities } from 'plugin';
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
    console.log(crowdinFiles);
    const contentHtmlFile = crowdinFiles.find(
      (file) => file.field === 'content'
    );
    expect(contentHtmlFile?.fileData?.html).toMatchInlineSnapshot(
      `"<p>Sample content for a Lexical rich text field with multiple blocks.</p><span>unknown node</span><p>A bulleted list in-between some blocks consisting of:</p><ul class="bullet"><li value=1>one bullet list item; and</li><li value=2>another!</li></ul><span>unknown node</span><span>unknown node</span><ul class="bullet"><li value=1></li></ul>"`
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
      `"<p>Sample content for a Lexical rich text field with multiple blocks.</p><span>unknown node</span><p>A bulleted list in-between some blocks consisting of:</p><ul class="bullet"><li value=1>one bullet list item; and</li><li value=2>another!</li></ul><span>unknown node</span><span>unknown node</span><ul class="bullet"><li value=1></li></ul>"`
    );

    expect(htmlFileTwo?.fileData?.html).toMatchInlineSnapshot(
      `"<p>Sample content for a Lexical rich text field with multiple blocks.</p><span>unknown node</span><p>A bulleted list in-between some blocks consisting of:</p><ul class="bullet"><li value=1>one bullet list item; and</li><li value=2>another!</li></ul><span>unknown node</span><span>unknown node</span><ul class="bullet"><li value=1></li></ul>"`
    );
  });
});
