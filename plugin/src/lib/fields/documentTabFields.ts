import type { Field } from 'payload';

/**
 * Fields for the "Document" tab on `crowdin-article-directories`, linking a
 * directory back to the collection document or global it was created for.
 */
export function buildDocumentTabFields(
  syncedCollectionSlugs: string[],
  syncedGlobalSlugs: string[],
): Field[] {
  const fields: Field[] = [];

  if (syncedCollectionSlugs.length > 0) {
    fields.push({
      name: 'collectionDocument',
      type: 'relationship',
      relationTo: syncedCollectionSlugs,
      hasMany: false,
    });
  }

  if (syncedGlobalSlugs.length > 0) {
    fields.push({
      // can't create global relationships - see https://github.com/payloadcms/payload/discussions/2100
      name: 'globalSlug',
      type: 'select',
      options: syncedGlobalSlugs,
      hasMany: false,
    });
  }

  return fields;
}
