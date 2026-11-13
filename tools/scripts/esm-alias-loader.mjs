/**
 * Resolve selected package names to compiled workspace entries.
 * Used by assert-native-esm.mjs so adapters native-esm can load dist/document.
 */
import { pathToFileURL } from 'node:url';
import { resolve as resolvePath } from 'node:path';

const aliases = JSON.parse(process.env.ESM_ALIASES ?? '{}');

export async function resolve(specifier, context, nextResolve) {
  if (Object.hasOwn(aliases, specifier)) {
    return {
      shortCircuit: true,
      url: pathToFileURL(resolvePath(aliases[specifier])).href,
    };
  }
  return nextResolve(specifier, context);
}
