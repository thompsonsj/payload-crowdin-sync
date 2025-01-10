import nock from "nock";
import { mockCrowdinClient } from "payload-crowdin-sync";
import { pluginConfig } from "../helpers/plugin-config"

import { initPayloadInt } from '../helpers/initPayloadInt'
import type { Payload } from 'payload'

let payload: Payload

/**
 * Test the collections
 *
 * Ensure plugin collections are created and
 * behave as expected.
 *
 * Collections to test:
 *
 * - crowdin-article-directories
 * - crowdin-files
 * - crowdin-collection-directories
 *
 * Terminology:
 *
 * - article directory: Crowdin Article Directory
 * - collection directory: Crowdin Collection Directory
 * - file: Crowdin File
 */

const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)

describe("Collection: Localized Posts With Conditon", () => {
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

  describe("publish: respects a condition set in the plugin config", () => {
    it("does not create an article directory if the conditon is not met", async () => {
      const post = await payload.create({
        collection: "localized-posts-with-condition",
        data: { title: "Test post" },
      });
      const result = await payload.findByID({
        collection: "localized-posts-with-condition",
        id: post.id,
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy();
    });

    it("creates an article directory if the condition is met", async () => {
      nock('https://api.crowdin.com')
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/directories`
        )
        .twice()
        .reply(200, mockClient.createDirectory({}))
        .post(
          `/api/v2/storages`
        )
        .reply(200, mockClient.addStorage())
        .post(
          `/api/v2/projects/${pluginOptions.projectId}/files`
        )
        .reply(200, mockClient.createFile({}))

      const post = await payload.create({
        collection: "localized-posts-with-condition",
        data: {
          title: "Test post",
          translateWithCrowdin: true,
        },
      });
      const result = await payload.findByID({
        collection: "localized-posts-with-condition",
        id: post.id,
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeTruthy();
    });

    it("creates an article directory if the conditon is met on an existing article", async () => {
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
        .reply(200, mockClient.createFile({}))

      const post = await payload.create({
        collection: "localized-posts-with-condition",
        data: { title: "Test post" },
      });
      const result = await payload.findByID({
        collection: "localized-posts-with-condition",
        id: post.id,
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy();
      await payload.update({
        id: post.id,
        collection: "localized-posts-with-condition",
        data: {
          title: "Test post updated",
          translateWithCrowdin: true,
        }
      })
      // refresh
      const updatedPost = await payload.findByID({
        id: post.id,
        collection: "localized-posts-with-condition",
      })
      expect(Object.prototype.hasOwnProperty.call(updatedPost, 'crowdinArticleDirectory')).toBeTruthy();
    });
  });

  describe("draft: respects a condition set in the plugin config", () => {
    it("does not create an article directory if the conditon is not met", async () => {
      const post = await payload.create({
        collection: "localized-posts-with-condition",
        data: { title: "Test post" },
        draft: true,
      });
      const result = await payload.findByID({
        collection: "localized-posts-with-condition",
        id: post.id,
        draft: true,
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy();
    });

    it("creates an article directory if the conditon is met", async () => {
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
        .reply(200, mockClient.createFile({}))

      const post = await payload.create({
        collection: "localized-posts-with-condition",
        data: {
          title: "Test post",
          translateWithCrowdin: true,
        },
        draft: true,
      });
      const result = await payload.findByID({
        collection: "localized-posts-with-condition",
        id: post.id,
        draft: true,
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeTruthy();
    });

    it("creates an article directory if the conditon is met on an existing article", async () => {
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
        .reply(200, mockClient.createFile({}))

      const post = await payload.create({
        collection: "localized-posts-with-condition",
        data: { title: "Test post" },
        draft: true,
      });
      const result = await payload.findByID({
        collection: "localized-posts-with-condition",
        id: post.id,
        draft: true,
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy();
      await payload.update({
        id: post.id,
        collection: "localized-posts-with-condition",
        data: {
          title: "Test post updated",
          translateWithCrowdin: true,
        },
        draft: true,
      })
      // refresh
      const updatedPost = await payload.findByID({
        id: post.id,
        collection: "localized-posts-with-condition",
        draft: true,
      })
      expect(Object.prototype.hasOwnProperty.call(updatedPost, 'crowdinArticleDirectory')).toBeTruthy();
    });
  });

  describe("draft, different locales: respects a condition set in the plugin config", () => {
    it("does not create an article directory if the conditon is not met", async () => {
      const post = await payload.create({
        collection: "localized-posts-with-condition",
        data: { title: "Poste de test" },
        draft: true,
        locale: "fr_FR",
      });
      const result = await payload.findByID({
        collection: "localized-posts-with-condition",
        id: post.id,
        draft: true,
        locale: "fr_FR",
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy();
    });

    it("does not creates an article directory if the conditon is met in a non-source locale", async () => {
      const post = await payload.create({
        collection: "localized-posts-with-condition",
        data: {
          title: "Poste de test",
          translateWithCrowdin: true,
        },
        draft: true,
        locale: "fr_FR",
      });
      const result = await payload.findByID({
        collection: "localized-posts-with-condition",
        id: post.id,
        draft: true,
        locale: "fr_FR",
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy();
    });

    it("creates an article directory if the conditon is met on an existing article", async () => {
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
        .reply(200, mockClient.createFile({}))

      const post = await payload.create({
        collection: "localized-posts-with-condition",
        data: { title: "Poste de test" },
        draft: true,
        locale: "fr_FR",
      });
      const result = await payload.findByID({
        collection: "localized-posts-with-condition",
        id: post.id,
        draft: true,
        locale: "fr_FR",
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy();
      await payload.update({
        id: post.id,
        collection: "localized-posts-with-condition",
        data: {
          title: "Test post",
          translateWithCrowdin: true,
        },
        draft: true,
      })
      // refresh
      const updatedPost = await payload.findByID({
        id: post.id,
        collection: "localized-posts-with-condition",
        draft: true,
      })
      expect(Object.prototype.hasOwnProperty.call(updatedPost, 'crowdinArticleDirectory')).toBeTruthy();
    });
  });
});
