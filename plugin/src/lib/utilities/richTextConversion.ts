import {
  slateToHtml,
  payloadSlateToHtmlConfig,
  type SlateToHtmlConfig,
  htmlToSlate,
  payloadHtmlToSlateConfig,
  type HtmlToSlateConfig,
} from "@slate-serializers/html"
import type { Descendant } from "slate";

import type { SerializedEditorState } from 'lexical'
import {
  BlockNode,
  HTMLConverter,
  type SanitizedEditorConfig,
  convertLexicalToHTML,
  consolidateHTMLConverters,
} from '@payloadcms/richtext-lexical'

import { createHeadlessEditor } from '@lexical/headless';
import {$generateNodesFromDOM} from '@lexical/html';
import { $getRoot, $getSelection } from 'lexical'

const BlockHTMLConverter: HTMLConverter<any> = {
  converter: async ({ node }) => {
    return `<span data-block-id=${node.fields.id}></span>`
  },
  nodeTypes: [BlockNode.getType()],
}

export const convertLexicalToHtml = async (editorData: SerializedEditorState, editorConfig: SanitizedEditorConfig) => {
  return await convertLexicalToHTML({
    converters: [
      ...consolidateHTMLConverters({ editorConfig }),
      BlockHTMLConverter,
    ],
    data: editorData,
  })
}

export const convertHtmlToLexical = async (htmlString: string, editorConfig: SanitizedEditorConfig) => {
  const editorJSON = await (async () => {
    const HappyDom = await import('happy-dom').then(psl => psl)
    const window = new HappyDom.Window()
    const document = window.document
    document.body.innerHTML = htmlString
    const headlessEditor = createHeadlessEditor({ ...editorConfig, nodes: [] })
    headlessEditor.update(() => {
      // Once you have the DOM instance it's easy to generate LexicalNodes.
      // type any required to pass Document type
      // @see https://github.com/capricorn86/happy-dom/issues/1227
      /* eslint-disable  @typescript-eslint/no-explicit-any */
      const nodes = $generateNodesFromDOM(headlessEditor, document as any)
    
      // Select the root
      $getRoot().select()
    
      // Insert them at a selection.
      const selection = $getSelection()
      selection?.insertNodes(nodes)
    }, { discrete: true })

    return headlessEditor.getEditorState().toJSON()

    
  })().catch(console.error)
  return editorJSON
}

export const convertSlateToHtml = (slate: Descendant[], customConfig?: SlateToHtmlConfig): string => {
  if (customConfig) {
    return slateToHtml(slate, customConfig);
  }
  return slateToHtml(slate, payloadSlateToHtmlConfig);
};

export const convertHtmlToSlate = (html: string, customConfig?: HtmlToSlateConfig): Descendant[] => {
  if (customConfig) {
    return htmlToSlate(html, customConfig);
  }
  return htmlToSlate(html, payloadHtmlToSlateConfig);
};
