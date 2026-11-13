/**
 * Nx copies the source package.json into dist. Workspace consumers need
 * ./src/index.ts; the published tarball only contains compiled .js/.d.ts.
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const distDir = process.argv[2];
if (!distDir) {
  console.error('Usage: node tools/scripts/rewrite-dist-entrypoints.mjs <dist-dir>');
  process.exit(1);
}

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
