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
import { Window } from 'happy-dom'

const BlockHTMLConverter: HTMLConverter<any> = {
  converter: async ({ node }) => {
    return `<span data-block-id=${node.fields.id}}></span>`
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
  const headlessEditor = createHeadlessEditor({ ...editorConfig, nodes: [] });
  headlessEditor.update(() => {
    
    let document
    if (process.env['NODE_ENV'] === "test") {
      const contextWindow = new Window()
      document = contextWindow.document;
      document.body.innerHTML = htmlString;
    } else {
      const parser = new DOMParser();
      document = parser.parseFromString(htmlString, "text/html");
    }

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

  const editorJSON = headlessEditor.getEditorState().toJSON()

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
