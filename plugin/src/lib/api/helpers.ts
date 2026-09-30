import { Payload } from 'payload';
import {
  CrowdinArticleDirectory,
  CrowdinCollectionDirectory,
  CrowdinFile,
} from '../payload-types';
import { payloadCrowdinSyncTranslationsApi } from './translations';
import {
  PluginOptions,
  isCollectionOrGlobalConfigObject,
  isCollectionOrGlobalConfigSlug,
  isCrowdinArticleDirectory,
} from '../types';
import type {
  CollectionConfig,
  GlobalConfig,
  PayloadRequest,
  SanitizedCollectionConfig,
  SanitizedGlobalConfig,
} from 'payload';

export const getCollectionConfig = (
  collection: string,
  global: boolean,
  payload: Payload,
): CollectionConfig | GlobalConfig | undefined => {
  let collectionConfig:
    | SanitizedGlobalConfig
    | SanitizedCollectionConfig
    | undefined;
  if (!collection && !global) {
    return undefined;
  }
  if (global) {
    collectionConfig = payload.config.globals.find(
      (col: GlobalConfig) => col.slug === collection,
    );
  } else {
    collectionConfig = payload.config.collections.find(
      (col: CollectionConfig) => col.slug === collection,
    );
  }
  if (!collectionConfig)
    throw new Error(`Collection ${collection} not found in payload config`);
  return collectionConfig;
};

/** Resolve a root `crowdin-article-directories` row via polymorphic metadata (not Lexical child rows). */
export type ArticleDirectoryRootLookup = {
  collectionSlug: string;
  global: boolean;
};

/**
 * Find a root article directory linked to its document: `collectionDocument`
 * for collections, `globalSlug` for globals.
 */
export async function findRootArticleDirectoryPolymorphic({
  payload,
  req,
  documentId,
  rootLookup,
}: {
  payload: Payload;
  req?: PayloadRequest;
  /** For collections: the Payload document id. For globals: typically the global slug (same as `rootLookup.collectionSlug`). */
  documentId: string;
  rootLookup: ArticleDirectoryRootLookup;
}): Promise<CrowdinArticleDirectory | undefined> {
  if (rootLookup.global) {
    const r = await payload.find({
      collection: 'crowdin-article-directories',
      where: {
        globalSlug: { equals: rootLookup.collectionSlug },
      },
      limit: 1,
      req,
      overrideAccess: true,
    });
    return r.docs[0] as CrowdinArticleDirectory | undefined;
  }
  const r = await payload.find({
    collection: 'crowdin-article-directories',
    where: {
      and: [
        { 'collectionDocument.value': { equals: documentId } },
        { 'collectionDocument.relationTo': { equals: rootLookup.collectionSlug } },
      ],
    },
    limit: 1,
    req,
    overrideAccess: true,
  });
  return r.docs[0] as CrowdinArticleDirectory | undefined;
}

/**
 * Resolve the directory held in a document's `crowdinArticleDirectory` field.
 *
 * The field is virtual: its `beforeChange` hook stops it being stored, and its
 * `afterRead` hook fills it in with a directory lookup. So documents read
 * through Payload usually carry the resolved directory already, and using it
 * saves the queries below. A string id only appears in raw data, or on
 * documents stored by versions that saved the field. Returns `undefined` if
 * that row no longer exists.
 */
async function findArticleDirectoryOnDocument({
  payload,
  req,
  documentDirectory,
}: {
  payload: Payload;
  req?: PayloadRequest;
  documentDirectory: unknown;
}): Promise<CrowdinArticleDirectory | undefined> {
  if (!documentDirectory) {
    return undefined;
  }
  if (typeof documentDirectory === 'object') {
    return (documentDirectory as CrowdinArticleDirectory).id
      ? (documentDirectory as CrowdinArticleDirectory)
      : undefined;
  }
  try {
    return (await payload.findByID({
      collection: 'crowdin-article-directories',
      id: documentDirectory as string,
      req,
      overrideAccess: true,
    })) as CrowdinArticleDirectory;
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      return undefined;
    }
    throw error;
  }
}

/**
 * Find a directory row that has no link back to its document, by its `name`
 * (the document id, or the global slug) within the collection's directory
 * (`globals` for globals). Does not create the collection directory.
 *
 * New collection directories are created without `collectionDocument`, so
 * this is how collection documents are found unless the backfill has linked
 * their rows. Global directories get `globalSlug` on creation, so for globals
 * this only finds rows from older versions.
 */
