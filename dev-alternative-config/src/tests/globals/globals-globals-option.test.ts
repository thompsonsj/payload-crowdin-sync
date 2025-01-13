import { CrowdinArticleDirectory } from "../../payload-types";
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
    it("does not create an article directory for a global with no localized fields", async () => {
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

    it("does not create an article directory for a global with localized fields that is not present in a defined array in the globals option", async () => {
      await payload.updateGlobal({
        slug: "localized-nav",
        data: { items: [{
          label: "Nav item 1"
        }] },
      });
      const result = await payload.findGlobal({
        slug: "localized-nav",
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'crowdinArticleDirectory')).toBeFalsy();
    });
  });

  describe("crowdin-article-directories", () => {
    it("creates an article directory", async () => {
      const fileId = 43
      
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
        slug: "statistics",
        data: { countries: { text: "Country stats"} },
      });
      // retrieve post to get populated fields
      const result = await payload.findGlobal({
        slug: "statistics",
      });
      const crowdinArticleDirectoryId = (result['crowdinArticleDirectory'] as CrowdinArticleDirectory)?.id;
      expect(crowdinArticleDirectoryId).toBeDefined();
    });
  });
});
