import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest } from 'payload';
import {
  ensureArticleDirectoryPolymorphicLink,
  findRootArticleDirectoryPolymorphic,
} from '../api/helpers';
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

  const byName = await linkUnlinkedArticleDirectoriesByName(payload, req);
  collectionDocumentsUpdated += byName.collectionDocumentsUpdated;
  globalsUpdated += byName.globalsUpdated;

  return { collectionDocumentsUpdated, globalsUpdated };
}

/**
 * Link root rows that have no `collectionDocument` / `globalSlug`, using their
 * `name` (the document id, or the global slug) within their collection's
 * directory. Collection directories were created without `collectionDocument`,
 * so this covers most rows on existing installs.
 *
 * Skips Lexical block rows (they have a `parent`), rows for collections or
 * globals no longer in the config, rows whose document no longer exists, and
 * rows for a document that already has a linked row.
 */
async function linkUnlinkedArticleDirectoriesByName(
  payload: Payload,
  req?: PayloadRequest,
): Promise<BackfillArticleDirectoryLinksResult> {
  let collectionDocumentsUpdated = 0;
  let globalsUpdated = 0;
  const collectionSlugs = new Set(payload.config.collections.map((c) => c.slug));
  const globalSlugs = new Set(payload.config.globals.map((g) => g.slug));

  const collectionDirectories = await payload.find({
    collection: 'crowdin-collection-directories',
    depth: 0,
    pagination: false,
    req,
    overrideAccess: true,
  });

  for (const collectionDirectory of collectionDirectories.docs) {
    const collectionSlug = collectionDirectory.collectionSlug as string;
    const global = collectionSlug === 'globals';
    if (!global && !collectionSlugs.has(collectionSlug)) {
      continue;
    }

    let page = 1;
    const limit = 100;
    for (;;) {
      const batch = await payload.find({
        collection: 'crowdin-article-directories',
        where: {
          crowdinCollectionDirectory: { equals: collectionDirectory.id },
        },
        depth: 0,
        limit,
        page,
        req,
        overrideAccess: true,
      });

      for (const row of batch.docs as CrowdinArticleDirectory[]) {
        if (row.parent || row.collectionDocument?.value || row.globalSlug) {
          continue;
        }
        const name = `${row.name}`;
        const rootLookup = {
          collectionSlug: global ? name : collectionSlug,
          global,
        };
        let documentId: string = name;
        if (global) {
          if (!globalSlugs.has(name)) {
            continue;
          }
        } else {
          const document = await findDocument(payload, collectionSlug, name, req);
          if (!document) {
            continue;
          }
          documentId = document.id;
        }
        if (
          await findRootArticleDirectoryPolymorphic({
            payload,
            req,
            documentId,
            rootLookup,
          })
        ) {
          continue;
        }
        await ensureArticleDirectoryPolymorphicLink({
          payload,
          req,
          articleDirectory: row,
          documentId,
          ...rootLookup,
        });
        if (global) {
          globalsUpdated += 1;
        } else {
          collectionDocumentsUpdated += 1;
        }
      }

      if (batch.docs.length < limit) {
        break;
      }
      page += 1;
    }
  }

  return { collectionDocumentsUpdated, globalsUpdated };
}

async function findDocument(
  payload: Payload,
  collection: string,
  id: string,
  req?: PayloadRequest,
): Promise<{ id: string } | undefined> {
  try {
    return (await payload.findByID({
      collection: collection as CollectionSlug,
      id,
      depth: 0,
      req,
      overrideAccess: true,
    })) as { id: string };
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      return undefined;
    }
    throw error;
  }
}
