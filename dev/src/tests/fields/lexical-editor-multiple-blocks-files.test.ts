import { getFilesByDocumentID, isDefined } from 'payload-crowdin-sync'
import nock from 'nock'
import { pluginConfig } from '../helpers/plugin-config'
import { CrowdinArticleDirectory, Policy } from '../../payload-types'
import { getFixture } from './lexical-editor-with-multiple-blocks.fixture'
import { setupLexicalTest } from './lexical-editor-multiple-blocks-shared'
import { nockLexical } from '../helpers/nock-lexical'
import type { Payload } from 'payload'
import type { Media } from '../../payload-types'

let payload: Payload
let media: Media
const pluginOptions = pluginConfig()

describe('Lexical editor with multiple blocks - Files', () => {
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

  it('creates HTML files for Crowdin as expected', async () => {
    nockLexical()
      .directories(2)
      .storages(4)
      .files(4)
      .build()

    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: getFixture(media.id),
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
    const crowdinFiles = await getFilesByDocumentID({
      documentId: `${policy.id}`,
      payload,
    })
    const contentHtmlFile = crowdinFiles.find((file) => file.field === 'content')
    expect(contentHtmlFile?.fileData?.html).toMatchInlineSnapshot(`
      "<p>Sample content for a Lexical rich text field with multiple blocks.</p><span data-block-id=65d67d2591c92e447e7472f7 data-block-type=cta></span><p>A bulleted list in-between some blocks consisting of:</p><ul class="list-bullet"><li
                class=""
                style=""
                value="1"
              >one bullet list item; and</li><li
                class=""
                style=""
                value="2"
              >another!</li></ul><span data-block-id=65d67d8191c92e447e7472f8 data-block-type=highlight></span><span data-block-id=65d67e2291c92e447e7472f9 data-block-type=imageText></span><ul class="list-bullet"><li
                class=""
                style=""
                value="1"
              ></li></ul>"
    `)
    const contentBlocksCrowdinFiles = await getFilesByDocumentID({
      documentId: `${pluginOptions.lexicalBlockFolderPrefix}content`,
      payload,
      parent: policy['crowdinArticleDirectory'] as CrowdinArticleDirectory,
    })
    const contentBlocksHtmlFile = contentBlocksCrowdinFiles.find(
      (file) => file.field?.endsWith('.highlight.content') && file.field?.startsWith('blocks.'),
    )
    expect(contentBlocksHtmlFile?.fileData?.html).toMatchInlineSnapshot(
      `"<p>The plugin parses your block configuration for the Lexical rich text editor. It extracts all block values from the rich text field and then treats this config/data combination as a regular \`blocks\` field.</p><p>Markers are placed in the html and this content is restored into the correct place on translation.</p>"`,
    )
  })

  it('creates HTML files for Crowdin as expected for lexical content within an array field that is embedded in a group', async () => {
    nockLexical()
      .directories(4)
      .storages(7)
      .files(7)
      .build()

    const policy: Policy = (await payload.create({
      collection: 'policies',
      data: {
        group: {
          array: [
            {
              title: 'Test sub-policy 1',
              content: getFixture(media.id),
            },
            {
              title: 'Test sub-policy 2',
              content: getFixture(media.id),
            },
          ],
        },
      },
    })) as any
    const arrayField = isDefined(policy['group']?.['array']) ? policy['group']?.['array'] : []
    const ids = arrayField.map((item) => item.id) || ([] as string[])
    const crowdinFiles = await getFilesByDocumentID({ documentId: `${policy.id}`, payload })
    // top-level Crowdin files
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
    expect(fileOneCrowdinFiles.length).toEqual(2)
    expect(fileTwoCrowdinFiles.length).toEqual(2)
    expect(htmlFileOne?.fileData?.html).toMatchInlineSnapshot(`
      "<p>Sample content for a Lexical rich text field with multiple blocks.</p><span data-block-id=65d67d2591c92e447e7472f7 data-block-type=cta></span><p>A bulleted list in-between some blocks consisting of:</p><ul class="list-bullet"><li
                class=""
                style=""
                value="1"
              >one bullet list item; and</li><li
                class=""
                style=""
                value="2"
              >another!</li></ul><span data-block-id=65d67d8191c92e447e7472f8 data-block-type=highlight></span><span data-block-id=65d67e2291c92e447e7472f9 data-block-type=imageText></span><ul class="list-bullet"><li
                class=""
                style=""
                value="1"
              ></li></ul>"
    `)
    expect(htmlFileTwo?.fileData?.html).toMatchInlineSnapshot(`
      "<p>Sample content for a Lexical rich text field with multiple blocks.</p><span data-block-id=65d67d2591c92e447e7472f7 data-block-type=cta></span><p>A bulleted list in-between some blocks consisting of:</p><ul class="list-bullet"><li
                class=""
                style=""
                value="1"
              >one bullet list item; and</li><li
                class=""
                style=""
                value="2"
              >another!</li></ul><span data-block-id=65d67d8191c92e447e7472f8 data-block-type=highlight></span><span data-block-id=65d67e2291c92e447e7472f9 data-block-type=imageText></span><ul class="list-bullet"><li
                class=""
                style=""
                value="1"
              ></li></ul>"
    `)
  })
})
