import payload from 'payload'
import swcRegister from '@swc/register'
import { v4 as uuid } from 'uuid'
import type { InitOptions } from 'payload/dist/config/types'
import express from 'express'
import path from 'path'

type Options = {
  init?: Partial<InitOptions>
}

/**
 * Initialize a Payload instance for testing and return its server URL.
 *
 * This sets NODE_ENV to 'test' and PAYLOAD_CONFIG_PATH to the package's payload.config.ts. It constructs init options (defaulting to a local instance with a unique secret and MongoDB URL) merged with `options.init`. If `initOptions.local` is false, an Express server is created and started on `process.env.PORT` or `3000`.
 *
 * @param options - Optional overrides for initialization; `options.init` can supply any Payload InitOptions to override the defaults used for testing.
 * @returns An object containing `serverURL`, the base URL where the test server is reachable (e.g., `http://localhost:3000`).
 */
export async function initPayloadTest(options: Options): Promise<{ serverURL: string }> {
  const initOptions = {
    local: true,
    secret: uuid(),
    mongoURL: `mongodb://localhost/${uuid()}`,
    ...(options.init || {}),
  }

  process.env['NODE_ENV'] = 'test'

  process.env['PAYLOAD_CONFIG_PATH'] = path.resolve(__dirname, './../../payload.config.ts')

  const port = process.env['PORT'] || 3000

  if (!initOptions?.local) {
    initOptions.express = express()
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - bad @swc/register types
  swcRegister({
    sourceMaps: 'inline',
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true,
      },
    },
    module: {
      type: 'commonjs',
    },
  })

  await payload.init(initOptions)

  if (initOptions.express) {
    initOptions.express.listen(port)
  }

  return { serverURL: `http://localhost:${port}` }
}
