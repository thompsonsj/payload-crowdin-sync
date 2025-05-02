import fs from 'fs'

const removeFiles = (dir: string) => {
  if (fs.existsSync(dir))
    fs.readdirSync(dir).forEach((f) => {
      if (f.startsWith('cristian-palmer-XexawgzYOBc-unsplash')) {
        fs.rmSync(`${dir}/${f}`)
      }
    })
}

import { getFilesByDocumentID, isDefined, utilities, mockCrowdinClient } from 'payload-crowdin-sync'
import Policies from '../../collections/Policies'
import { fixture } from './lexical-editor-with-blocks-and-an-image.fixture'
import nock from 'nock'
import { pluginConfig } from '../helpers/plugin-config'
import { CrowdinArticleDirectory, Media, Policy } from '../../payload-types'
import { initPayloadInt } from '../helpers/initPayloadInt'
import type { Payload } from 'payload'
import { getFileByPath } from 'payload'
import path from 'path'

let payload: Payload
let media: Media

const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)

describe('Lexical editor with blocks', () => {
  beforeAll(async () => {
    const initialized = await initPayloadInt()
    ;({ payload } = initialized as {
      payload: Payload
    })
    const uploadsDir = path.resolve(__dirname, './../../media')
    removeFiles(uploadsDir)
    const imageFilePath = path.resolve(__dirname, './cristian-palmer-XexawgzYOBc-unsplash.jpg')
    const imageFile = await getFileByPath(imageFilePath)
    media = await payload.create({
      collection: 'media',
      data: {},
      file: imageFile,
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

  it('builds a Crowdin HTML object as expected', async () => {
    /**
     * Compare with dev/src/tests/fields/lexical-editor-with-blocks.test.ts where multiple storage and file calls are made
     * This fixture has blocks that are not localized, so only one storage and file call is made
     */
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(2)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(1)
      // .times(4)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(1)
      // .times(4)
      .reply(200, mockClient.createFile({}))

    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: fixture(media.id),
      },
    })

    expect(
      utilities.buildCrowdinHtmlObject({
        doc: policy,
        fields: Policies.fields,
      }),
    ).toEqual({
      content: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: "What happens if a block doesn't have any localized fields?",
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              textFormat: 0,
              textStyle: '',
              type: 'paragraph',
              version: 1,
            },
            {
              fields: {
                blockName: '',
                blockType: 'cookieTable',
                cookieCategoryId: 'strictlyNecessary',
                id: '678564c06ec4a6f1fcf6a623',
              },
              format: '',
              type: 'block',
              version: 2,
            },
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'For example - a block that only contains a select field, which is included twice for good measure!',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              textFormat: 0,
              textStyle: '',
              type: 'paragraph',
              version: 1,
            },
            {
              fields: {
                blockName: '',
                blockType: 'cookieTable',
                cookieCategoryId: 'functional',
                id: '678564926ec4a6f1fcf6a622',
              },
              format: '',
              type: 'block',
              version: 2,
            },
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Also, can we include images and expect those to be included in the final version?',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              textFormat: 0,
              textStyle: '',
              type: 'paragraph',
              version: 1,
            },
            {
              children: [],
              direction: null,
              format: '',
              indent: 0,
              textFormat: 0,
              textStyle: '',
              type: 'paragraph',
              version: 1,
            },
            {
              fields: null,
              format: '',
              id: '6807d878f8296947487161eb',
              relationTo: 'media',
              type: 'upload',
              value: {
                createdAt: media.createdAt,
                filename: 'cristian-palmer-XexawgzYOBc-unsplash.jpg',
                filesize: 1491638,
                focalX: 50,
                focalY: 50,
                height: 3000,
                id: media.id,
                mimeType: 'image/jpeg',
                sizes: {
                  card: {
                    filename: 'cristian-palmer-XexawgzYOBc-unsplash-768x1024.jpg',
                    filesize: 85547,
                    height: 1024,
                    mimeType: 'image/jpeg',
                    url: '/api/media/file/cristian-palmer-XexawgzYOBc-unsplash-768x1024.jpg',
                    width: 768,
                  },
                  tablet: {
                    filename: 'cristian-palmer-XexawgzYOBc-unsplash-1024x768.jpg',
                    filesize: 76596,
                    height: 768,
                    mimeType: 'image/jpeg',
                    url: '/api/media/file/cristian-palmer-XexawgzYOBc-unsplash-1024x768.jpg',
                    width: 1024,
                  },
                  thumbnail: {
                    filename: 'cristian-palmer-XexawgzYOBc-unsplash-400x300.jpg',
                    filesize: 13898,
                    height: 300,
                    mimeType: 'image/jpeg',
                    url: '/api/media/file/cristian-palmer-XexawgzYOBc-unsplash-400x300.jpg',
                    width: 400,
                  },
                },
                thumbnailURL: '/api/media/file/cristian-palmer-XexawgzYOBc-unsplash-400x300.jpg',
                updatedAt: media.updatedAt,
                url: '/api/media/file/cristian-palmer-XexawgzYOBc-unsplash.jpg',
                width: 4000,
              },
              version: 3,
            },
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Some final paragraph text - for good measure (overused phrase at this point).',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              textFormat: 0,
              textStyle: '',
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      },
    })
  })

  it('builds a Crowdin JSON object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(2)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(2)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(2)
      .reply(200, mockClient.createFile({}))

    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: fixture(media.id),
      },
    })
    expect(
      utilities.buildCrowdinJsonObject({
        doc: policy,
        fields: Policies.fields,
      }),
    ).toMatchInlineSnapshot(`
      {
        "title": "Test policy",
      }
    `)
  })

  it('builds a Payload update object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .twice()
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(2)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(2)
      .reply(200, mockClient.createFile({}))

    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: fixture(media.id),
      },
    })
    const crowdinHtmlObject = utilities.buildCrowdinHtmlObject({
      doc: policy,
      fields: Policies.fields,
    })
    const crowdinJsonObject = utilities.buildCrowdinJsonObject({
      doc: policy,
      fields: Policies.fields,
    })
    expect(
      utilities.buildPayloadUpdateObject({
        crowdinJsonObject,
        crowdinHtmlObject,
        fields: Policies.fields,
        document: policy,
      }),
    ).toEqual({
      content: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: "What happens if a block doesn't have any localized fields?",
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              textFormat: 0,
              textStyle: '',
              type: 'paragraph',
              version: 1,
            },
            {
              fields: {
                blockName: '',
                blockType: 'cookieTable',
                cookieCategoryId: 'strictlyNecessary',
                id: '678564c06ec4a6f1fcf6a623',
              },
              format: '',
              type: 'block',
              version: 2,
            },
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'For example - a block that only contains a select field, which is included twice for good measure!',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              textFormat: 0,
              textStyle: '',
              type: 'paragraph',
              version: 1,
            },
            {
              fields: {
                blockName: '',
                blockType: 'cookieTable',
                cookieCategoryId: 'functional',
                id: '678564926ec4a6f1fcf6a622',
              },
              format: '',
              type: 'block',
              version: 2,
            },
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Also, can we include images and expect those to be included in the final version?',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              textFormat: 0,
              textStyle: '',
              type: 'paragraph',
              version: 1,
            },
            {
              children: [],
              direction: null,
              format: '',
              indent: 0,
              textFormat: 0,
              textStyle: '',
              type: 'paragraph',
              version: 1,
            },
            {
              fields: null,
              format: '',
              id: '6807d878f8296947487161eb',
              relationTo: 'media',
              type: 'upload',
              value: {
                createdAt: media.createdAt,
                filename: 'cristian-palmer-XexawgzYOBc-unsplash.jpg',
                filesize: 1491638,
                focalX: 50,
                focalY: 50,
                height: 3000,
                id: media.id,
                mimeType: 'image/jpeg',
                sizes: {
                  card: {
                    filename: 'cristian-palmer-XexawgzYOBc-unsplash-768x1024.jpg',
                    filesize: 85547,
                    height: 1024,
                    mimeType: 'image/jpeg',
                    url: '/api/media/file/cristian-palmer-XexawgzYOBc-unsplash-768x1024.jpg',
                    width: 768,
                  },
                  tablet: {
                    filename: 'cristian-palmer-XexawgzYOBc-unsplash-1024x768.jpg',
                    filesize: 76596,
                    height: 768,
                    mimeType: 'image/jpeg',
                    url: '/api/media/file/cristian-palmer-XexawgzYOBc-unsplash-1024x768.jpg',
                    width: 1024,
                  },
                  thumbnail: {
                    filename: 'cristian-palmer-XexawgzYOBc-unsplash-400x300.jpg',
                    filesize: 13898,
                    height: 300,
                    mimeType: 'image/jpeg',
                    url: '/api/media/file/cristian-palmer-XexawgzYOBc-unsplash-400x300.jpg',
                    width: 400,
                  },
                },
                thumbnailURL: '/api/media/file/cristian-palmer-XexawgzYOBc-unsplash-400x300.jpg',
                updatedAt: media.updatedAt,
                url: '/api/media/file/cristian-palmer-XexawgzYOBc-unsplash.jpg',
                width: 4000,
              },
              version: 3,
            },
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Some final paragraph text - for good measure (overused phrase at this point).',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              textFormat: 0,
              textStyle: '',
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      },
      title: 'Test policy',
    })
  })

  it('creates an HTML file for Crowdin as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .twice()
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(2)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(2)
      .reply(200, mockClient.createFile({}))

    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: fixture(media.id),
      },
    })
    // update now that a Crowdin article directory is available
    await payload.update({
      id: policy.id,
      collection: 'policies',
      data: {
        title: 'Test policy',
      },
    })
    const crowdinFiles = await getFilesByDocumentID({ documentId: `${policy.id}`, payload })
    const contentHtmlFile = crowdinFiles.find((file) => file.field === 'content')
    expect(contentHtmlFile?.fileData?.html).toMatchInlineSnapshot(
      `"<p>What happens if a block doesn't have any localized fields?</p><span data-block-id=678564c06ec4a6f1fcf6a623 data-block-type=cookieTable></span><p>For example - a block that only contains a select field, which is included twice for good measure!</p><span data-block-id=678564926ec4a6f1fcf6a622 data-block-type=cookieTable></span><p>Also, can we include images and expect those to be included in the final version?</p><p><br /></p><span data-block-id=68148917b8d7e7f63cb56e54 data-relation-to=media data-block-type="pcsUpload"></span><p>Some final paragraph text - for good measure (overused phrase at this point).</p>"`,
    )
  })

  it('creates HTML files for Crowdin as expected for lexical content within an array field that is embedded in a group', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(3)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(3)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(3)
      .reply(200, mockClient.createFile({}))

    const policy: Policy = (await payload.create({
      collection: 'policies',
      data: {
        group: {
          array: [
            {
              title: 'Test sub-policy 1',
              content: fixture(media.id),
            },
            {
              title: 'Test sub-policy 2',
              content: fixture(media.id),
            },
          ],
        },
      },
    })) as any

    const arrayField = isDefined(policy['group']?.['array']) ? policy['group']?.['array'] : []
    const ids = arrayField.map((item) => item.id) || ([] as string[])

    const crowdinFiles = await getFilesByDocumentID({ documentId: `${policy.id}`, payload })
    expect(crowdinFiles.length).toEqual(3)

    const htmlFileOne = crowdinFiles.find(
      (file) => file.name === `group.array.${ids[0]}.content.html`,
    )
    const htmlFileTwo = crowdinFiles.find(
      (file) => file.name === `group.array.${ids[1]}.content.html`,
    )

    expect(htmlFileOne).toBeDefined()
    expect(htmlFileTwo).toBeDefined()
    expect(crowdinFiles.find((file) => file.name === 'fields.json')).toBeDefined()

    const fileOneCrowdinFiles = await getFilesByDocumentID({
      documentId: `${pluginOptions.lexicalBlockFolderPrefix}group.array.${ids[0]}.content`,
      payload,
      parent: policy.crowdinArticleDirectory as CrowdinArticleDirectory,
    })
    const fileTwoCrowdinFiles = await getFilesByDocumentID({
      documentId: `${pluginOptions.lexicalBlockFolderPrefix}group.array.${ids[1]}.content`,
      payload,
      parent: policy.crowdinArticleDirectory as CrowdinArticleDirectory,
    })
    expect(fileOneCrowdinFiles.length).toEqual(0)
    expect(fileTwoCrowdinFiles.length).toEqual(0)

    expect(htmlFileOne?.fileData?.html).toMatchInlineSnapshot(
      `"<p>What happens if a block doesn't have any localized fields?</p><span data-block-id=678564c06ec4a6f1fcf6a623 data-block-type=cookieTable></span><p>For example - a block that only contains a select field, which is included twice for good measure!</p><span data-block-id=678564926ec4a6f1fcf6a622 data-block-type=cookieTable></span><p>Also, can we include images and expect those to be included in the final version?</p><p><br /></p><span data-block-id=68148917b8d7e7f63cb56e54 data-relation-to=media data-block-type="pcsUpload"></span><p>Some final paragraph text - for good measure (overused phrase at this point).</p>"`,
    )

    expect(htmlFileTwo?.fileData?.html).toMatchInlineSnapshot(
      `"<p>What happens if a block doesn't have any localized fields?</p><span data-block-id=678564c06ec4a6f1fcf6a623 data-block-type=cookieTable></span><p>For example - a block that only contains a select field, which is included twice for good measure!</p><span data-block-id=678564926ec4a6f1fcf6a622 data-block-type=cookieTable></span><p>Also, can we include images and expect those to be included in the final version?</p><p><br /></p><span data-block-id=68148917b8d7e7f63cb56e54 data-relation-to=media data-block-type="pcsUpload"></span><p>Some final paragraph text - for good measure (overused phrase at this point).</p>"`,
    )
  })
})
