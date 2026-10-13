import {
  slateToHtml,
  payloadSlateToHtmlConfig,
  type SlateToHtmlConfig,
  htmlToSlate,
  payloadHtmlToSlateConfig,
  type HtmlToSlateConfig,
} from '@slate-serializers/html';

import {
  SerializedRelationshipNode,
  SerializedUploadNode,
  type SanitizedServerEditorConfig as SanitizedEditorConfig,
} from '@payloadcms/richtext-lexical';

import {
  convertLexicalToHTML,
  HTMLConverters,
} from '@payloadcms/richtext-lexical/html';

import type { Descendant } from 'slate';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';

import { getLexicalBlockFields } from './lexical';

export {
  convertHtmlToLexical,
  rewriteCrowdinHtmlForLexical,
} from './htmlToLexical';
export type { ConvertHtmlToLexicalOptions } from './htmlToLexical';

export const convertLexicalToHtml = async (
  editorData: SerializedEditorState,
  editorConfig: SanitizedEditorConfig,
) => {
  const blockSlugs = getLexicalBlockFields(editorConfig)?.blocks.map(
    (block) => block.slug,
  );
  const blockConvertors = (blockSlugs ?? []).reduce<
    Record<string, ({ node }: { node: any }) => string>
  >((acc, slug) => {
    acc[slug] = ({ node }) => {
      const blockId = node.fields.id;
      const blockType = node.fields.blockType;
      return `<span data-block-id=${blockId} data-block-type=${blockType}></span>`;
    };
    return acc;
  }, {});

  /**
   * This is a custom HTML converter for the Upload node type.
   *
   * Place a marker in the HTML output to indicate where the upload node is.
   * When translations are applied, the marker will be replaced with the actual upload node.
   */
  const UploadHTMLConverter: HTMLConverters<SerializedUploadNode> = {
    upload: ({ node }) => {
      const uploadValueId = (node: SerializedUploadNode) => {
        if (typeof node.value === 'number') {
          return `${node.value}`;
        }
        if (typeof node.value === 'string') {
          return node.value;
        }
        return node.value.id;
      };

      // naming is unfortunate here - we are reusing structure from blocks
      // refactor to indicate type? i.e. block or upload?
      // in this case, data-block-id is not block id, but upload id
      return `<span data-block-id=${uploadValueId(node)} data-relation-to=${node.relationTo} data-block-type="pcsUpload"></span>`;
    },
  };

  /**
   * This is a custom HTML converter for the Relationship node type.
   *
   * Place a marker in the HTML output to indicate where the relationship node is.
   * When translations are applied, the marker will be replaced with the actual upload node.
   */
  const RelationshipHTMLConverter: HTMLConverters<SerializedRelationshipNode> = {
    relationship: ({ node }) => {
      const relationshipValueId = (node: SerializedRelationshipNode) => {
        if (typeof node.value === 'number') {
          return `${node.value}`;
        }
        if (typeof node.value === 'string') {
          return node.value;
        }
        return node.value.id;
      };

      // naming is unfortunate here - we are reusing structure from blocks
      // refactor to indicate type? i.e. block or upload?
      // in this case, data-block-id is not block id, but upload id
      return `<span data-block-id=${relationshipValueId(node)} data-relation-to=${node.relationTo} data-block-type="pcsRelationship"></span>`;
    },
  };

  return convertLexicalToHTML({
    converters: ({ defaultConverters }) => ({
      ...defaultConverters,
      ...UploadHTMLConverter,
      ...RelationshipHTMLConverter,
      blocks: blockConvertors,
    }),
    data: editorData,
    disableContainer: true,
  });
};

export const convertSlateToHtml = (
  slate: Descendant[],
  customConfig?: SlateToHtmlConfig,
): string => {
  if (customConfig) {
    return slateToHtml(slate, customConfig);
  }
  return slateToHtml(slate, payloadSlateToHtmlConfig);
};

export const convertHtmlToSlate = (
  html: string,
  customConfig?: HtmlToSlateConfig,
): Descendant[] => {
  if (customConfig) {
    return htmlToSlate(html, customConfig);
  }
  return htmlToSlate(html, payloadHtmlToSlateConfig);
};
