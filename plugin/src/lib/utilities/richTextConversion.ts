import {
  slateToHtml,
  payloadSlateToHtmlConfig,
  type SlateToHtmlConfig,
  htmlToSlate,
  payloadHtmlToSlateConfig,
  type HtmlToSlateConfig,
} from "@slate-serializers/html"

import {
  SerializedUploadNode,
  UploadData,
  type SanitizedServerEditorConfig as SanitizedEditorConfig,
} from '@payloadcms/richtext-lexical'

import { convertLexicalToHTML, HTMLConverters } from '@payloadcms/richtext-lexical/html'

import {
  convertSlateToLexical,
  defaultSlateConverters,
} from '@payloadcms/richtext-lexical/migrate'

import { getAttributeValue } from 'domutils'
import { SlateBlockConverter } from "./lexical/slateBlockConverter";
import { cloneDeep } from "es-toolkit";

import type { Descendant } from "slate";
import type { SerializedEditorState } from 'lexical'

import { getLexicalBlockFields } from "./lexical"
import { FileData, TypeWithID } from "payload"

export const convertLexicalToHtml = async (editorData: SerializedEditorState, editorConfig: SanitizedEditorConfig) => {
  const blockSlugs = getLexicalBlockFields(editorConfig)?.blocks.map(block => block.slug)
  const blockConvertors = blockSlugs?.reduce((acc, slug) => {
    acc[slug] = ({ node }) => {
      const blockId = node.fields.id
      const blockType = node.fields.blockType
      return `<span data-block-id=${blockId} data-block-type=${blockType}></span>`
    }
    return acc
  }, {}) || {}

  /**
   * This is a custom HTML converter for the Upload node type.
   * 
   * Place a marker in the HTML output to indicate where the upload node is.
   * When translations are applied, the marker will be replaced with the actual upload node.
   */
  const UploadHTMLConverter: HTMLConverters<SerializedUploadNode> = {
    upload: ({ node }) => {
    return `<span data-block-id=${node.id} data-relation-to=${node.relationTo} data-block-type="pcsUpload"></span>`
  }}

  return convertLexicalToHTML({
    converters: ({
      defaultConverters,
    }) => ({
      ...defaultConverters,
      ...UploadHTMLConverter,
      blocks: blockConvertors,
    }),
    data: editorData,
    disableContainer: true,
  })
}

export const convertHtmlToLexical = (htmlString: string,  blockTranslations?: {
  [key: string]: any;
} | null) => {
  // use editorConfig to determine custom convertors
  const converters = cloneDeep([
    ...defaultSlateConverters,
    SlateBlockConverter,
    // AnotherCustomConverter
  ])

  const htmlToSlateConfig = {
    ...payloadHtmlToSlateConfig,
    elementTags: {
      ...payloadHtmlToSlateConfig.elementTags,
      span: (el) => {
        const blockId = el && getAttributeValue(el, 'data-block-id')
        const blockType = el && getAttributeValue(el, 'data-block-type')

        /**
        if (!blockId || !blockType) {
          return undefined
        }
          */

        if (blockType === 'pcsUpload') {
          const relationTo = el && getAttributeValue(el, 'data-relation-to')
          return {
            type: 'upload',
            relationTo,
            value: {
              id: blockId,
            },
          }
        } else {
          const translation = (blockTranslations?.['blocks'] || []).find((block: any) => block.id === blockId)

            return {
            // use a relatively obscure name to reduce likelihood of a clash with an existing Slate editor configuration `nodeType`.
            type: 'pcs-block',
            // fieldName needed to obtain translations?
            translation,
            blockId,
            blockType,
          }
        }
      },
    },
  } as HtmlToSlateConfig
  return convertSlateToLexical({
    converters: converters,
    slateData: convertHtmlToSlate(htmlString, htmlToSlateConfig),
  })
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
