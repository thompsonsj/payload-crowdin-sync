import { MongoMemoryReplSet } from 'mongodb-memory-server'

declare global {
  // eslint-disable-next-line no-var
  var _mongoMemoryServer: MongoMemoryReplSet | undefined
}

const start = async () => {
  console.log('Starting memory db...')

  // @ts-expect-error Assign to NODE_ENV in test environment
  process.env.NODE_ENV = 'test'
  process.env.PAYLOAD_DROP_DATABASE = 'true'
  process.env.NODE_OPTIONS = '--no-deprecation'
  process.env.DISABLE_PAYLOAD_HMR = 'true'

  if (
    (!process.env.PAYLOAD_DATABASE || process.env.PAYLOAD_DATABASE === 'mongodb') &&
    !global._mongoMemoryServer
  ) {
    const db = await MongoMemoryReplSet.create({
      replSet: {
        count: 3,
        dbName: 'payloadmemory',
      },
    })

    global._mongoMemoryServer = db

    process.env.MONGODB_MEMORY_SERVER_URI = `${global._mongoMemoryServer.getUri()}&retryWrites=true`
  }
}

export default start