async function findUnlinkedArticleDirectoryByName({
  payload,
  req,
  documentId,
  rootLookup,
}: {
  payload: Payload;
  req?: PayloadRequest;
  documentId: string;
  rootLookup: ArticleDirectoryRootLookup;
}): Promise<CrowdinArticleDirectory | undefined> {
  const collectionDirectories = await payload.find({
    collection: 'crowdin-collection-directories',
    where: {
      collectionSlug: {
        equals: rootLookup.global ? 'globals' : rootLookup.collectionSlug,
      },
    },
    limit: 1,
    req,
    overrideAccess: true,
  });
  const collectionDirectory = collectionDirectories.docs[0];
  if (!collectionDirectory) {
    return undefined;
  }
  const articleDirectories = await payload.find({
    collection: 'crowdin-article-directories',
    where: {
      and: [
        { name: { equals: `${documentId}` } },
        { crowdinCollectionDirectory: { equals: collectionDirectory.id } },
      ],
    },
    limit: 1,
    req,
    overrideAccess: true,
  });
  return articleDirectories.docs[0] as CrowdinArticleDirectory | undefined;
}

/**
 * Find the root article directory for a collection document or global.
 *
 * Tries, in order:
 * 1. a row linked to the document (`collectionDocument` / `globalSlug`)
 * 2. the directory already on the document's `crowdinArticleDirectory` field
 * 3. an unlinked row matched by `name` within the collection's directory
 *
 * Each candidate is passed through `validate` (self-clean on sync); the first
 * one it returns wins. Different lookups often find the same row, so a row
 * `validate` rejected (and self-clean may have deleted) is not validated again.
 */
export async function resolveRootArticleDirectory({
  payload,
  req,
  documentId,
  rootLookup,
  documentDirectory,
  validate = async (directory) => directory,
}: {
  payload: Payload;
  req?: PayloadRequest;
  /** For collections: the Payload document id. For globals: the global slug. */
  documentId: string;
  rootLookup: ArticleDirectoryRootLookup;
  /** Value of the document's `crowdinArticleDirectory` field, if any. */
  documentDirectory?: unknown;
  validate?: (
    directory: CrowdinArticleDirectory,
  ) => Promise<CrowdinArticleDirectory | undefined>;
}): Promise<CrowdinArticleDirectory | undefined> {
  const lookups = [
    () =>
      findRootArticleDirectoryPolymorphic({
        payload,
        req,
        documentId,
        rootLookup,
      }),
    () => findArticleDirectoryOnDocument({ payload, req, documentDirectory }),
    () =>
      findUnlinkedArticleDirectoryByName({
        payload,
        req,
        documentId,
        rootLookup,
      }),
  ];
  const rejectedIds = new Set<string>();
  for (const lookup of lookups) {
    const candidate = await lookup();
    if (!candidate || rejectedIds.has(candidate.id)) {
      continue;
    }
    const directory = await validate(candidate);
    if (directory) {
      return directory;
    }
    rejectedIds.add(candidate.id);
  }
  return undefined;
}

/**
 * Ensure a root article directory row has polymorphic metadata for installs that still only have a legacy `crowdinArticleDirectory` id on the source document.
 */
export async function ensureArticleDirectoryPolymorphicLink({
  payload,
  req,
  articleDirectory,
  documentId,
  collectionSlug,
  global,
}: {
  payload: Payload;
  req?: PayloadRequest;
  articleDirectory: CrowdinArticleDirectory;
  documentId: string;
  collectionSlug: string;
  global: boolean;
}): Promise<boolean> {
  const collectionDocument =
    articleDirectory.collectionDocument &&
    typeof articleDirectory.collectionDocument === 'object'
      ? (articleDirectory.collectionDocument as {
          value?: unknown;
          relationTo?: unknown;
        })
      : undefined;

  const hasCollection =
    !global &&
    Boolean(
      collectionDocument &&
        typeof collectionDocument.value === 'string' &&
        collectionDocument.value.length > 0 &&
        typeof collectionDocument.relationTo === 'string' &&
        collectionDocument.relationTo.length > 0,
    );
  const hasGlobal =
    global &&
    typeof articleDirectory.globalSlug === 'string' &&
    articleDirectory.globalSlug.length > 0;
  if (hasCollection || hasGlobal) {
    return false;
  }
  const data: Partial<CrowdinArticleDirectory> = global
    ? { globalSlug: collectionSlug }
    : {
        collectionDocument: {
          value: documentId,
          relationTo: collectionSlug,
        },
      };
  await payload.update({
    collection: 'crowdin-article-directories',
    id: articleDirectory.id,
    data,
    req,
    overrideAccess: true,
    context: {
      triggerAfterChange: false,
    },
  });
  return true;
}

