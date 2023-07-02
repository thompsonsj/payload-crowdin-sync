import { CollectionAfterChangeHook, CollectionConfig, Field, GlobalConfig, GlobalAfterChangeHook, PayloadRequest } from 'payload/types';
import { Descendant } from 'slate'
import { PluginOptions } from '../../types'
import { buildCrowdinHtmlObject, buildCrowdinJsonObject, convertSlateToHtml, fieldChanged } from '../../utilities'
import deepEqual from 'deep-equal'
import { getLocalizedFields } from '../../utilities'
import { payloadCrowdInSyncFilesApi } from '../../api/payload-crowdin-sync/files';

/**
 * Update CrowdIn collections and make updates in CrowdIn
 * 
 * This functionality used to be split into field hooks.
 * However, it is more reliable to loop through localized
 * fields and perform opeerations in one place. The
 * asynchronous nature of operations means that
 * we need to be careful updates are not made sooner than
 * expected.
 */

interface CommonArgs {
  pluginOptions: PluginOptions,
}

interface Args extends CommonArgs {
  collection: CollectionConfig
}

interface GlobalArgs extends CommonArgs {
  global: GlobalConfig
}

export const getGlobalAfterChangeHook = ({
  global,
  pluginOptions,
}: GlobalArgs): GlobalAfterChangeHook => async ({
  doc, // full document data
  previousDoc, // document data before updating the collection
  req, // full express request
}) => {
  const operation = previousDoc ? 'update' : 'create'
  return performAfterChange({
    doc,
    req,
    previousDoc,
    operation,
    collection: global,
    global: true,
    pluginOptions,
  })
}

export const getAfterChangeHook = ({
  collection,
  pluginOptions,
}: Args): CollectionAfterChangeHook=> async ({
  doc, // full document data
  req, // full express request
  previousDoc, // document data before updating the collection
  operation, // name of the operation ie. 'create', 'update'
}) => {
  return performAfterChange({
    doc,
    req,
    previousDoc,
    operation,
    collection,
    pluginOptions,
  })
}

interface IPerformChange {
  doc: any,
  req: PayloadRequest
  previousDoc: any
  operation: string
  collection: CollectionConfig | GlobalConfig
  global?: boolean
  pluginOptions: PluginOptions,
}

const performAfterChange = async ({
  doc, // full document data
  req, // full express request
  previousDoc,
  operation,
  collection,
  global = false,
  pluginOptions,
}: IPerformChange) => {
  /**
   * Abort if token not set and not in test mode
   */
  if (!pluginOptions.token && process.env.NODE_ENV !== 'test') {
    return doc
  }

  const localizedFields: Field[] = getLocalizedFields({fields: collection.fields})

  /**
   * Abort if there are no fields to localize
   */
  if (localizedFields.length === 0) {
    return doc
  }

  /**
   * Abort if locale is unavailable or this
   * is an update from the API to the source
   * locale.
   */
  if (!req.locale || req.locale !== 'en') {
    return doc
  }

  /**
   * Prepare JSON objects
   * 
   * `text` fields are compiled into a single JSON file
   * on CrowdIn. Prepare previous and current objects.
   */
  const currentCrowdinJsonData = buildCrowdinJsonObject({doc, fields: localizedFields})
  const prevCrowdinJsonData = buildCrowdinJsonObject({doc: previousDoc, fields: localizedFields})

  /**
   * Initialize CrowdIn client sourceFilesApi
   */
  const filesApi = new payloadCrowdInSyncFilesApi(
    pluginOptions,
    req.payload,
  )

  /**
   * Retrieve the CrowdIn Article Directory article
   * 
   * Records of CrowdIn directories are stored in Payload.
   */
  const articleDirectory = await filesApi.findOrCreateArticleDirectory({
    document: doc,
    collectionSlug: collection.slug,
    global,
  })

  // START: function definitions
  const createOrUpdateJsonFile = async () => {
    await filesApi.createOrUpdateFile({
      name: 'fields',
      value: currentCrowdinJsonData,
      fileType: 'json',
      articleDirectory,
    })
  }

  const createOrUpdateHtmlFile = async ({
    name,
    value,
  }: {name: string, value: Descendant[]}) => {
    await filesApi.createOrUpdateFile({
      name: name,
      value: convertSlateToHtml(value),
      fileType: 'html',
      articleDirectory,
    })
  }

  const createOrUpdateJsonSource = async () => {
    if ((!deepEqual(currentCrowdinJsonData, prevCrowdinJsonData) && Object.keys(currentCrowdinJsonData).length !== 0) || process.env.PAYLOAD_CROWDIN_SYNC_ALWAYS_UPDATE === 'true') {
      await createOrUpdateJsonFile()
    }
  }

  /**
   * Recursively send rich text fields to CrowdIn as HTML
   * 
   * Name these HTML files with dot notation. Examples:
   * 
   * * `localizedRichTextField`
   * * `groupField.localizedRichTextField`
   * * `arrayField[0].localizedRichTextField`
   * * `arrayField[1].localizedRichTextField`
   */
  const createOrUpdateHtmlSource = async () => {
    const currentCrowdinHtmlData = buildCrowdinHtmlObject({
      doc,
      fields: localizedFields,
    })
    const prevCrowdinHtmlData = buildCrowdinHtmlObject({
      doc: previousDoc,
      fields: localizedFields,
    })
    Object.keys(currentCrowdinHtmlData).forEach(async name => {
      const currentValue = currentCrowdinHtmlData[name]
      const prevValue = prevCrowdinHtmlData[name]
      if (!fieldChanged(prevValue, currentValue, 'richText') && process.env.PAYLOAD_CROWDIN_SYNC_ALWAYS_UPDATE  !== 'true') {
        return
      }
      const file = await createOrUpdateHtmlFile({
        name,
        value: currentValue as Descendant[],
      })
    })
  }
  // END: function definitions

  // the 'create' operation is run separately from 'update' - without
  // this separation, there is a risk of duplicated CrowdIn files
  // as the asynchronous operations will run twice almost instantaneously
  // on create.
  if (operation === 'create') {
    await createOrUpdateJsonSource()
    await createOrUpdateHtmlSource()
  }

  if (operation === 'update') {
    await createOrUpdateJsonSource()
    await createOrUpdateHtmlSource()
  }

  return doc
}
