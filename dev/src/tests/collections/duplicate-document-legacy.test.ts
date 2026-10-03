import type { Payload } from 'payload'
import { mockCrowdinClient } from 'payload-crowdin-sync'
import { initPayloadInt } from '../helpers/initPayloadInt'
import { pluginConfig } from '../helpers/plugin-config'
import { assertCrowdinNocksDone, cleanCrowdinNocks } from '../helpers/crowdin-nock'
import { assertDuplicateGetsOwnCrowdinDirectory } from '../helpers/duplicate-document'

let payload: Payload

const pluginOptionsOverride = { legacyArticleDirectoryLookup: true }
const pluginOptions = pluginConfig(pluginOptionsOverride)
const mockClient = mockCrowdinClient(pluginOptions)

/**
 * #201 with the deprecated name / stored-id lookup on. Directory `name` is
 * the document id, so a duplicate still must get its own folder.
 */
describe('duplicate document with legacyArticleDirectoryLookup (#201)', () => {
  beforeAll(async () => {
    const initialized = await initPayloadInt({
      testSuiteName: 'duplicate-document-legacy',
      pluginOptionsOverride,
    })
    ;({ payload } = initialized as {
      payload: Payload
    })
  })
  beforeEach(() => {
    cleanCrowdinNocks()
  })
  afterEach(() => {
    assertCrowdinNocksDone()
  })
  afterAll(async () => {
    if (typeof payload.db.destroy === 'function') {
      await payload.db.destroy()
    }
  })

  it('still creates a new Crowdin directory for the copy when name lookup is on', async () => {
    await assertDuplicateGetsOwnCrowdinDirectory({
      payload,
      pluginOptions,
      mockClient,
      fileIds: { original: 20111, copy: 20112 },
      directoryPostsOnCreate: 2,
    })
  })
})
