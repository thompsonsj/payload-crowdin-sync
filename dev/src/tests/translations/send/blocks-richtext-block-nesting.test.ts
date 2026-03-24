import { getFiles, getLexicalFieldArticleDirectories } from 'payload-crowdin-sync'
import nock from 'nock'
import { mockCrowdinClient } from 'payload-crowdin-sync'
import { pluginConfig } from '../../helpers/plugin-config'
import { fixture } from './__fixtures__/block-richtext-block-nesting.fixture'
import { initPayloadInt } from '../../helpers/initPayloadInt'
import type { Payload } from 'payload'
import { CrowdinArticleDirectory } from '@/payload-types'
let payload: Payload
// const fixtureHtmlFr = '<div class="rich-text"><p>Text in a Lexical field inside a block in the <strong>block</strong> of a <em>Lexical field</em> of a <strong>Lexical field</strong> of a <strong>Lexical field</strong>.</p></div>'
/**
 * Test translations
 *
 * Ensure translations are retrieved, compared, and
 * stored as expected.
 */
const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)
/**
 * payload.config.custom-serializers.ts required for htmlToSlate.
 *
 * Plugin options passed directly to payloadCrowdinSyncTranslationsApi - this API is initialized through `server.ts` at the moment. Can change this in the future to use internal functions.
 */
describe('Translations', () => {
  beforeAll(async () => {
    const initialized = await initPayloadInt()
    ;({ payload } = initialized as {
      payload: Payload
    })
  })
  afterEach((done) => {
    if (!nock.isDone()) {
      throw new Error(`Not all nock interceptors were used: ${JSON.stringify(nock.pendingMocks())}`)
    }
    nock.cleanAll()
    done()
  })
  afterAll(async () => {
    if (typeof payload.db.destroy === 'function') {
      await payload.db.destroy()
    }
  })
  describe('fn: updateTranslation - custom serializer', () => {
    it('updates a Payload article with a `richText` field translation retrieved from Crowdin restoring table structure', async () => {
      const fileId = 4674
      nock('https://api.crowdin.com')
        .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
        .times(4)
        .reply(200, mockClient.createDirectory({}))
        .post(`/api/v2/storages`)
        .reply(200, mockClient.addStorage())
        .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
        .reply(
          200,
          mockClient.createFile({
            fileId,
          }),
        )
      const create = await payload.create({
        collection: 'nested-field-collection',
        data: {
          title: 'Non-localized title',
          layout: fixture,
        },
      })
      // Crowdin file
      const post = await payload.findByID({
        collection: 'nested-field-collection',
        id: create.id,
      })
      const files = await getFiles(
        (post.crowdinArticleDirectory as CrowdinArticleDirectory)?.id,
        payload,
      )
      expect(files.length).toBe(0)
      const childDirectories = await getLexicalFieldArticleDirectories({
        payload,
        parent: post.crowdinArticleDirectory,
      })
      expect(childDirectories.length).toBe(1)
      const childDirectory = childDirectories[0]
      expect(childDirectory.name).toEqual(
        `lex.layout.688dd685258ffa0224ea6daa.basicBlockLexical.content`,
      )
      const childDirectoryFiles = await getFiles(childDirectory.id, payload)
      expect(childDirectoryFiles.length).toBe(0)
      const grandChildDirectories = await getLexicalFieldArticleDirectories({
        payload,
        parent: childDirectory,
      })
      expect(grandChildDirectories.length).toBe(1)
      const grandChildDirectory = grandChildDirectories[0]
      expect(grandChildDirectory.name).toEqual(
        `lex.blocks.688dd6eca950db7862106962.highlight.content`,
      )
      const grandChildDirectoryFiles = await getFiles(grandChildDirectory.id, payload)
      expect(grandChildDirectoryFiles.length).toBe(1)
      const file = grandChildDirectoryFiles[0]
      expect(file.fileData?.json).toMatchSnapshot()
    })
  })
})
