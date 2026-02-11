import { getArticleDirectory } from 'payload-crowdin-sync'
import nock from 'nock'
import { pluginConfig } from '../helpers/plugin-config'
import { CrowdinArticleDirectory, Policy } from '../../payload-types'
import { getFixture, getFixture2 } from './lexical-editor-with-multiple-blocks.fixture'
import { setupLexicalTest } from './lexical-editor-multiple-blocks-shared'
import { nockLexical } from '../helpers/nock-lexical'
import type { Payload } from 'payload'
import type { Media } from '../../payload-types'

let payload: Payload
let media: Media
const pluginOptions = pluginConfig()

describe('Lexical editor with multiple blocks - Directories', () => {
  beforeAll(async () => {
    const setup = await setupLexicalTest()
    payload = setup.payload
    media = setup.media
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

  it('associates a parent Crowdin article directory with a lexical blocks Crowdin article directory', async () => {
    nockLexical()
      .directories(2)
      .storages(4)
      .files(4)
      .build()

    const create = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: getFixture(media.id),
      },
    })
    // update now that a Crowdin article directory is available
    const policy: Policy = (await payload.update({
      id: create.id,
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: getFixture2(media.id),
      },
    })) as any
    const lexicalBlocksArticleDirectory: CrowdinArticleDirectory = (await getArticleDirectory({
      documentId: `${pluginOptions.lexicalBlockFolderPrefix}content`,
      payload,
      allowEmpty: false,
      parent: policy.crowdinArticleDirectory,
    })) as any
    expect(lexicalBlocksArticleDirectory).toBeDefined()
    // Important: ensure an article directory was not queried/returned without a parent
    expect(lexicalBlocksArticleDirectory?.parent).toBeDefined()
  })
})
