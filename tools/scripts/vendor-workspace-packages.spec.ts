import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  parseArgs,
  vendorWorkspacePackages,
} from './vendor-workspace-packages.mjs'

const dirs: string[] = []

const makeTree = () => {
  const root = mkdtempSync(join(tmpdir(), 'vendor-workspace-'))
  dirs.push(root)
  const pluginDist = join(root, 'plugin')
  const documentSrc = join(root, 'document')
  const adaptersSrc = join(root, 'adapters')
  mkdirSync(join(pluginDist, 'src/lib'), { recursive: true })
  mkdirSync(join(documentSrc, 'nested'), { recursive: true })
  mkdirSync(adaptersSrc, { recursive: true })
  writeFileSync(
    join(pluginDist, 'package.json'),
    JSON.stringify({
      name: 'payload-crowdin-sync',
      dependencies: {
        'deep-equal': '^2.2.3',
        'dot-object': '^2.1.5',
        'es-toolkit': '^1.52.0',
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
    join(documentSrc, 'nested/extra.js'),
    `export const extra = 1;
`,
  )
  writeFileSync(join(documentSrc, 'README.md'), 'not rewritten\n')
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
    const pluginDts = readFileSync(
      join(tree.pluginDist, 'src/lib/index.d.ts'),
      'utf8',
    )
    const adaptersJs = readFileSync(
      join(tree.pluginDist, 'vendor/payload-localization-adapters/index.js'),
      'utf8',
    )
    const pkg = JSON.parse(
      readFileSync(join(tree.pluginDist, 'package.json'), 'utf8'),
    ) as { dependencies: Record<string, string> }

    expect(
      existsSync(
        join(tree.pluginDist, 'vendor/payload-localized-fields/index.js'),
      ),
    ).toBe(true)
    expect(pluginJs).toContain(
      "from '../../vendor/payload-localized-fields/index.js'",
    )
    expect(pluginJs).toContain(
      "from '../../vendor/payload-localization-adapters/index.js'",
    )
    expect(pluginJs).not.toContain("'payload-localized-fields'")
    expect(pluginJs).not.toContain("'payload-localization-adapters'")
    expect(pluginDts).toContain(
      "from '../../vendor/payload-localized-fields/index.js'",
    )
    expect(adaptersJs).toContain("from '../payload-localized-fields/index.js'")
    expect(adaptersJs).not.toContain("'payload-localized-fields'")
    expect(pkg.dependencies).toEqual({
      'deep-equal': '^2.2.3',
      'dot-object': '^2.1.5',
      'es-toolkit': '^1.52.0',
      jsdom: '^29.1.1',
    })
    expect(
      existsSync(
        join(tree.pluginDist, 'vendor/payload-localized-fields/nested/extra.js'),
      ),
    ).toBe(true)
    expect(
      existsSync(
        join(tree.pluginDist, 'vendor/payload-localized-fields/README.md'),
      ),
    ).toBe(true)
  })

  it('throws when a compiled workspace package is missing', () => {
    const tree = makeTree()
    rmSync(tree.documentSrc, { recursive: true, force: true })
    expect(() => vendorWorkspacePackages(tree)).toThrow(
      /Missing compiled workspace package/,
    )
  })

  it('skips src rewrite when the plugin dist has no src directory', () => {
    const tree = makeTree()
    rmSync(join(tree.pluginDist, 'src'), { recursive: true, force: true })
    vendorWorkspacePackages(tree)
    expect(
      existsSync(
        join(tree.pluginDist, 'vendor/payload-localized-fields/index.js'),
      ),
    ).toBe(true)
  })

  it('does not require a dependencies field on the plugin package.json', () => {
    const tree = makeTree()
    writeFileSync(
      join(tree.pluginDist, 'package.json'),
      JSON.stringify({ name: 'payload-crowdin-sync' }),
    )
    vendorWorkspacePackages(tree)
    const pkg = JSON.parse(
      readFileSync(join(tree.pluginDist, 'package.json'), 'utf8'),
    ) as { dependencies?: Record<string, string> }
    expect(pkg.dependencies).toBeUndefined()
  })
})

describe('parseArgs', () => {
  it('defaults to the compiled dist paths', () => {
    expect(parseArgs([])).toEqual({
      pluginDist: resolve('dist/plugin'),
      documentSrc: resolve('dist/document/src'),
      adaptersSrc: resolve('dist/adapters/src'),
    })
  })

  it('parses explicit dist flags', () => {
    const tree = makeTree()
    expect(
      parseArgs([
        `--plugin-dist=${tree.pluginDist}`,
        `--document-src=${tree.documentSrc}`,
        `--adapters-src=${tree.adaptersSrc}`,
      ]),
    ).toEqual({
      pluginDist: resolve(tree.pluginDist),
      documentSrc: resolve(tree.documentSrc),
      adaptersSrc: resolve(tree.adaptersSrc),
    })
  })

  it('rejects unknown flags', () => {
    expect(() => parseArgs(['--nope'])).toThrow(/Unknown argument: --nope/)
  })
})
