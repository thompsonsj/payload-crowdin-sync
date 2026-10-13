import { convertHtmlToLexical } from './richTextConversion';
import { getTestLexicalEditorConfig } from './tests/htmlToLexical/editor-config';
import type { SanitizedServerEditorConfig } from '@payloadcms/richtext-lexical';

describe('Rich Text Conversion', () => {
  let editorConfig: SanitizedServerEditorConfig;

  beforeAll(async () => {
    editorConfig = await getTestLexicalEditorConfig();
  });

  it('should convert HTML to Lexical format', () => {
    const htmlString = '<p>Hello, <strong>world</strong>!</p>';
    const result = convertHtmlToLexical(htmlString, { editorConfig });
    const paragraph = result.root.children[0] as unknown as {
      type: string;
      children: Array<{ text: string; format: number }>;
    };
    expect(paragraph.type).toBe('paragraph');
    expect(paragraph.children.map((c) => c.text)).toEqual(['Hello, ', 'world', '!']);
    expect(paragraph.children[1]?.format & 1).toBeTruthy();
  });

  it('should handle custom block translations', () => {
    const htmlString =
      '<span data-block-id="123" data-block-type="custom">Custom Block</span>';
    const blockTranslations = {
      blocks: [{ id: '123', blockType: 'custom', name: 'Bloque personalizado' }],
    };
    const result = convertHtmlToLexical(htmlString, {
      editorConfig,
      blockTranslations,
    });
    const block = result.root.children.find((n) => n.type === 'block');
    expect(block).toMatchObject({
      type: 'block',
      fields: {
        id: '123',
        name: 'Bloque personalizado',
      },
    });
  });

  it('should handle uploads via Payload data-lexical-upload attributes', () => {
    const htmlString =
      '<img data-lexical-upload-id="123" data-lexical-upload-relation-to="media" src="/file.jpg" alt="" />';
    const result = convertHtmlToLexical(htmlString, { editorConfig });
    const upload = result.root.children.find((n) => n.type === 'upload') as unknown as {
      version: number;
      id?: string;
    };
    expect(upload).toMatchObject({
      type: 'upload',
      relationTo: 'media',
      value: '123',
      version: 3,
    });
    expect(typeof upload.id).toBe('string');
  });
});
