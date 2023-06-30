import { CollectionAfterChangeHook, CollectionConfig, Field, GlobalConfig, GlobalAfterChangeHook, PayloadRequest } from 'payload/types';
import { CrowdinPluginRequest, PluginOptions } from '../../types'
import { findOrCreateArticleDirectory, payloadCreateCrowdInFile, payloadUpdateCrowdInFile, getCrowdinFile } from '../../api/payload'
import { buildCrowdinHtmlObject, buildCrowdinJsonObject, convertSlateToHtml, fieldChanged } from '../../utilities'
import deepEqual from 'deep-equal'

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
  projectId: number,
  directoryId: number
  localizedFields: Field[],
  pluginOptions: PluginOptions,
}

interface Args extends CommonArgs {
  collection: CollectionConfig
}

interface GlobalArgs extends CommonArgs {
  global: GlobalConfig
}

export const getGlobalAfterChangeHook = ({
  projectId,
  directoryId,
  global,
  localizedFields,
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
    projectId,
    directoryId,
    collection: global,
    localizedFields,
    global: true,
    pluginOptions,
  })
}

export const getAfterChangeHook = ({
  projectId,
  directoryId,
  collection,
  localizedFields,
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
    projectId,
    directoryId,
    collection,
    localizedFields,
    pluginOptions,
  })
}

interface IPerformChange {
  doc: any,
  req: PayloadRequest
  previousDoc: any
  operation: string
  projectId: number
  directoryId: number
  collection: CollectionConfig | GlobalConfig
  localizedFields: Field[]
  global?: boolean
  pluginOptions: PluginOptions,
}

const performAfterChange = async ({
  doc, // full document data
  req, // full express request
  previousDoc,
  operation,
  projectId,
  directoryId,
  collection,
  localizedFields,
  global = false,
  pluginOptions,
}: IPerformChange) => {
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
   * Retrieve the CrowdIn Article Directory article
   * 
   * Records of CrowdIn directories are stored in Payload.
   * Check for CrowdIn article details in Payload, create
   * a CrowdIn directory for this article if it does not
   * exist.
   */
  const articleDirectory = await findOrCreateArticleDirectory({
    document: doc,
    projectId: projectId,
    directoryId: directoryId,
    collectionSlug: collection.slug,
    payload: req.payload,
    crowdin: pluginOptions.client,
    global,
  })

  // START: function definitions
  const createFile = async ({
    name,
    value,
    type
  }: {name: string, value: string | object, type: 'html' | 'json'}) => {
    const file = await payloadCreateCrowdInFile({
      name: name,
      value: value,
      fileType: type,
      projectId: projectId,
      directoryId: directoryId,
      collectionSlug: collection.slug,
      articleDirectory: articleDirectory,
      payload: req.payload,
      crowdin: pluginOptions.client,
    })
  }

  const createJsonFile = async () => {
      await createFile({
        name: 'fields',
        value: currentCrowdinJsonData,
        type: 'json'
      })
  }

  const createHtmlFile = async ({
    name,
    value
  }: {name: string, value: string}) => {
    await createFile({
      name: name,
      value: value,
      type: 'html'
    })
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
      const crowdinFile = await getCrowdinFile(name, articleDirectory.id, req.payload)
      const currentValue = currentCrowdinHtmlData[name]
      const prevValue = prevCrowdinHtmlData[name]
      if (!fieldChanged(prevValue, currentValue, 'richText') && process.env.PAYLOAD_CROWDIN_SYNC_ALWAYS_UPDATE  !== 'true') {
        return
      }
      if (typeof crowdinFile === 'undefined') {
        await createHtmlFile({
          name,
          value: convertSlateToHtml(currentValue),
        })
      } else {
        const file = await payloadUpdateCrowdInFile({
          id: crowdinFile.id,
          fileId: crowdinFile.originalId,
          name,
          value: convertSlateToHtml(currentValue),
          fileType: 'html',
          projectId: projectId,
          payload: req.payload,
          crowdin: pluginOptions.client
        })
      }
    })
  }
  // END: function definitions

  // the 'create' operation is run separately from 'update' - without
  // this separation, there is a risk of duplicated CrowdIn files
  // as the asynchronous operations will run twice almost instantaneously
  // on create.
  if (operation === 'create') {
    if ((!deepEqual(currentCrowdinJsonData, prevCrowdinJsonData) && Object.keys(currentCrowdinJsonData).length !== 0) || process.env.PAYLOAD_CROWDIN_SYNC_ALWAYS_UPDATE === 'true') {
      await createJsonFile()
    }
    await createOrUpdateHtmlSource()
  }

  // for all localized fields, ensure there is a CrowdIn file,
  // and update if necessary
  if (operation === 'update') {
    const crowdinJsonFile = await getCrowdinFile('fields', articleDirectory.id, req.payload)
    if (!deepEqual(currentCrowdinJsonData, prevCrowdinJsonData) || process.env.PAYLOAD_CROWDIN_SYNC_ALWAYS_UPDATE === 'true') {
      if (typeof crowdinJsonFile === 'undefined') {
        await createJsonFile()
      } else {
        const file = await payloadUpdateCrowdInFile({
          id: crowdinJsonFile.id,
          fileId: crowdinJsonFile.originalId,
          name: 'fields',
          value: currentCrowdinJsonData,
          fileType: 'json',
          projectId: projectId,
          payload: req.payload,
          crowdin: pluginOptions.client
        })
      }
    }

    await createOrUpdateHtmlSource()
  }

  return doc
}
