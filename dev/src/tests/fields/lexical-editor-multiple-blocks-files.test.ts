import { fixture, fixture2 } from './lexical-editor-with-multiple-blocks.fixture'
import { getFilesByDocumentID, isDefined } from 'payload-crowdin-sync'
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


describe('Lexical editor with multiple blocks - Files', () => {
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
  it('creates HTML files for Crowdin as expected', async () => {
    nockLexical().directories(3).storages(4).files(4).build()
    const policy = await payload.create({
      collection: 'policies',
      data: {
        title: 'Test policy',
        content: injectImageRelationship(structuredClone(fixture), mediaID),
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
    //const contentBlocksHtmlFile = crowdinFiles.find(
    const contentBlocksHtmlFile = contentBlocksCrowdinFiles.find(
      (file) => file.field?.endsWith('.highlight.content') && file.field?.startsWith('blocks.'),
    )
    expect(contentBlocksHtmlFile?.fileData?.html).toMatchInlineSnapshot(
      `"<p>The plugin parses your block configuration for the Lexical rich text editor. It extracts all block values from the rich text field and then treats this config/data combination as a regular \`blocks\` field.</p><p>Markers are placed in the html and this content is restored into the correct place on translation.</p>"`,
    )
  })
  it('creates HTML files for Crowdin as expected for lexical content within an array field that is embedded in a group', async () => {
    nockLexical().directories(3).storages(7).files(7).build()
    const policy: Policy = (await payload.create({
      collection: 'policies',
      data: {
        group: {
          array: [
            {
              title: 'Test sub-policy 1',
              content: injectImageRelationship(structuredClone(fixture), mediaID),
            },
            {
              title: 'Test sub-policy 2',
              content: injectImageRelationship(structuredClone(fixture2), mediaID),
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
    const fileOneHighlightHtml = fileOneCrowdinFiles.find(
      (file) =>
        file.field?.endsWith('.highlight.content') && file.field?.startsWith('blocks.'),
    )
    const fileTwoHighlightHtml = fileTwoCrowdinFiles.find(
      (file) =>
        file.field?.endsWith('.highlight.content') && file.field?.startsWith('blocks.'),
    )
    expect(fileOneHighlightHtml?.fileData?.html).toMatchInlineSnapshot(
      `"<p>The plugin parses your block configuration for the Lexical rich text editor. It extracts all block values from the rich text field and then treats this config/data combination as a regular \`blocks\` field.</p><p>Markers are placed in the html and this content is restored into the correct place on translation.</p>"`,
    )
    expect(fileTwoHighlightHtml?.fileData?.html).toMatchInlineSnapshot(
      `"<p>The plugin parses your block configuration for the Lexical rich text editor. It extracts all block values from the rich text field and then treats this config/data combination as a regular \`blocks\` field.</p><p>Markers are placed in the html and this content is restored into the correct place on translation.</p>"`,
    )
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
      "<span data-block-id=65d67d2591c92e447e7472f7 data-block-type=cta></span><p>A bulleted list in-between some blocks consisting of:</p><ul class="list-bullet"><li
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
