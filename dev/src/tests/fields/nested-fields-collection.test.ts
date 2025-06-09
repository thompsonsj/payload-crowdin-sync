import { utilities, mockCrowdinClient } from 'payload-crowdin-sync'
import nock from 'nock'
import { pluginConfig } from '../helpers/plugin-config'
import { initPayloadInt } from '../helpers/initPayloadInt'
import type { Payload } from 'payload'
import NestedFieldCollection from '../../collections/NestedFieldCollection'
import { block } from 'sharp'

let payload: Payload

const pluginOptions = pluginConfig()
const mockClient = mockCrowdinClient(pluginOptions)

describe('Nested Fields Collection: blocks field', () => {
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

  it('builds a Crowdin HTML object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(2)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(2)
      // .times(4)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(2)
      // .times(4)
      .reply(200, mockClient.createFile({}))

    const doc = await payload.create({
      collection: 'nested-field-collection',
      data: {
        title: 'Test',
        layout: [
          {
            blockType: 'basicBlock',
            textField: 'Block 1 text',
          },
          {
            blockType: 'basicBlockRichText',
            richTextField: [
              {
                children: [
                  {
                    text: 'This is editable ',
                  },
                  {
                    text: 'rich',
                    bold: true,
                  },
                  {
                    text: ' text, ',
                  },
                  {
                    text: 'much',
                    italic: true,
                  },
                  {
                    text: ' better than a ',
                  },
                  {
                    text: '<textarea>',
                    code: true,
                  },
                  {
                    text: '!',
                  },
                ],
              },
            ],
          },
        ],
      },
    })
    const blockId = doc?.layout?.find((block) => block.blockType === 'basicBlockRichText')?.id
    expect(
      utilities.buildCrowdinHtmlObject({
        doc,
        fields: NestedFieldCollection.fields,
      }),
    ).toEqual({
      [`layout.${blockId}.basicBlockRichText.richTextField`]: [
        {
          children: [
            {
              text: 'This is editable ',
            },
            {
              bold: true,
              text: 'rich',
            },
            {
              text: ' text, ',
            },
            {
              italic: true,
              text: 'much',
            },
            {
              text: ' better than a ',
            },
            {
              code: true,
              text: '<textarea>',
            },
            {
              text: '!',
            },
          ],
        },
      ],
    })
  })

  it('builds a Crowdin JSON object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(1)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(2)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(2)
      .reply(200, mockClient.createFile({}))

    const doc = await payload.create({
      collection: 'nested-field-collection',
      data: {
        title: 'Test',
        layout: [
          {
            blockType: 'basicBlock',
            textField: 'Block 1 text',
          },
          {
            blockType: 'basicBlockRichText',
            richTextField: [
              {
                children: [
                  {
                    text: 'This is editable ',
                  },
                  {
                    text: 'rich',
                    bold: true,
                  },
                  {
                    text: ' text, ',
                  },
                  {
                    text: 'much',
                    italic: true,
                  },
                  {
                    text: ' better than a ',
                  },
                  {
                    text: '<textarea>',
                    code: true,
                  },
                  {
                    text: '!',
                  },
                ],
              },
            ],
          },
        ],
      },
    })
    const blockId = doc?.layout?.find((block) => block.blockType === 'basicBlock')?.id
    expect(
      utilities.buildCrowdinJsonObject({
        doc,
        fields: NestedFieldCollection.fields,
      }),
    ).toEqual({
      layout: {
        [`${blockId}`]: {
          basicBlock: {
            textField: 'Block 1 text',
          },
        },
      },
    })
  })

  it('builds a Crowdin JSON object as expected: excluding blockName', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(1)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(2)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(2)
      .reply(200, mockClient.createFile({}))

    const doc = await payload.create({
      collection: 'nested-field-collection',
      data: {
        title: 'Test',
        layout: [
          {
            blockType: 'basicBlock',
            blockName: 'Block 1',
            textField: 'Block 1 text',
          },
          {
            blockType: 'basicBlockRichText',
            blockName: 'Block 2',
            richTextField: [
              {
                children: [
                  {
                    text: 'This is editable ',
                  },
                  {
                    text: 'rich',
                    bold: true,
                  },
                  {
                    text: ' text, ',
                  },
                  {
                    text: 'much',
                    italic: true,
                  },
                  {
                    text: ' better than a ',
                  },
                  {
                    text: '<textarea>',
                    code: true,
                  },
                  {
                    text: '!',
                  },
                ],
              },
            ],
          },
        ],
      },
    })
    const blockId = doc?.layout?.find((block) => block.blockType === 'basicBlock')?.id
    expect(
      utilities.buildCrowdinJsonObject({
        doc,
        fields: NestedFieldCollection.fields,
      }),
    ).toEqual({
      layout: {
        [`${blockId}`]: {
          basicBlock: {
            textField: 'Block 1 text',
          },
        },
      },
    })
  })

  it('builds a Payload update object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(1)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(2)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(2)
      .reply(200, mockClient.createFile({}))

    const doc = await payload.create({
      collection: 'nested-field-collection',
      data: {
        title: 'Test',
        layout: [
          {
            blockType: 'basicBlock',
            textField: 'Block 1 text',
          },
          {
            blockType: 'basicBlockRichText',
            richTextField: [
              {
                children: [
                  {
                    text: 'This is editable ',
                  },
                  {
                    text: 'rich',
                    bold: true,
                  },
                  {
                    text: ' text, ',
                  },
                  {
                    text: 'much',
                    italic: true,
                  },
                  {
                    text: ' better than a ',
                  },
                  {
                    text: '<textarea>',
                    code: true,
                  },
                  {
                    text: '!',
                  },
                ],
              },
            ],
          },
        ],
      },
    })
    const crowdinHtmlObject = utilities.buildCrowdinHtmlObject({
      doc,
      fields: NestedFieldCollection.fields,
    })
    const crowdinJsonObject = utilities.buildCrowdinJsonObject({
      doc,
      fields: NestedFieldCollection.fields,
    })
    const blockIdBasic = doc?.layout?.find((block) => block.blockType === 'basicBlock')?.id
    const blockIdBasicRichText = doc?.layout?.find((block) => block.blockType === 'basicBlockRichText')?.id
    expect(
      utilities.buildPayloadUpdateObject({
        crowdinJsonObject,
        crowdinHtmlObject,
        fields: NestedFieldCollection.fields,
        document: doc,
      }),
    ).toEqual(
      {
        "layout": [
          {
            "blockType": "basicBlock",
            "id": blockIdBasic,
            "textField": "Block 1 text",
          },
          {
            "blockType": "basicBlockRichText",
            "id": blockIdBasicRichText,
            "richTextField": [
              {
                "children": [
                  {
                    "text": "This is editable ",
                  },
                  {
                    "bold": true,
                    "text": "rich",
                  },
                  {
                    "text": " text, ",
                  },
                  {
                    "italic": true,
                    "text": "much",
                  },
                  {
                    "text": " better than a ",
                  },
                  {
                    "code": true,
                    "text": "<textarea>",
                  },
                  {
                    "text": "!",
                  },
                ],
              },
            ],
          },
        ],
      }
    )
  })
})
