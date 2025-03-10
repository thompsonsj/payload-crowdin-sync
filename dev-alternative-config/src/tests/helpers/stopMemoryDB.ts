const stop = async () => {
  if (global._mongoMemoryServer) {
    console.log('Stopping memorydb...')
    await global._mongoMemoryServer.stop()
    console.log('Stopped memorydb')
  }
}

export default stop
