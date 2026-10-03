import type { PluginOptions } from 'payload-crowdin-sync'
import { localeMap } from '../../payload.config.js'

/**
 * Plugin options used by integration tests. Pass the same object (or the
 * same override) to `initPayloadInt` and `mockCrowdinClient` so the Payload
 * instance and Crowdin mocks stay aligned.
 */
export const pluginConfig = (
  override: Partial<PluginOptions> = {},
): PluginOptions => ({
  projectId: parseInt(process.env['CROWDIN_PROJECT_ID'] || ``) || 323731,
  directoryId: parseInt(process.env['CROWDIN_DIRECTORY_ID'] || ``) || 1169,
  token: process.env['NODE_ENV'] === 'test' ? `fake-token` : process.env['CROWDIN_TOKEN'] || ``,
  organization: process.env['CROWDIN_ORGANIZATION'] || ``,
  localeMap,
  sourceLocale: 'en',
  tabbedUI: true,
  deleteCrowdinFiles: true,
  collections: [
    'categories',
    'multi-rich-text',
    'localized-posts',
    'nested-field-collection',
    'policies',
    'posts',
    {
      slug: 'localized-posts-with-condition',
      condition: ({ doc }) => doc.translateWithCrowdin,
    },
    'tags',
    'users',
  ],
  lexicalBlockFolderPrefix: 'lex.',
  ...override,
})
