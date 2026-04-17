import startMemoryDB from './helpers/startMemoryDB'
import stopMemoryDB from './helpers/stopMemoryDB'

export default async function globalSetup() {
  await startMemoryDB()

  return async () => {
    await stopMemoryDB()
  }
}

