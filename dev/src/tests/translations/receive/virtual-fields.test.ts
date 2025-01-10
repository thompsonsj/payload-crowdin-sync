import nock from "nock";
import { mockCrowdinClient } from "payload-crowdin-sync";
import { pluginConfig } from "../../helpers/plugin-config"

import { nockCreateSourceTranslationFiles } from "../../helpers/nock"

import { initPayloadInt } from '../../helpers/initPayloadInt'
import type { Payload } from 'payload'

let payload: Payload

/**
 * Test virtual fields
 *
 * Virtual fields are added to localized documents
 * and are used to indicate that translations should
 * be retrieved on:
 * 
 * save; or
 * save draft/publish. 
 * 
 */

const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)

describe("Virtual fields", () => {
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

  describe("No database storage", () => {
    it("does not store syncTranslations", async () => {
      nockCreateSourceTranslationFiles({
        createProjectDirectory: true,
      })

      const post = await payload.create({
        collection: "localized-posts",
        data: { 
          title: "Test post",
          syncTranslations: true,
        },
      });
      // retrieve post to get populated fields
      const result = await payload.findByID({
        collection: "localized-posts",
        id: post.id,
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'syncTranslations')).toBeFalsy();
    });

    it("does not store syncAllTranslations", async () => {
      nockCreateSourceTranslationFiles({})

      const post = await payload.create({
        collection: "localized-posts",
        data: { 
          title: "Test post",
          syncAllTranslations: true,
        },
      });
      // retrieve post to get populated fields
      const result = await payload.findByID({
        collection: "localized-posts",
        id: post.id,
      });
      expect(Object.prototype.hasOwnProperty.call(result, 'syncAllTranslations')).toBeFalsy();
    });
  });
});
