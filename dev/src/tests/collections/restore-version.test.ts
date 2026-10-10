/**
 * #186: restoreVersion loads the current document with `locale: 'all'` and
 * passes that as `previousDoc` to afterChange. Localized array/blocks
 * fields are then locale maps, not arrays. The Crowdin builders skip those
 * values instead of calling `.map`.
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

    // de_DE is not the source locale, so afterChange does not call Crowdin.
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

    nock('https://api.crowdin.com')
      .post(`/api/v2/storages`)
      .optionally()
      .times(8)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .optionally()
      .times(8)
      .reply(200, mockClient.createFile({}))
      .put(new RegExp(`^/api/v2/projects/${pluginOptions.projectId}/files/\\d+$`))
      .optionally()
      .times(8)
      .reply(200, mockClient.createFile({}))

    await payload.update({
      collection: 'nested-field-collection',
      id: created.id,
      locale: 'en',
      data: {
        title: 'Updated title',
        layoutTwo: [
          {
            blockType: 'basicBlock',
            textField: 'Updated source block',
          },
        ],
      },
    })

    const beforeRestoreEn = await payload.findByID({
      collection: 'nested-field-collection',
      id: created.id,
      locale: 'en',
    })
    expect(beforeRestoreEn.title).toBe('Updated title')
    expect(beforeRestoreEn.layoutTwo?.[0]?.textField).toBe('Updated source block')

    const versions = await payload.findVersions({
      collection: 'nested-field-collection',
      where: {
        parent: {
          equals: created.id,
        },
      },
      sort: 'createdAt',
    })

    // create → de_DE update → en update. Restore the snapshot that still
    // has both locales, before the later English edit.
    const versionWithBothLocales = versions.docs[1]
    expect(versionWithBothLocales).toBeDefined()

    await expect(
      payload.restoreVersion({
        collection: 'nested-field-collection',
        id: versionWithBothLocales.id,
        locale: 'en',
      }),
    ).resolves.toBeDefined()

    // Payload restores the whole version across locales. English reverts;
    // German stays. title is not localized, so it comes from that snapshot.
    const restoredEn = await payload.findByID({
      collection: 'nested-field-collection',
      id: created.id,
      locale: 'en',
    })
    const restoredDe = await payload.findByID({
      collection: 'nested-field-collection',
      id: created.id,
      locale: 'de_DE',
    })

    expect(restoredEn.title).toBe('Deutscher Titel')
    expect(restoredEn.layoutTwo?.[0]?.textField).toBe('Source block')
    expect(restoredDe.layoutTwo?.[0]?.textField).toBe('Deutscher Block')
  })
})
