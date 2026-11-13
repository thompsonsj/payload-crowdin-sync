import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { vendorWorkspacePackages } from './vendor-workspace-packages.mjs'

const dirs: string[] = []

const makeTree = () => {
  const root = mkdtempSync(join(tmpdir(), 'vendor-workspace-'))
  dirs.push(root)
  const pluginDist = join(root, 'plugin')
  const documentSrc = join(root, 'document')
  const adaptersSrc = join(root, 'adapters')
  mkdirSync(join(pluginDist, 'src/lib'), { recursive: true })
  mkdirSync(documentSrc, { recursive: true })
  mkdirSync(adaptersSrc, { recursive: true })
  writeFileSync(
    join(pluginDist, 'package.json'),
    JSON.stringify({
      name: 'payload-crowdin-sync',
      dependencies: {
        jsdom: '^29.1.1',
        'payload-localization-adapters': '1.0.0',
        'payload-localized-fields': '1.1.0',
      },
    }),
  )
  writeFileSync(
    join(pluginDist, 'src/lib/index.js'),
    `import * as localizedFields from 'payload-localized-fields';
import { syncDocumentSource } from 'payload-localization-adapters';
export { localizedFields, syncDocumentSource };
`,
  )
  writeFileSync(
    join(pluginDist, 'src/lib/index.d.ts'),
    `import * as localizedFields from 'payload-localized-fields';
export { localizedFields };
`,
  )
  writeFileSync(
    join(documentSrc, 'index.js'),
    `export const walk = () => 'fields';
`,
  )
  writeFileSync(
    join(documentSrc, 'index.d.ts'),
    `export declare const walk: () => string;
`,
  )
  writeFileSync(
    join(adaptersSrc, 'index.js'),
    `import { walk } from 'payload-localized-fields';
export const syncDocumentSource = walk;
`,
  )
  writeFileSync(
    join(adaptersSrc, 'index.d.ts'),
    `export declare const syncDocumentSource: () => string;
`,
  )
  return { pluginDist, documentSrc, adaptersSrc }
}

afterEach(() => {
  while (dirs.length > 0) {
    const dir = dirs.pop()
    if (dir) rmSync(dir, { recursive: true, force: true })
  }
})

describe('vendorWorkspacePackages', () => {
  it('copies workspace builds into the plugin dist and drops them as npm dependencies', () => {
    const tree = makeTree()
    vendorWorkspacePackages(tree)

    const pluginJs = readFileSync(join(tree.pluginDist, 'src/lib/index.js'), 'utf8')
    const adaptersJs = readFileSync(
      join(tree.pluginDist, 'vendor/payload-localization-adapters/index.js'),
      'utf8',
    )
    const pkg = JSON.parse(
      readFileSync(join(tree.pluginDist, 'package.json'), 'utf8'),
    ) as { dependencies: Record<string, string> }

    expect(pluginJs).toContain(
      "from '../../vendor/payload-localized-fields/index.js'",
    )
    expect(pluginJs).toContain(
      "from '../../vendor/payload-localization-adapters/index.js'",
    )
    expect(pluginJs).not.toContain("'payload-localized-fields'")
    expect(pluginJs).not.toContain("'payload-localization-adapters'")
    expect(adaptersJs).toContain("from '../payload-localized-fields/index.js'")
    expect(adaptersJs).not.toContain("'payload-localized-fields'")
    expect(pkg.dependencies).toEqual({ jsdom: '^29.1.1' })
  })
})
