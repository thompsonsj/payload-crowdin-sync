import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const pluginPackage = JSON.parse(
  readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../../package.json'), 'utf8'),
) as { dependencies: Record<string, string>; files?: string[] }

const isWorkspaceDep = (range: string | undefined) =>
  range === '*' || /^\d+\.\d+\.\d+$/.test(range ?? '')

describe('plugin package.json', () => {
  it('depends on workspace libraries, not npm caret ranges', () => {
    // `*` between releases; release-please node-workspace rewrites to an exact
    // local version. Either still links via npm workspaces. `^` / `~` would
    // send consumers to npm for packages we no longer publish.
    expect(
      isWorkspaceDep(pluginPackage.dependencies['payload-localized-fields']),
    ).toBe(true)
    expect(
      isWorkspaceDep(
        pluginPackage.dependencies['payload-localization-adapters'],
      ),
    ).toBe(true)
  })

  it('includes vendored libraries in the published files list', () => {
    expect(pluginPackage.files).toEqual(
      expect.arrayContaining(['src', 'vendor', '*.md']),
    )
  })
})
