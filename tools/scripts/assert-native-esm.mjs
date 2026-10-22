/**
 * Load a compiled package entry with Node's native ESM resolver.
 *
 * Usage:
 *   node tools/scripts/assert-native-esm.mjs <dist-dir>
 *   node tools/scripts/assert-native-esm.mjs dist/plugin \
 *     --alias=payload-localized-fields=dist/document/src/index.js
 */
import { register } from 'node:module';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const parseArgs = (argv) => {
  const aliases = {};
  let distDir;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    let aliasValue;
    if (arg.startsWith('--alias=')) {
      aliasValue = arg.slice('--alias='.length);
    } else if (arg === '--alias') {
      aliasValue = argv[i + 1];
      i += 1;
    } else if (!arg.startsWith('--')) {
      distDir = arg;
      continue;
    } else {
      console.error(`Unknown argument: ${arg}`);
      process.exit(1);
    }
    if (!aliasValue) {
      console.error('Usage: --alias=name=path');
      process.exit(1);
    }
    const eq = aliasValue.indexOf('=');
    if (eq === -1) {
      console.error(`Invalid --alias ${aliasValue}; expected name=path`);
      process.exit(1);
    }
    aliases[aliasValue.slice(0, eq)] = resolve(aliasValue.slice(eq + 1));
  }
  return { distDir, aliases };
};

const { distDir, aliases } = parseArgs(process.argv.slice(2));
if (!distDir) {
  console.error(
    'Usage: node tools/scripts/assert-native-esm.mjs <dist-dir> [--alias=name=path]',
  );
  process.exit(1);
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