/**
 * Retrieve the Crowdin article directory for a given document ID.
 *
 * If `parent` is provided, the lookup is restricted to directories with that parent.
 *
 * @param allowEmpty - If `false` (default), throws when no matching directory is found; if `true`, returns `undefined` instead of throwing.
 * @param parent - Parent directory (object) or parent ID (string) to limit the search.
 * @returns The matched Crowdin article directory, or `undefined` when not found and `allowEmpty` is `true`.
 * @throws Error when no matching directory exists and `allowEmpty` is `false`.
 */
export async function getArticleDirectory({
  documentId,
  payload,
  allowEmpty,
  parent,
  req,
  rootLookup,
}: {
  documentId: string;
  payload: Payload;
  allowEmpty?: boolean;
  parent?: CrowdinArticleDirectory | null | string;
  req?: PayloadRequest;
  /** When resolving a root directory (no `parent`), use `resolveRootArticleDirectory`, which limits the `name` lookup to this collection. */
  rootLookup?: ArticleDirectoryRootLookup;
}) {
  if (parent !== undefined) {
    const crowdinPayloadArticleDirectory = await payload.find({
      collection: 'crowdin-article-directories',
      where: {
        name: {
          equals: documentId,
        },
        parent: {
          equals: isCrowdinArticleDirectory(parent) ? parent?.id : parent,
        },
      },
      req,
    });
    if (crowdinPayloadArticleDirectory.totalDocs === 0 && !allowEmpty) {
      console.error(
        `No article directory found for document ${documentId} (lexical / child directory).`,
      );
      throw new Error(
        'This article does not have a corresponding entry in the crowdin-article-directories collection.',
      );
    }
    return crowdinPayloadArticleDirectory.docs[0];
  }

  if (rootLookup) {
    const articleDirectory = await resolveRootArticleDirectory({
      payload,
      req,
      documentId,
      rootLookup,
    });
    if (!articleDirectory && !allowEmpty) {
      console.error(`No article directory found for document ${documentId}`);
      throw new Error(
        'This article does not have a corresponding entry in the crowdin-article-directories collection.',
      );
    }
    return articleDirectory;
  }

  // Without `rootLookup` the collection is unknown, so a `name` match may
  // belong to another collection when ids repeat across collections.
  const crowdinPayloadArticleDirectory = await payload.find({
    collection: 'crowdin-article-directories',
    where: {
      name: {
        equals: documentId,
      },
    },
    req,
  });
  if (crowdinPayloadArticleDirectory.totalDocs === 0 && !allowEmpty) {
    console.error(`No article directory found for document ${documentId}`);
    throw new Error(
      'This article does not have a corresponding entry in the crowdin-article-directories collection.',
    );
  }
  return crowdinPayloadArticleDirectory.docs[0];
}

/**
 * Retrieve child Crowdin article directories for the given parent.
 *
 * @param parent - Parent directory to filter by; may be a CrowdinArticleDirectory object, its `id`, or `null`. If an object is provided, its `id` is used for the lookup.
 * @returns An array of matching Crowdin article directory documents.
 */
export async function getLexicalFieldArticleDirectories({
  payload,
  parent,
  req,
}: {
  payload: Payload;
  parent?: CrowdinArticleDirectory | null | string;
  req?: PayloadRequest;
}) {
  const where =
    parent === undefined
      ? undefined
      : {
          parent: {
            equals: isCrowdinArticleDirectory(parent) ? parent?.id : parent,
          },
        };

  const query = await payload.find({
    collection: 'crowdin-article-directories',
    where,
    req,
  });
  return query.docs;
}

