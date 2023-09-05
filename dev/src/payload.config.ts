import { buildConfig } from "payload/config";
import path from "path";
import Nav from "./globals/Nav";
import Categories from "./collections/Categories";
import LocalizedPosts from "./collections/LocalizedPosts";
import Posts from "./collections/Posts";
import NestedFieldCollection from "./collections/NestedFieldCollection";
import Tags from "./collections/Tags";
import Users from "./collections/Users";
import { resolve } from "path";

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

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3000",
  admin: {
    user: Users.slug,
  },
  plugins: [
    crowdinSync({
      projectId: 323731,
      directoryId: 1169,
      token: `fake-token`, // CrowdIn API is mocked but we need a token to pass schema validation
      localeMap,
      sourceLocale: "en",
    }),
  ],
  collections: [
    Categories,
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
});
