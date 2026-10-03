import type { Payload, SanitizedConfig } from 'payload'
import type { PluginOptions } from 'payload-crowdin-sync'

import path from 'path'
import { buildConfig, getPayload } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { slateEditor } from '@payloadcms/richtext-slate'
import { crowdinSync } from 'payload-crowdin-sync'

import { runInit } from '../runInit'
import type { NextRESTClient } from './NextRESTClient'
import { databaseAdapter } from '../databaseAdapter.js'
import { pluginConfig } from './plugin-config'

import { LocalizedNav } from './../../globals/LocalizedNav'
import Nav from './../../globals/Nav'
import Statistics from './../../globals/Statistics'
import { Home } from './../../globals/Home'
import Categories from './../../collections/Categories'
import { Media } from './../../collections/Media'
import MultiRichText from './../../collections/MultiRichText'
import LocalizedPosts from './../../collections/LocalizedPosts'
import Policies from './../../collections/Policies'
import Posts from './../../collections/Posts'
import LocalizedPostsWithCondition from './../../collections/LocalizedPostsWithCondition'
import NestedFieldCollection from './../../collections/NestedFieldCollection'
import Tags from './../../collections/Tags'
import Users from './../../collections/Users'
import { localeMap } from '../../payload.config.js'

const filename = fileURLToPath(import.meta.url)
const helpersDir = path.dirname(filename)

export type InitPayloadIntOptions = {
  dirname?: string
  testSuiteName?: string
  initializePayload?: boolean
  pluginOptionsOverride?: Partial<PluginOptions>
}

/**
 * Start a Payload instance for an integration test.
 *
 * `pluginOptionsOverride` is merged over the default test plugin options.
 * Pass `{ collections: undefined }` to sync every collection with localized
 * fields (see issue #342).
 */
export async function initPayloadInt(
  options: InitPayloadIntOptions = {},
): Promise<{
  config: SanitizedConfig
  payload?: Payload
  restClient?: NextRESTClient
}> {
  const {
    dirname = './dev/src/',
    testSuiteName: testSuiteNameOverride,
    initializePayload = true,
    pluginOptionsOverride,
  } = options
  const testSuiteName = testSuiteNameOverride ?? path.basename(dirname)
  await runInit(testSuiteName, false, true)

  const pluginOptions = pluginConfig(pluginOptionsOverride)
  const config = await buildConfig({
    admin: {
      user: Users.slug,
      importMap: {
        baseDir: path.resolve(helpersDir),
      },
    },
    plugins: [crowdinSync(pluginOptions)],
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
    globals: [Home, LocalizedNav, Nav, Statistics],
    localization: {
      locales: ['en', ...Object.keys(localeMap)],
      defaultLocale: 'en',
      fallback: true,
    },
    editor: slateEditor({}),
    secret: 'TEST_SECRET',
    typescript: {
      outputFile: path.resolve(helpersDir, 'payload-types.ts'),
    },
    db: databaseAdapter,
    sharp,
  })

  const payloadConfig = config as unknown as SanitizedConfig

  if (!initializePayload) {
    return {
      config: payloadConfig,
    }
  }

  console.log('starting payload')

  const payload = await getPayload({ config: payloadConfig })

  console.log('initPayloadInt done')
  return {
    config: payload.config,
    payload,
  }
}
