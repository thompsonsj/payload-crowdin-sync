import type { Payload } from 'payload'
import { mockCrowdinClient } from 'payload-crowdin-sync'
import { initPayloadInt } from '../helpers/initPayloadInt'
import { pluginConfig } from '../helpers/plugin-config'
import { assertCrowdinNocksDone, cleanCrowdinNocks } from '../helpers/crowdin-nock'
import { assertDuplicateGetsOwnCrowdinDirectory } from '../helpers/duplicate-document'

let payload: Payload

const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)

/**
 * #201: duplicating a localized document must not reuse the original Crowdin
 * folder. The field-level beforeDuplicate hook, the virtual field, and
 * collectionDocument lookup each prevent that.
 */
describe('duplicate document (#201)', () => {
  beforeAll(async () => {
    const initialized = await initPayloadInt({
      testSuiteName: 'duplicate-document',
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

  it('creates a new Crowdin directory for the copy and later saves go there', async () => {
    await assertDuplicateGetsOwnCrowdinDirectory({
      payload,
      pluginOptions,
      mockClient,
      fileIds: { original: 20101, copy: 20102 },
      directoryPostsOnCreate: 2,
    })
  })
})
