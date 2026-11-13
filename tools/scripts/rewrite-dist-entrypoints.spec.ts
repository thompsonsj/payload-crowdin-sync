import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { rewriteDistEntrypoints } from './rewrite-dist-entrypoints.mjs'

const dirs: string[] = []

afterEach(() => {
  while (dirs.length > 0) {
    const dir = dirs.pop()
    if (dir) rmSync(dir, { recursive: true, force: true })
  }
})

describe('rewriteDistEntrypoints', () => {
  it('points package.json at compiled .js and .d.ts', () => {
    const distDir = mkdtempSync(join(tmpdir(), 'rewrite-entrypoints-'))
    dirs.push(distDir)
    writeFileSync(
      join(distDir, 'package.json'),
      JSON.stringify({
        name: 'payload-crowdin-sync',
        main: './src/index.ts',
        types: './src/index.ts',
        exports: {
          '.': {
            types: './src/index.ts',
            import: './src/index.ts',
          },
        },
      }),
    )

    rewriteDistEntrypoints(distDir)

    expect(JSON.parse(readFileSync(join(distDir, 'package.json'), 'utf8'))).toMatchObject({
      main: './src/index.js',
      types: './src/index.d.ts',
      module: './src/index.js',
      exports: {
        '.': {
          types: './src/index.d.ts',
          import: './src/index.js',
          default: './src/index.js',
        },
      },
    })
  })
})
