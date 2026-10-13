import { JSDOM } from 'jsdom';
import { rewriteCrowdinHtmlForLexical } from '../../htmlToLexical';

const bodyOf = (html: string) =>
  new JSDOM(`<body>${html}</body>`).window.document.body;

describe('fn: rewriteCrowdinHtmlForLexical', () => {
  it('returns empty input unchanged', () => {
    expect(rewriteCrowdinHtmlForLexical('')).toBe('');
  });

  it('rewrites unquoted pcsUpload spans to Payload upload img attributes', () => {
    const html = rewriteCrowdinHtmlForLexical(
      '<span data-block-id=123 data-block-type=pcsUpload data-relation-to=media></span>',
    );
    const img = bodyOf(html).querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('data-lexical-upload-id')).toBe('123');
    expect(img?.getAttribute('data-lexical-upload-relation-to')).toBe('media');
    expect(bodyOf(html).querySelector('[data-block-type]')).toBeNull();
  });

  it('rewrites quoted pcsUpload spans', () => {
    const html = rewriteCrowdinHtmlForLexical(
      '<span data-block-id="abc-9" data-block-type="pcsUpload" data-relation-to="media"></span>',
    );
    const img = bodyOf(html).querySelector('img');
    expect(img?.getAttribute('data-lexical-upload-id')).toBe('abc-9');
    expect(img?.getAttribute('data-lexical-upload-relation-to')).toBe('media');
  });

  it('rewrites pcsRelationship spans to Payload relationship div attributes', () => {
    const html = rewriteCrowdinHtmlForLexical(
      '<span data-block-id="page-1" data-block-type="pcsRelationship" data-relation-to="pages"></span>',
    );
    const div = bodyOf(html).querySelector('div');
    expect(div?.getAttribute('data-lexical-relationship-id')).toBe('page-1');
    expect(div?.getAttribute('data-lexical-relationship-relationTo')).toBe(
      'pages',
    );
  });

  it('rewrites lexical block markers to PCS_BLOCK tokens', () => {
    const html = rewriteCrowdinHtmlForLexical(
      '<span data-block-id="b1" data-block-type="custom"></span>',
    );
    const p = bodyOf(html).querySelector('p');
    expect(p?.textContent).toBe('PCS_BLOCK::b1::custom');
    expect(bodyOf(html).querySelector('[data-block-type]')).toBeNull();
  });

  it('rewrites underline and strikethrough style spans to u/s', () => {
    const html = rewriteCrowdinHtmlForLexical(
      '<p><span style="text-decoration: underline;">under</span><span style="text-decoration: line-through;">strike</span></p>',
    );
    const body = bodyOf(html);
    expect(body.querySelector('u')?.textContent).toBe('under');
    expect(body.querySelector('s')?.textContent).toBe('strike');
    expect(body.querySelectorAll('span[style]').length).toBe(0);
  });

  it('nests u inside s when both decorations are present', () => {
    const html = rewriteCrowdinHtmlForLexical(
      '<p><span style="text-decoration: underline; text-decoration: line-through;">both</span></p>',
    );
    expect(bodyOf(html).querySelector('s > u')?.textContent).toBe('both');
  });

  it('leaves unrelated style spans and unmarked HTML alone', () => {
    const source =
      '<p><span style="color: red;">red</span> and <strong>bold</strong></p>';
    const html = rewriteCrowdinHtmlForLexical(source);
    const body = bodyOf(html);
    expect(body.querySelector('span[style]')?.textContent).toBe('red');
    expect(body.querySelector('strong')?.textContent).toBe('bold');
  });

  it('rewrites mixed Crowdin markers in document order', () => {
    const html = rewriteCrowdinHtmlForLexical(
      '<p>Intro</p><span data-block-id="b1" data-block-type="custom"></span><span data-block-id="u1" data-block-type="pcsUpload" data-relation-to="media"></span><span data-block-id="r1" data-block-type="pcsRelationship" data-relation-to="pages"></span><p>Outro</p>',
    );
    const body = bodyOf(html);
    const children = [...body.children];
    expect(children.map((el) => el.tagName)).toEqual([
      'P',
      'P',
      'IMG',
      'DIV',
      'P',
    ]);
    expect(children[1]?.textContent).toBe('PCS_BLOCK::b1::custom');
    expect(children[2]?.getAttribute('data-lexical-upload-id')).toBe('u1');
    expect(children[3]?.getAttribute('data-lexical-relationship-id')).toBe(
      'r1',
    );
  });

  it('lifts a block marker out of an unclosed Crowdin paragraph', () => {
    const html = rewriteCrowdinHtmlForLexical(
      '<p>Intro<p><span data-block-id="b1" data-block-type="custom"></span><p>Outro',
    );
    const body = bodyOf(html);
    const children = [...body.children];
    expect(children.map((el) => el.tagName)).toEqual(['P', 'P', 'P']);
    expect(children[0]?.textContent).toBe('Intro');
    expect(children[1]?.textContent).toBe('PCS_BLOCK::b1::custom');
    expect(children[2]?.textContent).toBe('Outro');
  });

  it('splits a paragraph when a block marker sits next to text', () => {
    const html = rewriteCrowdinHtmlForLexical(
      '<p>Hello<span data-block-id="b1" data-block-type="custom"></span> world</p>',
    );
    const body = bodyOf(html);
    const children = [...body.children];
    expect(children.map((el) => el.tagName)).toEqual(['P', 'P']);
    expect(children[0]?.textContent).toContain('Hello');
    expect(children[1]?.textContent).toBe('PCS_BLOCK::b1::custom');
  });

  it('treats a br next to a marker as insignificant and replaces the paragraph', () => {
    const html = rewriteCrowdinHtmlForLexical(
      '<p><br /><span data-block-id="b1" data-block-type="custom"></span></p>',
    );
    const body = bodyOf(html);
    expect(body.querySelectorAll('p').length).toBe(1);
    expect(body.querySelector('p')?.textContent).toBe('PCS_BLOCK::b1::custom');
  });

  it('rewrites pcsUpload and pcsRelationship spans that omit data-relation-to', () => {
    const html = rewriteCrowdinHtmlForLexical(
      '<span data-block-id="1" data-block-type="pcsUpload"></span><span data-block-id="2" data-block-type="pcsRelationship"></span>',
    );
    const body = bodyOf(html);
    expect(body.querySelector('img')?.getAttribute('data-lexical-upload-id')).toBe(
      '1',
    );
    expect(
      body.querySelector('img')?.hasAttribute('data-lexical-upload-relation-to'),
    ).toBe(false);
    expect(
      body.querySelector('div')?.getAttribute('data-lexical-relationship-id'),
    ).toBe('2');
    expect(
      body
        .querySelector('div')
        ?.hasAttribute('data-lexical-relationship-relationTo'),
    ).toBe(false);
  });

  it('skips markers that are missing an id or type', () => {
    const html = rewriteCrowdinHtmlForLexical(
      '<span data-block-type="custom"></span><span data-block-id="only-id"></span>',
    );
    const body = bodyOf(html);
    expect(body.querySelectorAll('span').length).toBe(2);
    expect(body.querySelector('p')).toBeNull();
  });
});
