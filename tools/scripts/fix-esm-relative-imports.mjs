/**
 * Append explicit extensions to extensionless relative import/export specifiers
 * in emitted ESM files (Node native ESM requires them).
 *
 * Uses the TypeScript compiler API to locate module specifiers instead of regex,
 * so string literals and comments cannot be mistaken for imports.
 */
import {
  existsSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import ts from 'typescript';

const root = process.argv[2];
if (!root) {
  console.error('usage: node fix-esm-relative-imports.mjs <output-dir>');
  process.exit(1);
}

const HAS_EXT = /\.(js|mjs|cjs|json|node)$/i;

function isRelativeSpecifier(specifier) {
  return specifier === '.' || specifier === '..' || specifier.startsWith('./') || specifier.startsWith('../');
}

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

/**
 * @param {string} source
 * @param {string} filePath
 * @returns {string}
 */
function rewriteSpecifiers(source, filePath) {
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.JS,
  );

  /** @type {{ start: number, end: number, text: string }[]} */
  const replacements = [];

  /** @param {ts.StringLiteralLike} literal */
  function queueRewrite(literal) {
    const specifier = literal.text;
    if (!isRelativeSpecifier(specifier) || HAS_EXT.test(specifier)) {
      return;
    }
    replacements.push({
      start: literal.getStart(sourceFile) + 1,
      end: literal.getEnd(sourceFile) - 1,
      text: resolveRelativeImport(filePath, specifier),
    });
  }

  /** @param {ts.Node} node */
  function visit(node) {
    if (
      ts.isImportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      queueRewrite(node.moduleSpecifier);
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      queueRewrite(node.moduleSpecifier);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      const arg = node.arguments[0];
      if (arg && ts.isStringLiteral(arg)) {
        queueRewrite(arg);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (replacements.length === 0) {
    return source;
  }

  replacements.sort((a, b) => b.start - a.start);

  let output = source;
  for (const { start, end, text } of replacements) {
    output = output.slice(0, start) + text + output.slice(end);
  }
  return output;
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
