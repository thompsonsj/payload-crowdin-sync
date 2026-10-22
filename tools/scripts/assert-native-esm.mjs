/**
 * Load a compiled package entry with Node's native ESM resolver.
 *
 * Usage:
 *   node tools/scripts/assert-native-esm.mjs <dist-dir>
 *   node tools/scripts/assert-native-esm.mjs dist/plugin \
 *     --alias payload-localized-fields=dist/document/src/index.js
 */
import { register } from 'node:module';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const distDir = args.find((arg) => !arg.startsWith('--'));
if (!distDir) {
  console.error(
    'Usage: node tools/scripts/assert-native-esm.mjs <dist-dir> [--alias name=path]',
  );
  process.exit(1);
}

const aliases = {};
for (const arg of args) {
  if (!arg.startsWith('--alias=')) {
    continue;
  }
  const value = arg.slice('--alias='.length);
  const eq = value.indexOf('=');
  if (eq === -1) {
    console.error(`Invalid --alias ${value}; expected name=path`);
    process.exit(1);
  }
  aliases[value.slice(0, eq)] = resolve(value.slice(eq + 1));
}

const entry = resolve(distDir, 'src/index.js');
if (!existsSync(entry)) {
  console.error(`Missing ${entry}. Build the package first.`);
  process.exit(1);
}

if (Object.keys(aliases).length > 0) {
  process.env.ESM_ALIASES = JSON.stringify(aliases);
  register('./esm-alias-loader.mjs', import.meta.url);
}

try {
  await import(pathToFileURL(entry).href);
} catch (error) {
  console.error(`native ESM failed: ${entry}`);
  throw error;
}

console.log(`native ESM ok: ${entry}`);
