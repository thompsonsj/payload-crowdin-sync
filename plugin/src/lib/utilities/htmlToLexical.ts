import {
  convertHTMLToLexical,
  type SanitizedServerEditorConfig,
} from '@payloadcms/richtext-lexical';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { JSDOM } from 'jsdom';

const PCS_BLOCK_TOKEN = /^PCS_BLOCK::([^:]+)::(.+)$/;

export type ConvertHtmlToLexicalOptions = {
  editorConfig: SanitizedServerEditorConfig;
  blockTranslations?: {
    [key: string]: any;
  } | null;
};

const emptyEditorState = (): SerializedEditorState => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    direction: 'ltr',
    version: 1,
    children: [],
  },
});

/**
 * Rewrite Crowdin HTML so Payload's convertHTMLToLexical / importDOM can
 * read it: upload and relationship spans become data-lexical-* nodes,
 * block markers become tokens, underline/strikethrough style spans become
 * <u>/<s> (matching convertLexicalToHTML output).
 */
export const rewriteCrowdinHtmlForLexical = (html: string): string => {
  if (!html) {
    return html;
  }
  const dom = new JSDOM(`<body>${html}</body>`);
  const doc = dom.window.document;

  const isInsignificant = (node: ChildNode) =>
    (node.nodeType === node.TEXT_NODE && !node.textContent?.trim()) ||
    (node.nodeType === node.ELEMENT_NODE &&
      (node as Element).tagName === 'BR');

  const liftOutOfParagraph = (el: Element, replacement: Element) => {
    const parent = el.parentElement;
    if (parent?.tagName !== 'P') {
      el.replaceWith(replacement);
      return;
    }
    const others = [...parent.childNodes].filter(
      (node) => node !== el && !isInsignificant(node),
    );
    if (others.length === 0) {
      parent.replaceWith(replacement);
      return;
    }
    el.remove();
    parent.after(replacement);
  };

  for (const el of [...doc.querySelectorAll('[data-block-type]')]) {
    const blockType = el.getAttribute('data-block-type');
    const blockId = el.getAttribute('data-block-id');
    const relationTo = el.getAttribute('data-relation-to');
    if (!blockType || !blockId) {
      continue;
    }
    if (blockType === 'pcsUpload') {
      const img = doc.createElement('img');
      img.setAttribute('data-lexical-upload-id', blockId);
      if (relationTo) {
        img.setAttribute('data-lexical-upload-relation-to', relationTo);
      }
      liftOutOfParagraph(el, img);
    } else if (blockType === 'pcsRelationship') {
      const div = doc.createElement('div');
      div.setAttribute('data-lexical-relationship-id', blockId);
      if (relationTo) {
        div.setAttribute('data-lexical-relationship-relationTo', relationTo);
      }
      liftOutOfParagraph(el, div);
    } else {
      const p = doc.createElement('p');
      p.textContent = `PCS_BLOCK::${blockId}::${blockType}`;
      liftOutOfParagraph(el, p);
    }
  }

  for (const span of [...doc.querySelectorAll('span[style]')]) {
    const style = span.getAttribute('style') || '';
    const underline = /text-decoration:\s*underline/.test(style);
    const strike = /text-decoration:\s*line-through/.test(style);
    if (!underline && !strike) {
      continue;
    }
    const children = [...span.childNodes];
    if (underline && strike) {
      const s = doc.createElement('s');
      const u = doc.createElement('u');
      u.append(...children);
      s.append(u);
      span.replaceWith(s);
    } else if (underline) {
      const u = doc.createElement('u');
      u.append(...children);
      span.replaceWith(u);
    } else {
      const s = doc.createElement('s');
      s.append(...children);
      span.replaceWith(s);
    }
  }

  return doc.body.innerHTML;
};

const pcsBlockTokenFromNode = (
  node: { type?: string; children?: Array<{ type?: string; text?: string }> },
): { id: string; blockType: string } | undefined => {
  if (node.type !== 'paragraph' || !node.children?.length) {
    return undefined;
  }
  if (node.children.some((child) => child.type !== 'text')) {
    return undefined;
  }
  const text = node.children.map((child) => child.text ?? '').join('');
  const match = text.match(PCS_BLOCK_TOKEN);
  if (!match) {
    return undefined;
  }
  return { id: match[1], blockType: match[2] };
};

const fillDefaultDirection = (nodes: any[]): any[] =>
  nodes.map((node) => {
    const next = { ...node };
    if ('direction' in next && next.direction == null) {
      next.direction = 'ltr';
    }
    if (Array.isArray(next.children)) {
      next.children = fillDefaultDirection(next.children);
    }
    return next;
  });

const attachBlockNodes = (
  state: SerializedEditorState,
  blockTranslations?: ConvertHtmlToLexicalOptions['blockTranslations'],
): SerializedEditorState => {
  const translations = blockTranslations?.blocks ?? [];
  const walk = (nodes: any[]): any[] =>
    nodes.flatMap((node) => {
      const token = pcsBlockTokenFromNode(node);
      if (token) {
        const translation = translations.find(
          (block: { id?: string }) => block.id === token.id,
        );
        return [
          {
            type: 'block',
            format: '',
            version: 2,
            fields: translation ?? {
              id: token.id,
              blockType: token.blockType,
            },
          },
        ];
      }
      if (Array.isArray(node.children)) {
        return [{ ...node, children: walk(node.children) }];
      }
      return [node];
    });

  const children = fillDefaultDirection(walk(state.root.children));
  return {
    ...state,
    root: {
      ...state.root,
      direction:
        state.root.direction == null ? 'ltr' : state.root.direction,
      children,
    },
  };
};

/**
 * Convert Crowdin HTML to a Lexical editor state using Payload's
 * convertHTMLToLexical (headless editor + JSDOM). No Slate hop.
 */
export const convertHtmlToLexical = (
  htmlString: string,
  { editorConfig, blockTranslations }: ConvertHtmlToLexicalOptions,
): SerializedEditorState => {
  if (!htmlString?.trim()) {
    return emptyEditorState();
  }
  const html = rewriteCrowdinHtmlForLexical(htmlString);
  let state: SerializedEditorState;
  try {
    state = convertHTMLToLexical({
      editorConfig,
      html,
      JSDOM,
    }) as SerializedEditorState;
  } catch (error) {
    if (error instanceof Error && error.message === 'Selection is null') {
      return emptyEditorState();
    }
    throw error;
  }
  return attachBlockNodes(state, blockTranslations);
};
