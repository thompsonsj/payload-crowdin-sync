import type { Field } from 'payload'

/**
 * Builds the fields for the 'Document' tab on `crowdin-article-directories`.
 *
 * - `collectionDocument` — polymorphic relationship linking the directory to
 *   its Payload collection document. Only present when collections are synced.
 * - `globalSlug` — select field identifying the Payload global. Only present
 *   when globals are synced. (Global relationships are not supported by Payload
 *   — see https://github.com/payloadcms/payload/discussions/2100.)
 */
export function buildDocumentTabFields(
  syncedCollectionSlugs: string[],
  syncedGlobalSlugs: string[],
): Field[] {
  const fields: Field[] = []

  if (syncedCollectionSlugs.length > 0) {
    fields.push({
      name: 'collectionDocument',
      type: 'relationship',
      relationTo: syncedCollectionSlugs,
      hasMany: false,
    })
  }

  if (syncedGlobalSlugs.length > 0) {
    fields.push({
      name: 'globalSlug',
      type: 'select',
      // can't create global relationships — see https://github.com/payloadcms/payload/discussions/2100
      options: syncedGlobalSlugs,
      hasMany: false,
    })
  }

  return fields
}
