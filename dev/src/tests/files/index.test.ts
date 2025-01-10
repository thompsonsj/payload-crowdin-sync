import {
  getFileByDocumentID,
  getFilesByDocumentID,
  getArticleDirectory,
  isDefined,
  mockCrowdinClient,
} from "payload-crowdin-sync";
import nock from "nock";
import { pluginConfig } from "../helpers/plugin-config"

import { initPayloadInt } from '../helpers/initPayloadInt'
import type { Payload } from 'payload'

let payload: Payload

/**
 * Test files
 *
 * Ensure that files are created for Crowdin as expected.
 *
 * Note: This test suite is not intended to test file contents.
 * This is the responsibility of buildCrowdinHtmlObject and
 * buildCrowdinJsonObject which are unit tested in `src/utilities`.
 */

const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)

describe(`Crowdin file create, update and delete`, () => {
  beforeAll(async () => {
    const initialized = await initPayloadInt()
    ;({ payload } = initialized as {
      payload: Payload
    })
  });

  afterEach((done) => {
    if (!nock.isDone()) {
      throw new Error(
        `Not all nock interceptors were used: ${JSON.stringify(
          nock.pendingMocks()
        )}`
      );
    }
    nock.cleanAll()
    done()
  })

  afterAll(async () => {
    if (typeof payload.db.destroy === 'function') {
      await payload.db.destroy()
    }
  });

  describe(`Collection: ${"localized-posts"}`, () => {
    it("updates the `fields` file for a new article", async () => {
      nock('https://api.crowdin.com')
        .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
        .reply(200, mockClient.createDirectory({}))
        .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
        .reply(200, mockClient.createDirectory({}))
        .post(`/api/v2/storages`)
        .reply(200, mockClient.addStorage())
        .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
        .reply(200, mockClient.createFile({
          request: {
          name: 'fields',
          storageId: 5678,
          type: 'json',
        }}))

      const post = await payload.create({
        collection: "localized-posts",
        data: { title: "Test post" },
      });

      const file = await getFileByDocumentID("fields", `${post.id}`, payload as any);
      expect(file.fileData?.json).toEqual({ title: "Test post" });
    });

    it("updates the `fields` file if a text field has changed", async () => {
      const fileId = 34
      nock('https://api.crowdin.com')
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/directories`
        )
        .reply(200, mockClient.createDirectory({}))
        .post(
          `/api/v2/storages`
        )
        .reply(200, mockClient.addStorage())
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/files`
        )
        .reply(200, mockClient.createFile(
          {
            fileId,
            request: {
              name: 'fields',
              storageId: 5678,
              type: 'json',
            }
          }
        ))
        .post(
          `/api/v2/storages`
        )
        .reply(200, mockClient.addStorage())
        .put(
          `/api/v2/projects/${pluginOptions.projectId}/files/${fileId}`
        )
        .reply(200, mockClient.updateOrRestoreFile({ fileId }))

      const post = await payload.create({
        collection: "localized-posts",
        data: { title: "Test post" },
      });

      const file = await getFileByDocumentID("fields", `${post.id}`, payload);

      await payload.update({
        id: `${post.id}`,
        collection: "localized-posts",
        data: { title: "Test post updated" },
      });

      const updatedFile = await getFileByDocumentID("fields", `${post.id}`, payload);

      expect(file.updatedAt).not.toEqual(updatedFile.updatedAt);
      expect(updatedFile.fileData?.json).toEqual({ title: "Test post updated" });
    });
  });

  describe(`Collection: ${"nested-field-collection"}`, () => {
    it("does not create files for empty localized fields", async () => {
      nock('https://api.crowdin.com')
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/directories`
        )
        .reply(200, mockClient.createDirectory({}))
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/directories`
        )
        .reply(200, mockClient.createDirectory({}))

      const article = await payload.create({
        collection: "nested-field-collection",
        data: {
          title: "Non localized title",
          tabTwo: {}
        },
      });

      const crowdinFiles = await getFilesByDocumentID({
        documentId: `${article.id}`,
        payload
      });
      expect(crowdinFiles.length).toEqual(0);
    });

    it("creates files containing fieldType content", async () => {
      nock('https://api.crowdin.com')
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/directories`
        )
        .reply(200, mockClient.createDirectory({}))
        .post(
          `/api/v2/storages`
        )
        .twice()
        .reply(200, mockClient.addStorage())
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/files`
        )
        .twice()
        .reply(200, mockClient.createFile({}))

      await payload.create({
        collection: "nested-field-collection",
        locale: "en",
        data: {
          textField: "Test title",
          richTextField: [
            {
              children: [
                {
                  text: "Test content",
                },
              ],
            },
          ],
          textareaField: "Test meta description",
          tabTwo: {},
        },
      }).then(async (article) => {
        const crowdinFiles = await getFilesByDocumentID({
          documentId: `${article.id}`, payload
        });
        expect(crowdinFiles.length).toEqual(2);
        expect(
          crowdinFiles.find((file) => file.name === "richTextField.html")
        ).toBeDefined();
        expect(
          crowdinFiles.find((file) => file.name === "fields.json")
        ).toBeDefined();
      }); 
    });

    
    it("creates files containing `array` fieldType content", async () => {
      nock('https://api.crowdin.com')
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/directories`
        )
        .reply(200, mockClient.createDirectory({}))
        .post(
          `/api/v2/storages`
        )
        .thrice()
        .reply(200, mockClient.addStorage())
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/files`
        )
        .thrice()
        .reply(200, mockClient.createFile({}))

      const article = await payload.create({
        collection: "nested-field-collection",
        data: {
          arrayField: [
            {
              textField: "Test title 1",
              richTextField: [
                {
                  children: [
                    {
                      text: "Test content 1",
                    },
                  ],
                },
              ],
              textareaField: "Test meta description 1",
            },
            {
              textField: "Test title 2",
              richTextField: [
                {
                  children: [
                    {
                      text: "Test content 2",
                    },
                  ],
                },
              ],
              textareaField: "Test meta description 2",
            },
          ],
          tabTwo: {},
        },
      });
      const ids = article["arrayField"] instanceof Array && article["arrayField"].map((item) => item.id) || [] as string[];
      const crowdinFiles = await getFilesByDocumentID({
        documentId: `${article.id}`,
        payload
      });
      expect(crowdinFiles.length).toEqual(3);
      expect(
        crowdinFiles.find(
          (file) => file.name === `arrayField.${ids[0]}.richTextField.html`
        )
      ).toBeDefined();
      expect(
        crowdinFiles.find(
          (file) => file.name === `arrayField.${ids[1]}.richTextField.html`
        )
      ).toBeDefined();
      expect(
        crowdinFiles.find((file) => file.name === "fields.json")
      ).toBeDefined();
    });
    

    it("creates files containing `blocks` fieldType content", async () => {
      nock('https://api.crowdin.com')
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/directories`
        )
        .reply(200, mockClient.createDirectory({}))
        .post(
          `/api/v2/storages`
        )
        .times(4)
        .reply(200, mockClient.addStorage())
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/files`
        )
        .times(4)
        .reply(200, mockClient.createFile({}))

      const article = await payload.create({
        collection: "nested-field-collection",
        data: {
          layout: [
            {
              textField: "Test title 1",
              richTextField: [
                {
                  children: [
                    {
                      text: "Test content 1",
                    },
                  ],
                },
              ],
              textareaField: "Test meta description 1",
              blockType: "basicBlock",
            },
            {
              messages: [
                {
                  message: [
                    {
                      children: [
                        {
                          text: "Test content 1",
                        },
                      ],
                    },
                  ],
                  id: "64735620230d57bce946d370",
                },
                {
                  message: [
                    {
                      children: [
                        {
                          text: "Test content 1",
                        },
                      ],
                    },
                  ],
                  id: "64735621230d57bce946d371",
                },
              ],
              blockType: "testBlockArrayOfRichText",
            },
          ],
          tabTwo: {},
        },
      });
      const blockIds = article["layout"] instanceof Array ? article["layout"].map((item) => item.id).filter(isDefined) : [];
      const blockTypes = article["layout"] instanceof Array && article["layout"].map((item) => item.blockType) || [] as string[];
      const arrayIds = article["layout"] instanceof Array && article["layout"].length > 0 && (article["layout"][1] as any).messages.map((item: any) => item.id);
      const crowdinFiles = await getFilesByDocumentID({
        documentId: `${article.id}`,
        payload
      });
      expect(crowdinFiles.length).toEqual(4);
      const jsonFile = crowdinFiles.find((file) => file.name === "fields.json");
      expect(
        crowdinFiles.find(
          (file) =>
            file.name ===
            `layout.${blockIds[0]}.${blockTypes[0]}.richTextField.html`
        )
      ).toBeDefined();
      expect(
        crowdinFiles.find(
          (file) =>
            file.name ===
            `layout.${blockIds[1]}.${blockTypes[1]}.messages.${arrayIds[0]}.message.html`
        )
      ).toBeDefined();
      expect(
        crowdinFiles.find(
          (file) =>
            file.name ===
            `layout.${blockIds[1]}.${blockTypes[1]}.messages.${arrayIds[1]}.message.html`
        )
      ).toBeDefined();
      expect(jsonFile).toBeDefined();
      expect(jsonFile?.fileData?.json).toEqual({
        layout: {
          [blockIds[0]]: {
            basicBlock: {
              textareaField: "Test meta description 1",
              textField: "Test title 1",
            },
          },
        },
      });
    });
    
    it("deletes the `fields` file when an existing article is deleted", async () => {
      const fileId = 78

      nock('https://api.crowdin.com')
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/directories`
        )
        .reply(200, mockClient.createDirectory({}))
        .post(
          `/api/v2/storages`
        )
        .reply(200, mockClient.addStorage())
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/files`
        )
        .reply(200, mockClient.createFile({
          fileId,
        }))
        .delete(
          `/api/v2/projects/${pluginOptions.projectId}/files/${fileId}`
        )
        .reply(204)
        .delete(
          `/api/v2/projects/${pluginOptions.projectId}/directories/${1169}`
        )
        .reply(204)

      const post = await payload.create({
        collection: "localized-posts",
        data: { title: "Test post" },
      });
      const file = await getFileByDocumentID("fields", `${post.id}`, payload);
      expect(file.fileData?.json).toEqual({ title: "Test post" });
      await payload.delete({
        collection: "localized-posts",
        id: `${post.id}`,
      });
      const crowdinFiles = await getFilesByDocumentID({
        documentId: `${post.id}`,
        payload
      });
      expect(crowdinFiles.length).toEqual(0);
    });

    it("deletes the collection Crowdin article directory when an existing article is deleted", async () => {
      const fileId = 634

      nock('https://api.crowdin.com')
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/directories`
        )
        .reply(200, mockClient.createDirectory({}))
        .post(
          `/api/v2/storages`
        )
        .reply(200, mockClient.addStorage())
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/files`
        )
        .reply(200, mockClient.createFile({
          fileId,
        }))
        .delete(
          `/api/v2/projects/${pluginOptions.projectId}/files/${fileId}`
        )
        .reply(204)
        .delete(
          `/api/v2/projects/${pluginOptions.projectId}/directories/${1169}`
        )
        .reply(204)

      const post = await payload.create({
        collection: "localized-posts",
        data: { title: "Test post" },
      });
      const file = await getFileByDocumentID("fields", `${post.id}`, payload);
      expect(file.fileData?.json).toEqual({ title: "Test post" });
      await payload.delete({
        collection: "localized-posts",
        id: `${post.id}`,
      });
      const crowdinPayloadArticleDirectory = await getArticleDirectory({
        documentId: `${post.id}`,
        payload
      });
      expect(crowdinPayloadArticleDirectory).toBeUndefined();
    });
  });
});
