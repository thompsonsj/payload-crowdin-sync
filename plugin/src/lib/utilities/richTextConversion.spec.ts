import { convertHtmlToLexical } from './richTextConversion';
describe('Rich Text Conversion', () => {
  it('should convert HTML to Lexical format', () => {
    const htmlString = '<p>Hello, <strong>world</strong>!</p>';
    const result = convertHtmlToLexical(htmlString, null);
    expect(result).toMatchInlineSnapshot(`
      {
        "root": {
          "children": [
            {
              "children": [
                {
                  "detail": 0,
                  "format": 0,
                  "mode": "normal",
                  "style": "",
                  "text": "Hello, ",
                  "type": "text",
                  "version": 1,
                },
                {
                  "detail": 0,
                  "format": 1,
                  "mode": "normal",
                  "style": "",
                  "text": "world",
                  "type": "text",
                  "version": 1,
                },
                {
                  "detail": 0,
                  "format": 0,
                  "mode": "normal",
                  "style": "",
                  "text": "!",
                  "type": "text",
                  "version": 1,
                },
              ],
              "direction": "ltr",
              "format": "",
              "indent": 0,
              "textFormat": 0,
              "textStyle": "",
              "type": "paragraph",
              "version": 1,
            },
          ],
          "direction": "ltr",
          "format": "",
          "indent": 0,
          "type": "root",
          "version": 1,
        },
      }
    `);
  });
  it('should handle custom block translations', () => {
    const htmlString =
      '<span data-block-id="123" data-block-type="custom">Custom Block</span>';
    const blockTranslations = {
      blocks: [{ id: '123', name: 'Bloque personalizado' }],
    };
    const result = convertHtmlToLexical(htmlString, blockTranslations);
    expect(result).toMatchInlineSnapshot(`
      {
        "root": {
          "children": [
            {
              "fields": {
                "id": "123",
                "name": "Bloque personalizado",
              },
              "format": "",
              "type": "block",
              "version": 2,
            },
          ],
          "direction": "ltr",
          "format": "",
          "indent": 0,
          "type": "root",
          "version": 1,
        },
      }
    `);
  });
  it('should handle uploads', () => {
    const htmlString =
      '<span data-block-id="123" data-block-type="pcsUpload" data-relation-to="media">Upload</span>';
    const result = convertHtmlToLexical(htmlString);
    expect(result).toMatchInlineSnapshot(`
      {
        "root": {
          "children": [
            {
              "fields": {},
              "format": "",
              "relationTo": "media",
              "type": "upload",
              "value": "123",
              "version": 2,
            },
          ],
          "direction": "ltr",
          "format": "",
          "indent": 0,
          "type": "root",
          "version": 1,
        },
      }
    `);
  });
});
