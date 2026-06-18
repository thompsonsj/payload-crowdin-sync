/**
 * Append explicit extensions to extensionless relative import/export specifiers
 * in emitted ESM files (Node native ESM requires them).
 */
import {
  existsSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const root = process.argv[2];
if (!root) {
  console.error('usage: node fix-esm-relative-imports.mjs <output-dir>');
  process.exit(1);
}

const HAS_EXT = /\.(js|mjs|cjs|json|node)$/i;

function resolveRelativeImport(fromFile, specifier) {
  if (HAS_EXT.test(specifier)) return specifier;

  if (specifier === '.') {
    return './index.js';
  }
  if (specifier === '..') {
    return '../index.js';
  }

  const base = resolve(dirname(fromFile), specifier);
  if (existsSync(`${base}.js`)) {
    return `${specifier}.js`;
  }
  if (existsSync(join(base, 'index.js'))) {
    return specifier.endsWith('/')
      ? `${specifier}index.js`
      : `${specifier}/index.js`;
  }
  throw new Error(
    `Cannot resolve relative import "${specifier}" from ${fromFile}`,
  );
}

function rewriteSpecifiers(source, filePath) {
  const rewrite = (path) => resolveRelativeImport(filePath, path);

  const relPath = /\.\.?(?:\/[^'"]*)?/;

  return source
    .replace(
      /(\bfrom\s+['"])(\.\.?(?:\/[^'"]*)?)(['"])/g,
      (_, pre, path, suf) => `${pre}${rewrite(path)}${suf}`,
    )
    .replace(
      /(\bexport\s+\*\s+from\s+['"])(\.\.?(?:\/[^'"]*)?)(['"])/g,
      (_, pre, path, suf) => `${pre}${rewrite(path)}${suf}`,
    )
    .replace(
      /(\bimport\s*\(\s*['"])(\.\.?(?:\/[^'"]*)?)(['"]\s*\))/g,
      (_, pre, path, suf) => `${pre}${rewrite(path)}${suf}`,
    );
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path);
      continue;
    }
    if (!path.endsWith('.js')) continue;
    const before = readFileSync(path, 'utf8');
    const after = rewriteSpecifiers(before, path);
    if (after !== before) writeFileSync(path, after);
  }
}

walk(root);
console.log(`fixed ESM relative imports under ${root}`);
