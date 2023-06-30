import { buildConfig } from 'payload/config';
import path from 'path';
import Categories from './collections/Categories';
import LocalizedPosts from './collections/LocalizedPosts';
import Posts from './collections/Posts';
import Tags from './collections/Tags';
import Users from './collections/Users';
import { resolve } from 'path';

import { crowdInSync, mockCrowdinClient } from '../../dist';

require('dotenv').config({
  path: resolve(__dirname, '../.env'),
});

interface IlocaleMap {
  [key: string]: {
    crowdinId: string
  }
}

export const localeMap: IlocaleMap = {
  de_DE: {
    crowdinId: "de",
  },
  fr_FR: {
    crowdinId: "fr",
  },
}

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
  },
  plugins: [
    crowdInSync({
      projectId: 323731,
      directoryId: 1169,
      client: mockCrowdinClient() as any,
    }),
  ],
  collections: [
    Categories,
    LocalizedPosts,
    Posts,
    Tags,
    Users,
  ],
  localization: {
    locales: ['en', ...Object.keys(localeMap)],
    defaultLocale: 'en',
    fallback: true,
  },
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts')
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
});
