import {
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  defaultEditorFeatures,
  editorConfigFactory,
  type SanitizedServerEditorConfig,
} from '@payloadcms/richtext-lexical';
import type { SanitizedConfig } from 'payload';

const stubPayloadConfig = {
  collections: [
    {
      slug: 'media',
      upload: true,
      admin: { enableRichTextLink: false, enableRichTextRelationship: true },
      fields: [],
    },
    {
      slug: 'pages',
      admin: { enableRichTextLink: true, enableRichTextRelationship: true },
      fields: [],
    },
  ],
  globals: [],
} as unknown as SanitizedConfig;

let cached: Promise<SanitizedServerEditorConfig> | undefined;

/**
 * Sanitized Lexical editor config for HTML→Lexical unit tests.
 * Includes default features plus tables and a `custom` block.
 */
export const getTestLexicalEditorConfig = () => {
  cached ??= editorConfigFactory.fromFeatures({
    config: stubPayloadConfig,
    features: [
      ...defaultEditorFeatures,
      EXPERIMENTAL_TableFeature(),
      BlocksFeature({
        blocks: [
          {
            slug: 'custom',
            fields: [{ name: 'name', type: 'text' }],
          },
          {
            slug: 'highlight',
            fields: [
              { name: 'heading', type: 'group', fields: [{ name: 'title', type: 'text' }] },
              { name: 'color', type: 'select', options: ['gray', 'yellow', 'green'] },
            ],
          },
        ],
      }),
    ],
  });
  return cached;
};
