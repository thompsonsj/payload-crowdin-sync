/**
 * #186: restoring a version while the request locale is the source locale
 * throws `TypeError: doc[field.name].map is not a function` in
 * `buildCrowdinJsonObject`.
 *
 * Payload's restoreVersion loads the current document with `locale: 'all'`
 * and passes that as `previousDoc` to afterChange. Localized array/blocks
 * fields are then locale maps, not arrays.
 */
import type { Payload } from 'payload'
import { mockCrowdinClient } from 'payload-crowdin-sync'
import nock from 'nock'
import { initPayloadInt } from '../helpers/initPayloadInt'
import { pluginConfig } from '../helpers/plugin-config'
import { assertCrowdinNocksDone, cleanCrowdinNocks } from '../helpers/crowdin-nock'

let payload: Payload
const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)

describe('restore version (#186)', () => {
  beforeAll(async () => {
    const initialized = await initPayloadInt({
      testSuiteName: 'restore-version',
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

  it('restores a version saved in another locale onto the source locale', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(2)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .reply(200, mockClient.createFile({}))

    const created = await payload.create({
      collection: 'nested-field-collection',
      locale: 'en',
      data: {
        title: 'Source title',
        layoutTwo: [
          {
            blockType: 'basicBlock',
            textField: 'Source block',
          },
        ],
      },
    })

    await payload.update({
      collection: 'nested-field-collection',
      id: created.id,
      locale: 'de_DE',
      data: {
        title: 'Deutscher Titel',
        layoutTwo: [
          {
            blockType: 'basicBlock',
            textField: 'Deutscher Block',
          },
        ],
      },
    })

    const versions = await payload.findVersions({
      collection: 'nested-field-collection',
      where: {
        parent: {
          equals: created.id,
        },
      },
      sort: '-createdAt',
    })

    const versionFromOtherLocale = versions.docs[0]
    expect(versionFromOtherLocale).toBeDefined()

    await expect(
      payload.restoreVersion({
        collection: 'nested-field-collection',
        id: versionFromOtherLocale.id,
        locale: 'en',
      }),
    ).resolves.toBeDefined()
  })
})
