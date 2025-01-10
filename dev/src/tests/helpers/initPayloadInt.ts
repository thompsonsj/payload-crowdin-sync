import type { Payload, SanitizedConfig } from 'payload'

import path from 'path'
import { getPayload } from 'payload'

import { runInit } from '../runInit'
import { NextRESTClient } from './NextRESTClient'

import { databaseAdapter } from '../databaseAdapter.js'

// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { LocalizedNav } from "./../../globals/LocalizedNav";
import Nav from "./../../globals/Nav";
import Statistics from "./../../globals/Statistics";
import Categories from "./../../collections/Categories";
import { Media } from "./../../collections/Media";
import MultiRichText from "./../../collections/MultiRichText";
import LocalizedPosts from "./../../collections/LocalizedPosts";
import Policies from "./../../collections/Policies"
import Posts from "./../../collections/Posts";
import LocalizedPostsWithCondition from "./../../collections/LocalizedPostsWithCondition"
import NestedFieldCollection from "./../../collections/NestedFieldCollection";
import Tags from "./../../collections/Tags";
import Users from "./../../collections/Users";

import { crowdinSync } from "payload-crowdin-sync";
import { slateEditor } from '@payloadcms/richtext-slate'

const localeMap = {
  de_DE: {
    crowdinId: "de",
  },
  fr_FR: {
    crowdinId: "fr",
  },
};

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const config = buildConfig({
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


/**
 * Initialize Payload configured for integration tests
 */
export async function initPayloadInt(
  dirname: string = './dev/src/',
  testSuiteNameOverride?: string,
  initializePayload = true,
): Promise<{ config: SanitizedConfig; payload?: Payload; restClient?: NextRESTClient }> {
  const testSuiteName = testSuiteNameOverride ?? path.basename(dirname)
  await runInit(testSuiteName, false, true)
  // custom configs can be used e.g. in test file use initPayloadInt(`${__dirname}/..`) and ensure a payload.config.ts file is in the test directory.
  // See https://github.com/payloadcms/payload/blob/main/test/helpers/initPayloadInt.ts
  // console.log('importing config', path.resolve(dirname, 'payload.config.ts'))

 // const { default: config } = await import(path.resolve(dirname, 'payload.config.ts'))


  const payloadConfig = {
    ...(await config),
    db: databaseAdapter,
    secret: 'TEST_SECRET',
  }

  if (!initializePayload) {
    return {
      config: payloadConfig,
    }
  }

  console.log('starting payload')

  const payload = await getPayload({ config: payloadConfig })
  // console.log('initializing rest client')
  // const restClient = new NextRESTClient(payload.config)
  console.log('initPayloadInt done')
  return {
    config: payload.config,
    payload,
    // restClient,
  }
}
