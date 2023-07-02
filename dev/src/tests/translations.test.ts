import payload from 'payload';
import { initPayloadTest } from './helpers/config';
import { payloadCrowdInSyncTranslationsApi } from '../../../dist/api/payload-crowdin-sync/translations';
import nock from 'nock';

/**
 * Test translations
 * 
 * Ensure translations are retrieved, compared, and
 * stored as expected.
 */

const collections = {
  nonLocalized: 'posts',
  localized: 'localized-posts',
}

const pluginOptions = {
  projectId: 323731,
  directoryId: 1169,
  token: process.env.CROWDIN_TOKEN,
  localeMap: {
    de_DE: {
      crowdinId: "de",
    },
    fr_FR: {
      crowdinId: "fr",
    }
  },
}

describe('Translations', () => {
  beforeEach(async () => {
    await initPayloadTest({ __dirname });
  });

  describe('fn: getTranslation', () => {
    it('retrieves a translation from CrowdIn', async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: { title: 'Test post' },
      });
      const translationsApi = new payloadCrowdInSyncTranslationsApi(
        pluginOptions,
        payload,
      )
      const scope = nock('https://api.crowdin.com')
        .get('/api/v2/projects/1/translations/builds/1/download')
        .reply(200, {
          title: "Testbeitrag",
        })
      const translation = await translationsApi.getTranslation({
        documentId: post.id,
        fieldName: 'fields',
        locale: 'de_DE',
      })
      expect(translation).toEqual({
        title: "Testbeitrag",
      })
    });
  })

  describe('fn: updateTranslation', () => {
    it('updates a Payload article with a translation retrieved from CrowdIn', async () => {
      const post = await payload.create({
        collection: collections.localized,
        data: { title: 'Test post' },
      });
      const translationsApi = new payloadCrowdInSyncTranslationsApi(
        pluginOptions,
        payload,
      )
      const scope = nock('https://api.crowdin.com')
        .persist()
        .get('/api/v2/projects/1/translations/builds/1/download')
        .reply(200, {
          title: "Testbeitrag",
        })
      const translation = await translationsApi.updateTranslation({
        documentId: post.id,
        collection: collections.localized,
        dryRun: false,
      })
      // retrieve translated post from Payload
      const result = await payload.findByID({
        collection: collections.localized,
        id: post.id,
        locale: 'de_DE',
      });
      expect(result.title).toEqual("Testbeitrag")
    });
  })
});
