
  // DO NOT MODIFY. This file is automatically generated by the test suite.

  
  import { mongooseAdapter } from '@payloadcms/db-mongodb'

  export const databaseAdapter = mongooseAdapter({
    ensureIndexes: true,
    url:
      process.env.MONGODB_MEMORY_SERVER_URI ||
      process.env.DATABASE_URI ||
      'mongodb://127.0.0.1/payloadtests',
    collation: {
      strength: 1,
    },
  })
  