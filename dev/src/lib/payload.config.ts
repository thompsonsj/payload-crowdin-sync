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
import Policies from "./collections/Policies"
import Posts from "./collections/Posts";
import LocalizedPostsWithCondition from "./collections/LocalizedPostsWithCondition"
import NestedFieldCollection from "./collections/NestedFieldCollection";
import Tags from "./collections/Tags";
import Users from "./collections/Users";
import { resolve } from "path";

import { crowdinSync } from "payload-crowdin-sync";

import dotenv from "dotenv";
import { Media } from "./collections/Media";

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

export default buildConfig({
  editor: slateEditor({}),
  db: mongooseAdapter({
    url: process.env['MONGODB_URI'] || ``,
    transactionOptions: false,
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
        },
      }
    },
    user: Users.slug,
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
  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, "generated-schema.graphql"),
  },
})
