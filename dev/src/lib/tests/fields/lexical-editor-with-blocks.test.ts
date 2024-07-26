import payload from 'payload';
import { initPayloadTest } from '../helpers/config';
import { getFilesByDocumentID, isDefined, utilities } from 'plugin';
import Policies from '../../collections/Policies';
import { fixture } from './lexical-editor-with-blocks.fixture';
import nock from 'nock';
import { mockCrowdinClient } from 'plugin/src/lib/api/mock/crowdin-api-responses';
import { pluginConfig } from '../helpers/plugin-config';
import { CrowdinArticleDirectory, Policy } from '../../payload-types';

const pluginOptions = pluginConfig();
const mockClient = mockCrowdinClient(pluginOptions);

describe('Lexical editor with blocks', () => {
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
      .times(4)
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
                    "text": "Lexical editor content",
                    "type": "text",
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "tag": "h2",
                "type": "heading",
                "version": 1,
              },
              {
                "children": [
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "This is editable ",
                    "type": "text",
                    "version": 1,
                  },
                  {
                    "detail": 0,
                    "format": 1,
                    "mode": "normal",
                    "style": "",
                    "text": "rich",
                    "type": "text",
                    "version": 1,
                  },
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": " text, ",
                    "type": "text",
                    "version": 1,
                  },
                  {
                    "detail": 0,
                    "format": 2,
                    "mode": "normal",
                    "style": "",
                    "text": "much",
                    "type": "text",
                    "version": 1,
                  },
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": " better than a ",
                    "type": "text",
                    "version": 1,
                  },
                  {
                    "detail": 0,
                    "format": 16,
                    "mode": "normal",
                    "style": "",
                    "text": "<textarea>",
                    "type": "text",
                    "version": 1,
                  },
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "!",
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
                    "text": "Since it's rich text, you can do things like turn a selection of text ",
                    "type": "text",
                    "version": 1,
                  },
                  {
                    "detail": 0,
                    "format": 1,
                    "mode": "normal",
                    "style": "",
                    "text": "bold",
                    "type": "text",
                    "version": 1,
                  },
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": ", or add a semantically rendered block quote in the middle of the page, like this:",
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
                    "text": "A wise quote.",
                    "type": "text",
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "quote",
                "version": 1,
              },
              {
                "children": [
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "Try it out for yourself!",
                    "type": "text",
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "center",
                "indent": 0,
                "type": "paragraph",
                "version": 1,
              },
              {
                "children": [],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "paragraph",
                "version": 1,
              },
              {
                "fields": {
                  "blockName": "",
                  "blockType": "highlight",
                  "color": "gray",
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
                              "text": "More lexical content inside a custom block.",
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
                    "preTitle": "Custom block",
                    "title": "Highlight",
                  },
                  "id": "6582d48f2037fb3ca72ed2cf",
                },
                "format": "",
                "type": "block",
                "version": 2,
              },
              {
                "children": [],
                "direction": null,
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
      }
    `);
  });

  it('builds a Crowdin JSON object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(3)
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
      .thrice()
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
                    "text": "Lexical editor content",
                    "type": "text",
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "tag": "h2",
                "type": "heading",
                "version": 1,
              },
              {
                "children": [
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "This is editable ",
                    "type": "text",
                    "version": 1,
                  },
                  {
                    "detail": 0,
                    "format": 1,
                    "mode": "normal",
                    "style": "",
                    "text": "rich",
                    "type": "text",
                    "version": 1,
                  },
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": " text, ",
                    "type": "text",
                    "version": 1,
                  },
                  {
                    "detail": 0,
                    "format": 2,
                    "mode": "normal",
                    "style": "",
                    "text": "much",
                    "type": "text",
                    "version": 1,
                  },
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": " better than a ",
                    "type": "text",
                    "version": 1,
                  },
                  {
                    "detail": 0,
                    "format": 16,
                    "mode": "normal",
                    "style": "",
                    "text": "<textarea>",
                    "type": "text",
                    "version": 1,
                  },
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "!",
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
                    "text": "Since it's rich text, you can do things like turn a selection of text ",
                    "type": "text",
                    "version": 1,
                  },
                  {
                    "detail": 0,
                    "format": 1,
                    "mode": "normal",
                    "style": "",
                    "text": "bold",
                    "type": "text",
                    "version": 1,
                  },
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": ", or add a semantically rendered block quote in the middle of the page, like this:",
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
                    "text": "A wise quote.",
                    "type": "text",
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "quote",
                "version": 1,
              },
              {
                "children": [
                  {
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": "Try it out for yourself!",
                    "type": "text",
                    "version": 1,
                  },
                ],
                "direction": "ltr",
                "format": "center",
                "indent": 0,
                "type": "paragraph",
                "version": 1,
              },
              {
                "children": [],
                "direction": null,
                "format": "",
                "indent": 0,
                "type": "paragraph",
                "version": 1,
              },
              {
                "fields": {
                  "blockName": "",
                  "blockType": "highlight",
                  "color": "gray",
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
                              "text": "More lexical content inside a custom block.",
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
                    "preTitle": "Custom block",
                    "title": "Highlight",
                  },
                  "id": "6582d48f2037fb3ca72ed2cf",
                },
                "format": "",
                "type": "block",
                "version": 2,
              },
              {
                "children": [],
                "direction": null,
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
        "title": "Test policy",
      }
    `);
  });

  it('creates an HTML file for Crowdin as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .thrice()
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
    const crowdinFiles = await getFilesByDocumentID(`${policy.id}`, payload);
    const contentHtmlFile = crowdinFiles.find(
      (file) => file.field === 'content'
    );
    expect(contentHtmlFile?.fileData?.html).toMatchInlineSnapshot(
      `"<h2>Lexical editor content</h2><p>This is editable <strong>rich</strong> text, <em>much</em> better than a <code><textarea></code>!</p><p>Since it's rich text, you can do things like turn a selection of text <strong>bold</strong>, or add a semantically rendered block quote in the middle of the page, like this:</p><blockquote>A wise quote.</blockquote><p>Try it out for yourself!</p><p></p><span data-block-id=6582d48f2037fb3ca72ed2cf></span><p></p>"`
    );
  });

  it('creates HTML files for Crowdin as expected for lexical content within an array field that is embedded in a group', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(5)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(7)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(7)
      .reply(200, mockClient.createFile({}));

    const policy: Policy = await payload.create({
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
    }) as any;

    const arrayField = isDefined(policy['group']?.['array'])
      ? policy['group']?.['array']
      : [];
    const ids = arrayField.map((item) => item.id) || ([] as string[]);

    const crowdinFiles = await getFilesByDocumentID(`${policy.id}`, payload);
    expect(crowdinFiles.length).toEqual(3);

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
    
    const fileOneCrowdinFiles = await getFilesByDocumentID(`${pluginOptions.lexicalBlockFolderPrefix}group.array.${ids[0]}.content`, payload, policy.crowdinArticleDirectory as CrowdinArticleDirectory);
    const fileTwoCrowdinFiles = await getFilesByDocumentID(`${pluginOptions.lexicalBlockFolderPrefix}group.array.${ids[1]}.content`, payload, policy.crowdinArticleDirectory as CrowdinArticleDirectory);
    expect(fileOneCrowdinFiles.length).toEqual(2);
    expect(fileTwoCrowdinFiles.length).toEqual(2);

    expect(htmlFileOne?.fileData?.html).toMatchInlineSnapshot(
      `"<h2>Lexical editor content</h2><p>This is editable <strong>rich</strong> text, <em>much</em> better than a <code><textarea></code>!</p><p>Since it's rich text, you can do things like turn a selection of text <strong>bold</strong>, or add a semantically rendered block quote in the middle of the page, like this:</p><blockquote>A wise quote.</blockquote><p>Try it out for yourself!</p><p></p><span data-block-id=6582d48f2037fb3ca72ed2cf></span><p></p>"`
    );

    expect(htmlFileTwo?.fileData?.html).toMatchInlineSnapshot(
      `"<h2>Lexical editor content</h2><p>This is editable <strong>rich</strong> text, <em>much</em> better than a <code><textarea></code>!</p><p>Since it's rich text, you can do things like turn a selection of text <strong>bold</strong>, or add a semantically rendered block quote in the middle of the page, like this:</p><blockquote>A wise quote.</blockquote><p>Try it out for yourself!</p><p></p><span data-block-id=6582d48f2037fb3ca72ed2cf></span><p></p>"`
    );
  });
});
