import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const pluginPackage = JSON.parse(
  readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../../package.json'), 'utf8'),
) as { dependencies: Record<string, string> }

describe('plugin package.json', () => {
  it('depends on payload-localized-fields ^1.1.0 so consumers get compiled .js exports', () => {
    expect(pluginPackage.dependencies['payload-localized-fields']).toBe('^1.1.0')
  })
})
