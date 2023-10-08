import { buildConfig } from "payload/config";
import path from "path";
import Nav from "./globals/Nav";
import Categories from "./collections/Categories";
import MultiRichText from "./collections/MultiRichText";
import LocalizedPosts from "./collections/LocalizedPosts";
import Posts from "./collections/Posts";
import NestedFieldCollection from "./collections/NestedFieldCollection";
import Tags from "./collections/Tags";
import Users from "./collections/Users";
import { resolve } from "path";
import { PluginOptions } from '../../dist/types'

import { crowdinSync } from "../../dist";

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
}: PluginOptions) => {
  return await buildConfig({
    serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3000",
    admin: {
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
    globals: [Nav],
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
