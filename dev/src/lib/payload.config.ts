import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { slateEditor } from "@payloadcms/richtext-slate";
import { webpackBundler } from "@payloadcms/bundler-webpack";

import { buildConfig } from "payload/config";
import path from "path";
import LocalizedNav from "./globals/LocalizedNav";
import Nav from "./globals/Nav";
import Statistics from "./globals/Statistics";
import Categories from "./collections/Categories";
import MultiRichText from "./collections/MultiRichText";
import LocalizedPosts from "./collections/LocalizedPosts";
import Posts from "./collections/Posts";
import NestedFieldCollection from "./collections/NestedFieldCollection";
import Tags from "./collections/Tags";
import Users from "./collections/Users";
import { resolve } from "path";

import { crowdinSync, type PluginOptions } from "payload-crowdin-sync";

import dotenv from "dotenv";

dotenv.config({
  path: resolve(__dirname, "../.env"),
});

export const localeMap = {
  de_DE: {
    crowdinId: "de",
  },
  fr_FR: {
    crowdinId: "fr",
  },
};

export const buildConfigWithPluginOptions = async ({
  projectId,
  directoryId,
  token, // CrowdIn API is mocked but we need a token to pass schema validation
  localeMap,
  sourceLocale,
  collections,
  globals,
  slateToHtmlConfig,
  htmlToSlateConfig,
}: PluginOptions) => {
  return await buildConfig({
    editor: slateEditor({}),
    db: mongooseAdapter({
      url: process.env['MONGODB_URI'] || ``,
    }),
    serverURL: process.env['PAYLOAD_PUBLIC_SERVER_URL'] || "http://localhost:3000",
    admin: {
      bundler: webpackBundler(),
      webpack: (config) => {
        return {
          ...config,
          resolve: {
            ...config.resolve,
            alias: {
              ...config.resolve?.alias,
              "payload-crowdin-sync": path.resolve(__dirname, "../../../plugin/src/index.ts"),
            }
          }
        }
      },
      user: Users.slug,
    },
    plugins: [
      crowdinSync({
        projectId,
        directoryId,
        token,
        localeMap,
        sourceLocale,
        collections,
        globals,
        slateToHtmlConfig,
        htmlToSlateConfig,
      }),
    ],
    collections: [
      Categories,
      MultiRichText,
      LocalizedPosts,
      NestedFieldCollection,
      Posts,
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
    typescript: {
      outputFile: path.resolve(__dirname, "payload-types.ts"),
    },
    graphQL: {
      schemaOutputFile: path.resolve(__dirname, "generated-schema.graphql"),
    },
  })
}
