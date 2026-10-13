import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { convertHtmlToLexical, convertLexicalToHtml } from '../../richTextConversion';
import { getTestLexicalEditorConfig } from './editor-config';
import type { SanitizedServerEditorConfig } from '@payloadcms/richtext-lexical';

const textNode = (n: { text: string; format?: number }) =>
  expect.objectContaining({
    type: 'text',
    text: n.text,
    ...(n.format !== undefined ? { format: n.format } : {}),
  });

const childTypes = (state: SerializedEditorState) =>
  state.root.children.map((node) => node.type);

describe('fn: convertHtmlToLexical (Payload convertHTMLToLexical, no Slate hop)', () => {
  let editorConfig: SanitizedServerEditorConfig;

  beforeAll(async () => {
    editorConfig = await getTestLexicalEditorConfig();
  });

  const convert = (
    html: string,
    blockTranslations?: { [key: string]: any } | null,
  ) => convertHtmlToLexical(html, { editorConfig, blockTranslations });

  describe('text and formatting', () => {
    it('converts a paragraph with bold', () => {
      const result = convert('<p>Hello, <strong>world</strong>!</p>');
      expect(childTypes(result)).toEqual(['paragraph']);
      const paragraph = result.root.children[0] as {
        children: Array<{ text: string; format: number }>;
      };
      expect(paragraph.children.map((c) => c.text)).toEqual([
        'Hello, ',
        'world',
        '!',
      ]);
      expect(paragraph.children[1]?.format & 1).toBeTruthy();
    });

    it('converts italic, underline, strikethrough, subscript and superscript', () => {
      const result = convert(
        '<p><em>italic</em> <u>under</u> <s>strike</s> <sub>sub</sub> <sup>sup</sup></p>',
      );
      const texts = (
        result.root.children[0] as { children: Array<{ text: string; format: number }> }
      ).children.filter((c) => c.text?.trim());
      expect(texts.map((c) => c.text)).toEqual([
        'italic',
        'under',
        'strike',
        'sub',
        'sup',
      ]);
      expect(texts[0]?.format & 2).toBeTruthy();
      expect(texts[1]?.format & 8).toBeTruthy();
      expect(texts[2]?.format & 4).toBeTruthy();
      expect(texts[3]?.format & 32).toBeTruthy();
      expect(texts[4]?.format & 64).toBeTruthy();
    });

    it('restores underline and strikethrough from Payload span style output', () => {
      const result = convert(
        '<p><span style="text-decoration: underline;">under</span><span style="text-decoration: line-through;">strike</span></p>',
      );
      const texts = (
        result.root.children[0] as { children: Array<{ text: string; format: number }> }
      ).children.filter((c) => c.text);
      expect(texts[0]).toEqual(textNode({ text: 'under', format: 8 }));
      expect(texts[1]).toEqual(textNode({ text: 'strike', format: 4 }));
    });

    it('converts headings, quotes, lists and links', () => {
      const result = convert(
        '<h2>Title</h2><blockquote>Quote</blockquote><ul><li>One</li><li>Two</li></ul><p><a href="https://example.com">link</a></p>',
      );
      expect(childTypes(result)).toEqual([
        'heading',
        'quote',
        'list',
        'paragraph',
      ]);
      expect(result.root.children[0]).toEqual(
        expect.objectContaining({ type: 'heading', tag: 'h2' }),
      );
      const list = result.root.children[2] as { listType?: string; tag?: string };
      expect(list.listType ?? list.tag).toMatch(/bullet|ul/);
      const paragraph = result.root.children[3] as {
        children: Array<{ type: string; url?: string; children?: Array<{ text: string }> }>;
      };
      const link = paragraph.children.find((c) => c.type === 'link');
      expect(link).toBeDefined();
      expect(link?.url ?? (link as { fields?: { url?: string } }).fields?.url).toBe(
        'https://example.com',
      );
    });

    it('converts inline code', () => {
      const result = convert('<p>use <code>code</code></p>');
      const code = (
        result.root.children[0] as { children: Array<{ text: string; format: number }> }
      ).children.find((c) => c.text === 'code');
      expect(code?.format & 16).toBeTruthy();
    });
  });

  describe('Payload-native HTML (not Crowdin span markers)', () => {
    it('imports an upload from data-lexical-upload attributes', () => {
      const result = convert(
        '<p>before</p><img data-lexical-upload-id="media-1" data-lexical-upload-relation-to="media" src="/media/file.jpg" alt="" /><p>after</p>',
      );
      const upload = result.root.children.find((n) => n.type === 'upload') as {
        relationTo: string;
        value: string;
        version: number;
        id?: string;
      };
      expect(upload).toMatchObject({
        type: 'upload',
        relationTo: 'media',
        value: 'media-1',
        version: 3,
      });
      expect(typeof upload.id).toBe('string');
    });

    it('imports a relationship from data-lexical-relationship attributes', () => {
      const result = convert(
        '<p>before</p><div data-lexical-relationship-id="page-1" data-lexical-relationship-relationTo="pages"></div><p>after</p>',
      );
      const relationship = result.root.children.find((n) => n.type === 'relationship');
      expect(relationship).toMatchObject({
        type: 'relationship',
        relationTo: 'pages',
        value: 'page-1',
      });
    });
  });

  describe('Crowdin span markers', () => {
    it('restores uploads from pcsUpload spans', () => {
      const result = convert(
        '<span data-block-id="123" data-block-type="pcsUpload" data-relation-to="media">Upload</span>',
      );
      const upload = result.root.children.find((n) => n.type === 'upload') as {
        value: unknown;
        version: number;
      };
      expect(upload).toMatchObject({
        type: 'upload',
        relationTo: 'media',
        version: 3,
      });
      expect(upload.value === '123' || (upload.value as { id?: string })?.id === '123').toBe(
        true,
      );
    });

    it('restores relationships from pcsRelationship spans', () => {
      const result = convert(
        '<span data-block-id="page-9" data-block-type="pcsRelationship" data-relation-to="pages">Rel</span>',
      );
      expect(result.root.children.find((n) => n.type === 'relationship')).toMatchObject({
        type: 'relationship',
        relationTo: 'pages',
        value: 'page-9',
      });
    });

    it('restores lexical blocks from span markers and Crowdin block translations', () => {
      const result = convert(
        '<span data-block-id="123" data-block-type="custom">Custom Block</span>',
        { blocks: [{ id: '123', blockType: 'custom', name: 'Bloque personalizado' }] },
      );
      const block = result.root.children.find((n) => n.type === 'block');
      expect(block).toMatchObject({
        type: 'block',
        fields: {
          id: '123',
          name: 'Bloque personalizado',
        },
      });
    });

    it('keeps block type when a marker has no matching translation', () => {
      const result = convert(
        '<p>intro</p><span data-block-id="missing" data-block-type="highlight"></span><p>outro</p>',
      );
      const block = result.root.children.find(
        (n) => n.type === 'block' || n.type === 'noTranslation',
      );
      expect(block).toBeDefined();
      if (block?.type === 'block') {
        expect((block as { fields: { id: string; blockType: string } }).fields).toMatchObject({
          id: 'missing',
          blockType: 'highlight',
        });
      } else {
        expect(block?.type).toBe('noTranslation');
      }
    });
  });

  describe('tables', () => {
    it('converts a lexical-table HTML fragment to table / tablerow / tablecell nodes', () => {
      const html = `<div class="lexical-table-container"><table class="lexical-table" style="border-collapse: collapse;"><tbody><tr class="lexical-table-row"><th class="lexical-table-cell lexical-table-cell-header-1">Head</th><td class="lexical-table-cell lexical-table-cell-header-0">Cell</td></tr></tbody></table></div>`;
      const result = convert(html);
      const table = result.root.children.find((n) => n.type === 'table') as {
        children: Array<{
          type: string;
          children: Array<{ type: string; headerState?: number; children: unknown[] }>;
        }>;
      };
      expect(table).toBeDefined();
      expect(table.children[0]?.type).toBe('tablerow');
      const cells = table.children[0]?.children ?? [];
      expect(cells.map((c) => c.type)).toEqual(['tablecell', 'tablecell']);
      expect(cells[0]?.headerState).toBeGreaterThan(0);
      expect(cells[1]?.headerState ?? 0).toBe(0);
    });

    it('keeps paragraphs inside table cells', () => {
      const html = `<table><tr><td><p>One</p><p>Two</p></td></tr></table>`;
      const result = convert(html);
      const table = result.root.children.find((n) => n.type === 'table') as {
        children: Array<{
          children: Array<{ children: Array<{ type: string; children?: Array<{ text: string }> }> }>;
        }>;
      };
      const cellChildren = table.children[0]?.children[0]?.children ?? [];
      expect(cellChildren.map((c) => c.type)).toContain('paragraph');
      const texts = cellChildren.flatMap(
        (c) => c.children?.map((t) => t.text) ?? [],
      );
      expect(texts).toEqual(expect.arrayContaining(['One', 'Two']));
    });
  });

  describe('mixed documents and round-trip', () => {
    it('preserves order of paragraph, block marker and upload marker', () => {
      const result = convert(
        '<p>Intro</p><span data-block-id="b1" data-block-type="custom"></span><span data-block-id="u1" data-block-type="pcsUpload" data-relation-to="media"></span><p>Outro</p>',
        { blocks: [{ id: 'b1', blockType: 'custom', name: 'X' }] },
      );
      expect(childTypes(result)).toEqual([
        'paragraph',
        'block',
        'upload',
        'paragraph',
      ]);
    });

    it('round-trips convertLexicalToHtml output back to Lexical without a Slate hop', async () => {
      const html = await convertLexicalToHtml(
        {
          root: {
            type: 'root',
            format: '',
            indent: 0,
            direction: 'ltr',
            version: 1,
            children: [
              {
                type: 'heading',
                tag: 'h2',
                format: '',
                indent: 0,
                direction: 'ltr',
                version: 1,
                children: [
                  {
                    type: 'text',
                    text: 'Hello',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    version: 1,
                  },
                ],
              },
              {
                type: 'paragraph',
                format: '',
                indent: 0,
                direction: 'ltr',
                version: 1,
                textFormat: 0,
                textStyle: '',
                children: [
                  {
                    type: 'text',
                    text: 'bold',
                    detail: 0,
                    format: 1,
                    mode: 'normal',
                    style: '',
                    version: 1,
                  },
                ],
              },
            ],
          },
        },
        editorConfig,
      );
      const result = convert(html);
      expect(childTypes(result)).toEqual(['heading', 'paragraph']);
      expect(result.root.children[0]).toEqual(
        expect.objectContaining({ type: 'heading', tag: 'h2' }),
      );
      const paragraph = result.root.children[1] as {
        children: Array<{ text: string; format: number }>;
      };
      expect(paragraph.children[0]?.text).toBe('bold');
      expect(paragraph.children[0]?.format & 1).toBeTruthy();
    });

    it('returns an empty root for empty HTML', () => {
      const result = convert('');
      expect(result.root.type).toBe('root');
      expect(Array.isArray(result.root.children)).toBe(true);
    });
  });
});
