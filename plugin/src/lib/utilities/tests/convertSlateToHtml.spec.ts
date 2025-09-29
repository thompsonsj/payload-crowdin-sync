import { convertSlateToHtml } from '../richTextConversion';
import { payloadSlateToHtmlConfig } from '@slate-serializers/html';

describe('convertSlateToHtml', () => {
  it('converts content from the default Slate editor configuration in Payload CMS as expected', () => {
    const slate = [
      {
        children: [
          {
            text: 'Heading 1: Payload CMS Slate Example Content',
          },
        ],
        type: 'h1',
      },
      {
        type: 'h2',
        children: [
          {
            text: 'Heading 2: Text formatting',
          },
        ],
      },
      {
        children: [
          {
            text: 'Some ',
          },
          {
            text: 'bold text',
            bold: true,
          },
          {
            text: ' in a sentence.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Underlined text',
            underline: true,
          },
          {
            text: ' and ',
          },
          {
            text: 'italic text',
            italic: true,
          },
          {
            text: '.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Heading 3: Formatting combinations',
          },
        ],
        type: 'h3',
      },
      {
        children: [
          {
            text: 'Combine ',
          },
          {
            text: 'all three',
            bold: true,
            italic: true,
            underline: true,
          },
          {
            text: ' of the aforementioned tags. Throw a ',
          },
          {
            text: 'strikethrough',
            strikethrough: true,
          },
          {
            text: ' in there too.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Heading 4: Code',
          },
        ],
        type: 'h4',
      },
      {
        children: [
          {
            text: 'Code block',
            code: true,
          },
        ],
      },
      {
        children: [
          {
            text: 'Heading 5: Text indent',
          },
        ],
        type: 'h5',
      },
      {
        type: 'indent',
        children: [
          {
            children: [
              {
                text: 'Indented text.',
              },
            ],
          },
          {
            children: [
              {
                children: [
                  {
                    text: 'Indented text in indented text.',
                  },
                ],
              },
            ],
            type: 'indent',
          },
        ],
      },
      {
        children: [
          {
            text: 'Heading 6: More combinations',
          },
        ],
        type: 'h6',
      },
      {
        children: [
          {
            text: '',
            bold: true,
          },
          {
            children: [
              {
                text: 'A link in bold',
                bold: true,
              },
            ],
            linkType: 'custom',
            type: 'link',
            url: 'https://github.com/thompsonsj',
          },
          {
            text: '. ',
          },
          {
            children: [
              {
                text: 'A link with a new tab',
              },
            ],
            linkType: 'custom',
            newTab: true,
            type: 'link',
            url: 'https://github.com/thompsonsj',
          },
          {
            text: '.',
          },
        ],
      },
      {
        children: [
          {
            text: 'Lists',
          },
        ],
        type: 'h2',
      },
      {
        type: 'ul',
        children: [
          {
            children: [
              {
                text: 'Nested unordered list item 1',
              },
            ],
            type: 'li',
          },
        ],
      },
      {
        type: 'ul',
        children: [
          {
            children: [
              {
                text: 'Nested Item 1',
              },
            ],
            type: 'li',
          },
          {
            children: [
              {
                text: 'Nested item 2',
              },
            ],
            type: 'li',
          },
        ],
      },
      {
        type: 'ul',
        children: [
          {
            type: 'li',
            children: [
              {
                text: 'Item 2',
              },
            ],
          },
        ],
      },
      {
        children: [
          {
            children: [
              {
                text: 'Ordered list item 1',
              },
            ],
            type: 'li',
          },
          {
            children: [
              {
                text: 'Ordered list item 2',
              },
            ],
            type: 'li',
          },
          {
            children: [
              {
                text: 'Ordered list item 3',
              },
            ],
            type: 'li',
          },
        ],
        type: 'ol',
      },
      {
        children: [
          {
            text: '',
          },
        ],
      },
    ];
    // note that not all html is converted. There's no way to know how indent should be interpreted (can be achieved by passing config which maps this property to html tags/attributes) and nested lists are not supported in the Payload CMS editor.
    expect(convertSlateToHtml(slate)).toMatchInlineSnapshot(
      `"<h1>Heading 1: Payload CMS Slate Example Content</h1><h2>Heading 2: Text formatting</h2><p>Some <strong>bold text</strong> in a sentence.</p><p><u>Underlined text</u> and <i>italic text</i>.</p><h3>Heading 3: Formatting combinations</h3><p>Combine <strong><u><i>all three</i></u></strong> of the aforementioned tags. Throw a <s>strikethrough</s> in there too.</p><h4>Heading 4: Code</h4><p><pre><code>Code block</code></pre></p><h5>Heading 5: Text indent</h5><p>Indented text.</p><p>Indented text in indented text.</p><h6>Heading 6: More combinations</h6><p><strong></strong><a href="https://github.com/thompsonsj" data-link-type="custom"><strong>A link in bold</strong></a>. <a href="https://github.com/thompsonsj" data-link-type="custom" target="_blank">A link with a new tab</a>.</p><h2>Lists</h2><ul><li>Nested unordered list item 1</li></ul><ul><li>Nested Item 1</li><li>Nested item 2</li></ul><ul><li>Item 2</li></ul><ol><li>Ordered list item 1</li><li>Ordered list item 2</li><li>Ordered list item 3</li></ol><p></p>"`,
    );
  });

  it('converts custom config Payload CMS Slate content to HTML as expected', () => {
    const slate = [
      {
        type: 'table',
        children: [
          {
            type: 'table-header',
            children: [
              {
                type: 'table-row',
                children: [
                  {
                    type: 'table-header-cell',
                    children: [
                      {
                        text: 'Text for heading cell 1',
                      },
                    ],
                  },
                  {
                    type: 'table-header-cell',
                    children: [
                      {
                        text: 'Text for heading cell 2',
                      },
                    ],
                  },
                  {
                    type: 'table-header-cell',
                    children: [
                      {
                        text: 'Text for heading cell 3',
                      },
                    ],
                  },
                  {
                    type: 'table-header-cell',
                    children: [
                      {
                        text: 'Text for heading cell 4',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'table-body',
            children: [
              {
                type: 'table-row',
                children: [
                  {
                    type: 'table-cell',
                    children: [
                      {
                        text: 'Text for table cell row 1 col 1',
                      },
                    ],
                  },
                  {
                    type: 'table-cell',
                    children: [
                      {
                        text: 'Text for table cell row 1 col 2',
                      },
                    ],
                  },
                  {
                    type: 'table-cell',
                    children: [
                      {
                        text: 'Text for table cell row 1 col 3.',
                      },
                    ],
                  },
                  {
                    type: 'table-cell',
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Paragraph 1 text for table cell row 1 col 4',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        children: [
                          {
                            text: 'Paragraph 2 text for table cell row 1 col 4',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
    const config = {
      ...payloadSlateToHtmlConfig,
      elementMap: {
        ...payloadSlateToHtmlConfig.elementMap,
        table: 'table',
        ['table-row']: 'tr',
        ['table-cell']: 'td',
        ['table-header']: 'thead',
        ['table-header-cell']: 'th',
        ['table-body']: 'tbody',
      },
    };
    expect(convertSlateToHtml(slate, config)).toMatchInlineSnapshot(
      `"<table><thead><tr><th>Text for heading cell 1</th><th>Text for heading cell 2</th><th>Text for heading cell 3</th><th>Text for heading cell 4</th></tr></thead><tbody><tr><td>Text for table cell row 1 col 1</td><td>Text for table cell row 1 col 2</td><td>Text for table cell row 1 col 3.</td><td><p>Paragraph 1 text for table cell row 1 col 4</p><p>Paragraph 2 text for table cell row 1 col 4</p></td></tr></tbody></table>"`,
    );
  });
});
