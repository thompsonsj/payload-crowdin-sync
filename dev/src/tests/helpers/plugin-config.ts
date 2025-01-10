import { PluginOptions } from "payload-crowdin-sync";
import { localeMap } from "../../payload.config.js";

export const pluginConfig = (): PluginOptions => ({
  projectId: parseInt(process.env['CROWDIN_PROJECT_ID'] || ``) || 323731,
  directoryId: parseInt(process.env['CROWDIN_DIRECTORY_ID'] || ``) || 1169,
  token: process.env['NODE_ENV'] === 'test' ? `fake-token` : process.env['CROWDIN_TOKEN'] || ``, // CrowdIn API is mocked but we need a token to pass schema validation
  localeMap,
  sourceLocale: "en",
  tabbedUI: true,
  collections: [
    "categories",
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
})
