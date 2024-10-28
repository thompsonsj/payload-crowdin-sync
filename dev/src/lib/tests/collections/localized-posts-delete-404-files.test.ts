import payload from 'payload';
import { initPayloadTest } from '../helpers/config';
import nock from 'nock';
import { mockCrowdinClient } from 'plugin/src/lib/api/mock/crowdin-api-responses';
import { pluginConfig } from '../helpers/plugin-config';
import { getFilesByDocumentID, payloadCrowdinSyncTranslationsApi } from 'payload-crowdin-sync';

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

  it('removes CrowdinFile Payload documents if the Crowdin API responds with a 404', async () => {
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
    .reply(
      200,
      mockClient.createFile({
        fileId: 94100,
      })
    )
    // translation
    .post(
      `/api/v2/projects/${
        pluginOptions.projectId
      }/translations/builds/files/${94100}`,
      {
        targetLanguageId: 'fr',
      }
    )
    .reply(
      404,
      {
        code: 404,
      }
    )
    
    const post = await payload.create({
      collection: "localized-posts-with-condition",
      data: {
        title: "Test post",
        translateWithCrowdin: true,
      },
    });

    const crowdinFiles = await getFilesByDocumentID(`${post.id}`, payload);

    expect(crowdinFiles.length).toEqual(1)

    const translationsApi = new payloadCrowdinSyncTranslationsApi(
      pluginOptions,
      payload
    );

    await translationsApi.updateTranslation({
      documentId: `${post.id}`,
      collection: 'localized-posts-with-condition',
      dryRun: false,
      excludeLocales: ['de_DE'],
    });

    const refreshedCrowdinFiles = await getFilesByDocumentID(`${post.id}`, payload);

    expect(refreshedCrowdinFiles.length).toEqual(0)
  });
});
