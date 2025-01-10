import { CrowdinArticleDirectory } from "../../payload-types"
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

describe("Globals", () => {
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

  describe("Non-localized globals", () => {
    it("does not create an article directory", async () => {
      await payload.updateGlobal({
        slug: "nav",
        data: { items: [{
          label: "Nav item 1"
        }] },
      });
      const result = await payload.findGlobal({
        slug: "nav",
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy();
    });
  });

  describe("crowdin-article-directories", () => {
    it("creates an article directory", async () => {
      // this test needs revising. fileId needs to be the same for the subsequent tests, and both need a put mock? Check the logic of using nock and what changes take place in hooks for updateGlobal
      const fileId = 69334
      
      nock("https://api.crowdin.com")
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
        .reply(200, mockClient.createFile({
          fileId,
        }))

      await payload.updateGlobal({
        slug: "localized-nav",
        data: { items: [{
          label: "Nav item 1"
        }] },
      });
      // retrieve post to get populated fields
      const result = await payload.findGlobal({
        slug: "localized-nav",
      });
      const crowdinArticleDirectoryId = (result["crowdinArticleDirectory"] as CrowdinArticleDirectory)?.id;
      expect(crowdinArticleDirectoryId).toBeDefined();
    });

    it("creates only one article directory", async () => {
      const fileId = 69334
      
      nock("https://api.crowdin.com")
        .post(
          `/api/v2/storages`
        )
        .twice()
        .reply(200, mockClient.addStorage())
        .put(
          `/api/v2/projects/${pluginOptions.projectId}/files/${fileId}`
        )
        .twice()
        .reply(200, mockClient.createFile({
          fileId,
        }))

      await payload.updateGlobal({
        slug: "localized-nav",
        data: { items: [{
          label: "Nav item 1"
        }] },
      });
      // retrieve post to get populated fields
      const globalRefreshed = await payload.findGlobal({
        slug: "localized-nav",
      });
      const crowdinArticleDirectoryId =
        (globalRefreshed["crowdinArticleDirectory"] as CrowdinArticleDirectory)?.id;
      await payload.updateGlobal({
        slug: "localized-nav",
        data: { items: [
            {
              label: "Nav item 1"
            },
            {
              label: "Nav item 2"
            },
          ]
        },
      });
      // retrieve post to get populated fields
      const updatedGlobalRefreshed =  await payload.findGlobal({
        slug: "localized-nav",
      });
      expect((updatedGlobalRefreshed["crowdinArticleDirectory"] as CrowdinArticleDirectory)?.id).toEqual(
        crowdinArticleDirectoryId
      );
    });
  });
});
