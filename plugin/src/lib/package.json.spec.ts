import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const pluginPackage = JSON.parse(
  readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../../package.json'), 'utf8'),
) as { dependencies: Record<string, string> }

describe('plugin package.json', () => {
  it('depends on workspace libraries with * rather than npm versions', () => {
    expect(pluginPackage.dependencies['payload-localized-fields']).toBe('*')
    expect(pluginPackage.dependencies['payload-localization-adapters']).toBe(
      '*',
    )
  })
})
