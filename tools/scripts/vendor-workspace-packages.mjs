/**
 * Copy compiled document/ and adapters/ into dist/plugin/vendor and rewrite
 * package specifiers so the published plugin does not depend on those npm names.
 *
 * Usage:
 *   node tools/scripts/vendor-workspace-packages.mjs
 *   node tools/scripts/vendor-workspace-packages.mjs \
 *     --plugin-dist=dist/plugin \
 *     --document-src=dist/document/src \
 *     --adapters-src=dist/adapters/src
 */
import { cpSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';

const WORKSPACE_PACKAGES = {
  'payload-localized-fields': 'documentSrc',
  'payload-localization-adapters': 'adaptersSrc',
};

const walk = (dir) => {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      out.push(...walk(path));
    } else {
      out.push(path);
    }
  }
  return out;
};

const rewriteImports = (filePath, vendorRoots) => {
  const dir = dirname(filePath);
  let text = readFileSync(filePath, 'utf8');
  let changed = false;
  for (const [name, vendorRoot] of Object.entries(vendorRoots)) {
    const entry = join(vendorRoot, 'index.js');
    let rel = relative(dir, entry).replaceAll('\\', '/');
    if (!rel.startsWith('.')) {
      rel = `./${rel}`;
    }
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`((?:from|import)\\s*\\(?\\s*)(['"])${escaped}\\2`, 'g');
    const next = text.replace(re, `$1$2${rel}$2`);
    if (next !== text) {
      text = next;
      changed = true;
    }
  }
  if (changed) {
    writeFileSync(filePath, text);
  }
};

export const vendorWorkspacePackages = ({ pluginDist, documentSrc, adaptersSrc }) => {
  const sources = { documentSrc, adaptersSrc };
  const vendorRoots = {};
  for (const [name, srcKey] of Object.entries(WORKSPACE_PACKAGES)) {
    const src = sources[srcKey];
    if (!existsSync(src)) {
      throw new Error(`Missing compiled workspace package at ${src}`);
    }
    const dest = join(pluginDist, 'vendor', name);
    cpSync(src, dest, { recursive: true });
    vendorRoots[name] = dest;
  }

  for (const root of [join(pluginDist, 'src'), join(pluginDist, 'vendor')]) {
    if (!existsSync(root)) {
      continue;
    }
    for (const file of walk(root)) {
      if (file.endsWith('.js') || file.endsWith('.d.ts')) {
        rewriteImports(file, vendorRoots);
      }
    }
  }

  const packagePath = join(pluginDist, 'package.json');
  const json = JSON.parse(readFileSync(packagePath, 'utf8'));
  if (json.dependencies) {
    for (const name of Object.keys(WORKSPACE_PACKAGES)) {
      delete json.dependencies[name];
    }
  }
  writeFileSync(packagePath, `${JSON.stringify(json, null, 2)}\n`);
};

const parseArgs = (argv) => {
  let pluginDist = 'dist/plugin';
  let documentSrc = 'dist/document/src';
  let adaptersSrc = 'dist/adapters/src';
  for (const arg of argv) {
    if (arg.startsWith('--plugin-dist=')) {
      pluginDist = arg.slice('--plugin-dist='.length);
    } else if (arg.startsWith('--document-src=')) {
      documentSrc = arg.slice('--document-src='.length);
    } else if (arg.startsWith('--adapters-src=')) {
      adaptersSrc = arg.slice('--adapters-src='.length);
    } else {
      console.error(`Unknown argument: ${arg}`);
      process.exit(1);
    }
  }
  return {
    pluginDist: resolve(pluginDist),
    documentSrc: resolve(documentSrc),
    adaptersSrc: resolve(adaptersSrc),
  };
};

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  vendorWorkspacePackages(parseArgs(process.argv.slice(2)));
}
