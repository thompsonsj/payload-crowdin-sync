import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest } from 'payload';
import { ensureArticleDirectoryPolymorphicLink } from '../api/helpers';
import { containsLocalizedFields } from '../utilities';
import type { CrowdinArticleDirectory } from '../payload-types';

export type BackfillArticleDirectoryLinksResult = {
  collectionDocumentsUpdated: number;
  globalsUpdated: number;
};

function relationshipId(
  ref: string | { id?: string } | null | undefined,
): string | undefined {
  if (!ref) {
    return undefined;
  }
  if (typeof ref === 'string') {
    return ref;
  }
  if (typeof ref === 'object' && typeof ref.id === 'string') {
    return ref.id;
  }
  return undefined;
}

/**
 * One-time (or idempotent) migration for installs that still only store the
 * Crowdin article directory id on the source document via `crowdinArticleDirectory`.
 *
 * Writes `collectionDocument` / `globalSlug` onto the corresponding
 * `crowdin-article-directories` rows so lookups no longer depend on that field
 * remaining on collection/global documents.
 *
 * Run from a Payload `onInit` hook, a one-off script, or the admin UI.
 */
export async function backfillArticleDirectoryPolymorphicLinks(
  payload: Payload,
  req?: PayloadRequest,
): Promise<BackfillArticleDirectoryLinksResult> {
  let collectionDocumentsUpdated = 0;
  let globalsUpdated = 0;

  for (const collection of payload.config.collections) {
    if (!containsLocalizedFields({ fields: collection.fields })) {
      continue;
    }

    const slug = collection.slug as CollectionSlug;
    let page = 1;
    const limit = 100;

    for (;;) {
      const batch = await payload.find({
        collection: slug,
        where: {
          crowdinArticleDirectory: {
            not_equals: null,
          },
        },
        depth: 0,
        limit,
        page,
        req,
        overrideAccess: true,
      });

      if (batch.docs.length === 0) {
        break;
      }

      for (const doc of batch.docs) {
        const dirId = relationshipId(
          (doc as { crowdinArticleDirectory?: string | { id?: string } })
            .crowdinArticleDirectory,
        );
        if (!dirId) {
          continue;
        }
        const articleDirectory = (await payload.findByID({
          collection: 'crowdin-article-directories',
          id: dirId,
          depth: 0,
          req,
          overrideAccess: true,
        })) as CrowdinArticleDirectory;

        const updated = await ensureArticleDirectoryPolymorphicLink({
          payload,
          req,
          articleDirectory,
          documentId: (doc as { id: string }).id,
          collectionSlug: slug,
          global: false,
        });
        if (updated) {
          collectionDocumentsUpdated += 1;
        }
      }

      if (batch.docs.length < limit) {
        break;
      }
      page += 1;
    }
  }

  for (const global of payload.config.globals) {
    if (!containsLocalizedFields({ fields: global.fields })) {
      continue;
    }

    const doc = await payload.findGlobal({
      slug: global.slug as GlobalSlug,
      depth: 0,
      req,
      overrideAccess: true,
    });

    const dirId = relationshipId(
      (doc as { crowdinArticleDirectory?: string | { id?: string } })
        .crowdinArticleDirectory,
    );
    if (!dirId) {
      continue;
    }

    const articleDirectory = (await payload.findByID({
      collection: 'crowdin-article-directories',
      id: dirId,
      depth: 0,
      req,
      overrideAccess: true,
    })) as CrowdinArticleDirectory;

    const updated = await ensureArticleDirectoryPolymorphicLink({
      payload,
      req,
      articleDirectory,
      documentId: global.slug,
      collectionSlug: global.slug,
      global: true,
    });
    if (updated) {
      globalsUpdated += 1;
    }
  }

  return { collectionDocumentsUpdated, globalsUpdated };
}
