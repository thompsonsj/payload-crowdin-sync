import { fixture, fixture2 } from './lexical-editor-with-multiple-blocks.fixture'
import { getArticleDirectory } from 'payload-crowdin-sync'
import type { Payload } from 'payload'
import { CrowdinArticleDirectory, Policy } from '../../payload-types'
import {
  injectImageRelationship,
  pluginOptions,
  setupLexicalMultipleBlocksTest,
  teardownLexicalMultipleBlocksTest,
} from './lexical-editor-multiple-blocks-shared.js'
import { nockLexical } from '../helpers/nock-lexical.js'
import { assertCrowdinNocksDone, cleanCrowdinNocks } from '../helpers/crowdin-nock.js'

let payload: Payload
let mediaID: string


describe('Lexical editor with multiple blocks - Directories', () => {
  beforeAll(async () => {
    ;({ payload, mediaID } = await setupLexicalMultipleBlocksTest())
  })
  beforeEach(() => {
    cleanCrowdinNocks()
  })
  afterEach(() => {
    assertCrowdinNocksDone()
  })
  afterAll(async () => {
    await teardownLexicalMultipleBlocksTest(payload)
  })
  it('associates a parent Crowdin article directory with a lexical blocks Crowdin article directory', async () => {
    nockLexical().directories(3).storages(4).files(4).build()
    const create = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: injectImageRelationship(structuredClone(fixture), mediaID),
      },
    })
    // update now that a Crowdin article directory is available
    const policy: Policy = (await payload.update({
      id: create.id,
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: injectImageRelationship(structuredClone(fixture2), mediaID),
      },
    })) as any
    const lexicalBlocksArticleDirectory: CrowdinArticleDirectory = (await getArticleDirectory({
      documentId: `${pluginOptions.lexicalBlockFolderPrefix}content`,
      payload,
      allowEmpty: false,
      parent: policy.crowdinArticleDirectory,
    })) as any
    expect(lexicalBlocksArticleDirectory).toBeDefined()

    const policyArticleDirectoryId =
      typeof policy.crowdinArticleDirectory === 'object' &&
      policy.crowdinArticleDirectory !== null
        ? policy.crowdinArticleDirectory.id
        : policy.crowdinArticleDirectory
    const lexicalParentId =
      typeof lexicalBlocksArticleDirectory.parent === 'object' &&
      lexicalBlocksArticleDirectory.parent !== null
        ? lexicalBlocksArticleDirectory.parent.id
        : lexicalBlocksArticleDirectory.parent

    expect(lexicalParentId).toBe(policyArticleDirectoryId)
  })
})
