// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { LocalizedNav } from "./globals/LocalizedNav";
import Nav from "./globals/Nav";
import Statistics from "./globals/Statistics";
import Categories from "./collections/Categories";
import { Media } from "./collections/Media";
import MultiRichText from "./collections/MultiRichText";
import LocalizedPosts from "./collections/LocalizedPosts";
import Policies from "./collections/Policies"
import Posts from "./collections/Posts";
import LocalizedPostsWithCondition from "./collections/LocalizedPostsWithCondition"
import NestedFieldCollection from "./collections/NestedFieldCollection";
import Tags from "./collections/Tags";
import Users from "./collections/Users";

import { crowdinSync } from "payload-crowdin-sync";
import { slateEditor } from '@payloadcms/richtext-slate'

export const localeMap = {
  de_DE: {
    crowdinId: "de",
  },
  fr_FR: {
    crowdinId: "fr",
  },
};

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  plugins: [
  crowdinSync({
    projectId: parseInt(process.env['CROWDIN_PROJECT_ID'] || ``) || 323731,
  directoryId: parseInt(process.env['CROWDIN_DIRECTORY_ID'] || ``) || 1169,
  token: process.env['NODE_ENV'] === 'test' ? `fake-token` : process.env['CROWDIN_TOKEN'] || ``, // CrowdIn API is mocked but we need a token to pass schema validation
  organization: process.env['CROWDIN_ORGANIZATION'] || ``,
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
  ]
  }),
],
collections: [
  Categories,
  MultiRichText,
  LocalizedPosts,
  Media,
  NestedFieldCollection,
  Policies,
  Posts,
  LocalizedPostsWithCondition,
  Tags,
  Users,
],
globals: [
  LocalizedNav,
  Nav,
  Statistics,
],
localization: {
  locales: ["en", ...Object.keys(localeMap)],
  defaultLocale: "en",
  fallback: true,
},
  editor: slateEditor({}),
  secret: process.env['PAYLOAD_SECRET'] || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env['MONGODB_URI'] || '',
  }),
  sharp,
})
