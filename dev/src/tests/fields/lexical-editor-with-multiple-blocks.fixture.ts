import { Policy } from '../../payload-types'

/** Placeholder used in snapshots; replace with actual media.id when creating documents. */
export const FIXTURE_IMAGE_ID = '65d67e6a7fb7e9426b3f9f5f'

function withImageId<T>(obj: T, mediaId: string): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map((item) => withImageId(item, mediaId)) as T
  const out = { ...obj } as T
  for (const key of Object.keys(out as object)) {
    const val = (out as Record<string, unknown>)[key]
    if (key === 'image' && typeof val === 'string' && val === FIXTURE_IMAGE_ID) {
      ;(out as Record<string, unknown>)[key] = mediaId
    } else {
      ;(out as Record<string, unknown>)[key] = withImageId(val, mediaId)
    }
  }
  return out
}

export const fixture = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Sample content for a Lexical rich text field with multiple blocks.',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
      {
        format: '',
        type: 'block',
        version: 2,
        fields: {
          id: '65d67d2591c92e447e7472f7',
          blockName: '',
          blockType: 'cta',
          link: {
            text: 'Download payload-crowdin-sync on npm!',
            href: 'https://www.npmjs.com/package/payload-crowdin-sync',
            type: 'external',
          },
          select: 'primary',
        },
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'A bulleted list in-between some blocks consisting of:',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
      {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'one bullet list item; and',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'another!',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 2,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'list',
        version: 1,
        listType: 'bullet',
        start: 1,
        tag: 'ul',
      },
      {
        format: '',
        type: 'block',
        version: 2,
        fields: {
          id: '65d67d8191c92e447e7472f8',
          blockName: '',
          blockType: 'highlight',
          color: 'green',
          content: {
            root: {
              type: 'root',
              format: '',
              indent: 0,
              version: 1,
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: 'The plugin parses your block configuration for the Lexical rich text editor. It extracts all block values from the rich text field and then treats this config/data combination as a regular `blocks` field.',
                      type: 'text',
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  type: 'paragraph',
                  version: 1,
                },
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: 'Markers are placed in the html and this content is restored into the correct place on translation.',
                      type: 'text',
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  type: 'paragraph',
                  version: 1,
                },
              ],
              direction: 'ltr',
            },
          },
          heading: {
            title: 'Blocks are extracted into their own fields',
            preTitle: 'How the plugin handles blocks in the Lexical editor',
          },
        },
      },
      {
        format: '',
        type: 'block',
        version: 2,
        fields: {
          id: '65d67e2291c92e447e7472f9',
          blockName: '',
          blockType: 'imageText',
          title: 'Testing a range of fields',
          image: '65d67e6a7fb7e9426b3f9f5f',
        },
      },
      {
        children: [
          {
            children: [],
            direction: null,
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        type: 'list',
        version: 1,
        listType: 'bullet',
        start: 1,
        tag: 'ul',
      },
    ],
    direction: 'ltr',
  },
} as Policy['content']

export const fixture2 = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        format: '',
        type: 'block',
        version: 2,
        fields: {
          id: '65d67d2591c92e447e7472f7',
          blockName: '',
          blockType: 'cta',
          link: {
            text: 'Download payload-crowdin-sync on npm!',
            href: 'https://www.npmjs.com/package/payload-crowdin-sync',
            type: 'external',
          },
          select: 'primary',
        },
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'A bulleted list in-between some blocks consisting of:',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
      {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'one bullet list item; and',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'another!',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 2,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'list',
        version: 1,
        listType: 'bullet',
        start: 1,
        tag: 'ul',
      },
      {
        format: '',
        type: 'block',
        version: 2,
        fields: {
          id: '65d67d8191c92e447e7472f8',
          blockName: '',
          blockType: 'highlight',
          color: 'green',
          content: {
            root: {
              type: 'root',
              format: '',
              indent: 0,
              version: 1,
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: 'The plugin parses your block configuration for the Lexical rich text editor. It extracts all block values from the rich text field and then treats this config/data combination as a regular `blocks` field.',
                      type: 'text',
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  type: 'paragraph',
                  version: 1,
                },
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: 'Markers are placed in the html and this content is restored into the correct place on translation.',
                      type: 'text',
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  type: 'paragraph',
                  version: 1,
                },
              ],
              direction: 'ltr',
            },
          },
          heading: {
            title: 'Blocks are extracted into their own fields',
            preTitle: 'How the plugin handles blocks in the Lexical editor',
          },
        },
      },
      {
        format: '',
        type: 'block',
        version: 2,
        fields: {
          id: '65d67e2291c92e447e7472f9',
          blockName: '',
          blockType: 'imageText',
          title: 'Testing a range of fields',
          image: '65d67e6a7fb7e9426b3f9f5f',
        },
      },
      {
        children: [
          {
            children: [],
            direction: null,
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        type: 'list',
        version: 1,
        listType: 'bullet',
        start: 1,
        tag: 'ul',
      },
    ],
    direction: 'ltr',
  },
} as Policy['content']

export const getFixture = (mediaId: string) => withImageId(fixture, mediaId)
export const getFixture2 = (mediaId: string) => withImageId(fixture2, mediaId)
