/**
 * Nx copies the source package.json into dist. Workspace consumers need
 * ./src/index.ts; the published tarball only contains compiled .js/.d.ts.
 *
 * Usage: node tools/scripts/rewrite-dist-entrypoints.mjs <dist-dir>
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

export const rewriteDistEntrypoints = (distDir) => {
  const packagePath = resolve(distDir, 'package.json');
  const json = JSON.parse(readFileSync(packagePath, 'utf8'));
  json.main = './src/index.js';
  json.types = './src/index.d.ts';
  json.module = './src/index.js';
  json.exports = {
    '.': {
      types: './src/index.d.ts',
      import: './src/index.js',
      default: './src/index.js',
    },
  };
  writeFileSync(packagePath, `${JSON.stringify(json, null, 2)}\n`);
};

export const runRewriteDistEntrypointsCli = (argv) => {
  const distDir = argv[0];
  if (!distDir) {
    throw new Error('Usage: node tools/scripts/rewrite-dist-entrypoints.mjs <dist-dir>');
  }
  rewriteDistEntrypoints(distDir);
};

/* c8 ignore start */
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    runRewriteDistEntrypointsCli(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
/* c8 ignore end */