/**
 * Retrieve the Crowdin article directory for a lexical field by its field name within an optional parent directory.
 *
 * @param name - The lexical field's name (used as the documentId in dot notation).
 * @param parent - Parent directory id, directory object, or null to scope the lookup.
 * @returns The matching CrowdinArticleDirectory if found, otherwise `undefined`.
 */
export async function getLexicalFieldArticleDirectory({
  payload,
  parent,
  name,
  req,
}: {
  payload: Payload;
  parent?: CrowdinArticleDirectory | null | string;
  name: string;
  req?: PayloadRequest;
}): Promise<CrowdinArticleDirectory | undefined> {
  return (await getArticleDirectory({
    /** 'document id' is the field name in dot notation for lexical blocks */
    documentId: name,
    payload,
    allowEmpty: true,
    parent,
    req,
  })) as CrowdinArticleDirectory | undefined;
}

/**
 * Retrieves the first Crowdin file document with the given field name in the specified article directory.
 *
 * @param name - The field name of the file to find.
 * @param crowdinArticleDirectoryId - The ID of the Crowdin article directory to search within.
 * @returns The first matching Crowdin file document, or `undefined` if none is found.
 */
export async function getFile(
  name: string,
  crowdinArticleDirectoryId: string,
  payload: Payload,
  req?: PayloadRequest,
): Promise<any> {
  const result = await payload.find({
    collection: 'crowdin-files',
    where: {
      field: { equals: name },
      crowdinArticleDirectory: {
        equals: crowdinArticleDirectoryId,
      },
    },
    req,
  });
  return result.docs[0];
}

/**
 * Retrieve all Crowdin files belonging to a specific article directory.
 *
 * @param crowdinArticleDirectoryId - ID of the Crowdin article directory to fetch files for
 * @param payload - Payload CMS instance used to query the collection
 * @param req - Optional request context forwarded to the query
 * @returns An array of `CrowdinFile` documents associated with the specified article directory
 */
export async function getFiles(
  crowdinArticleDirectoryId: string,
  payload: Payload,
  req?: PayloadRequest,
): Promise<CrowdinFile[]> {
  const result = await payload.find({
    collection: 'crowdin-files',
    limit: 10000,
    where: {
      crowdinArticleDirectory: {
        equals: crowdinArticleDirectoryId,
      },
    },
    req,
  });
  return result.docs as any;
}

/**
 * Retrieve the Crowdin file with the given field name for the article directory associated with a document ID.
 *
 * @param name - The file field name to look up within the article directory
 * @param documentId - The document identifier used to locate the corresponding article directory
 * @param req - Optional request context used for payload operations
 * @returns The matching Crowdin file document
 */
export async function getFileByDocumentID(
  name: string,
  documentId: string,
  payload: Payload,
  req?: PayloadRequest,
  rootLookup?: ArticleDirectoryRootLookup,
): Promise<CrowdinFile> {
  let articleDirectory = undefined;
  try {
    articleDirectory = await getArticleDirectory({
      documentId,
      payload,
      req,
      rootLookup,
    });
  } catch (error) {
    console.error(error);
  }
  return getFile(name, `${articleDirectory?.id}`, payload, req);
}

/**
 * Retrieve all Crowdin files for the article directory associated with a document ID.
 *
 * @param documentId - The document identifier used to resolve the Crowdin article directory
 * @param parent - Optional parent article directory to scope the lookup
 * @returns An array of `CrowdinFile` objects for the resolved article directory, or an empty array if no directory is found
 */
export async function getFilesByDocumentID({
  documentId,
  payload,
  parent,
  req,
  rootLookup,
}: {
  documentId: string;
  payload: Payload;
  parent?: CrowdinArticleDirectory;
  req?: PayloadRequest;
  rootLookup?: ArticleDirectoryRootLookup;
}): Promise<CrowdinFile[]> {
  let articleDirectory = undefined;
  try {
    articleDirectory = await getArticleDirectory({
      documentId: `${documentId}`,
      payload,
      allowEmpty: true,
      parent,
      req,
      rootLookup,
    });
  } catch (error) {
    console.error(error);
  }
  if (!articleDirectory) {
    // tests call this function to make sure files are deleted
    return [];
  }
  const files = await getFiles(`${articleDirectory.id}`, payload, req);
  return files;
}

interface IupdatePayloadTranslation {
  articleDirectoryId: string;
  pluginOptions: PluginOptions;
  payload: Payload;
  /** store translations into a draft */
  draft?: boolean;
  /** prevent database changes */
  dryRun?: boolean;
  /** override article directory exclude locales */
  excludeLocales?: string[];
  req?: PayloadRequest;
}

/**
 * Trigger an update of translations for the specified Crowdin article directory.
 *
 * @param articleDirectoryId - ID of the Crowdin article directory to update
 * @param pluginOptions - Plugin configuration used to initialize the Crowdin translations API
 * @param draft - When true, update translations as drafts
 * @param dryRun - When true, perform a dry run without persisting changes
 * @param excludeLocales - Locales to exclude from the update; if omitted, directory-specific excludes are used
 * @returns An object with `status: 200` and translation result fields on success; on failure returns `status: 400` and an `error` field
 */
export async function updatePayloadTranslation({
  articleDirectoryId,
  pluginOptions,
  payload,
  draft,
  dryRun,
  excludeLocales,
  req,
}: IupdatePayloadTranslation) {
  // get article directory
  const articleDirectory = await payload.findByID({
    id: articleDirectoryId,
    collection: 'crowdin-article-directories',
    req,
  });
  // is this a global or a collection?
  const global =
    ((
      articleDirectory[
        'crowdinCollectionDirectory'
      ] as CrowdinCollectionDirectory
    )?.collectionSlug as string) === 'globals';
  // get an instance of our translations api
  const translationsApi = new payloadCrowdinSyncTranslationsApi(
    pluginOptions,
    payload,
    req,
  );
  const collectionDoc = articleDirectory.collectionDocument as
    | { value?: string; relationTo?: string }
    | undefined
    | null;
  const polymorphicDocId =
    collectionDoc &&
    typeof collectionDoc === 'object' &&
    typeof collectionDoc.value === 'string'
      ? collectionDoc.value
      : undefined;
  const polymorphicRelation =
    collectionDoc &&
    typeof collectionDoc === 'object' &&
    typeof collectionDoc.relationTo === 'string'
      ? collectionDoc.relationTo
      : undefined;

  try {
    const translations = await translationsApi.updateTranslation({
      documentId: !global
        ? polymorphicDocId || (articleDirectory['name'] as string)
        : ``,
      collection: global
        ? String(articleDirectory.globalSlug || articleDirectory.name || '')
        : String(
            polymorphicRelation ||
              ((
                articleDirectory[
                  'crowdinCollectionDirectory'
                ] as CrowdinCollectionDirectory
              )?.collectionSlug as string) ||
              '',
          ),
      global,
      draft,
      dryRun,
      excludeLocales:
        excludeLocales ||
        (articleDirectory['excludeLocales'] as string[]) ||
        [],
    });
    return {
      status: 200,
      ...translations,
    };
  } catch (error) {
    console.error(
      'updatePayloadTranslation',
      {
        articleDirectoryId,
        pluginOptions,
        draft,
        dryRun,
        excludeLocales,
      },
      error,
    );
    return {
      status: 400,
      error,
    };
  }
}

export const isCrowdinActive = ({
  doc,
  slug,
  global,
  pluginOptions,
}: {
  doc: any;
  slug: string;
  global: boolean;
  pluginOptions: PluginOptions;
}) => {
  if (!slug) {
    return false;
  }

  if (global) {
    if (!pluginOptions.globals) {
      return true;
    }

    const matchingGlobalConfig = pluginOptions.globals.find((config) => {
      if (isCollectionOrGlobalConfigObject(config) && config.slug === slug) {
        if (typeof config.condition !== 'undefined') {
          return config.condition({ doc });
        }
        return true;
      }
      if (isCollectionOrGlobalConfigSlug(config)) {
        return config === slug;
      }
      return false;
    });

    if (typeof matchingGlobalConfig !== 'undefined') {
      return true;
    }
  }

  if (!pluginOptions.collections) {
    return true;
  }

  const matchingCollectionConfig = pluginOptions.collections.find((config) => {
    if (isCollectionOrGlobalConfigObject(config) && config.slug === slug) {
      if (typeof config.condition !== 'undefined') {
        return config.condition({ doc });
      }
      return true;
    }
    if (isCollectionOrGlobalConfigSlug(config)) {
      return config === slug;
    }
    return false;
  });

  if (typeof matchingCollectionConfig !== 'undefined') {
    return true;
  }

  return false;
};
