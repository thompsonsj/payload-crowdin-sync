import {
  Credentials,
  CrowdinError,
  Translations,
} from "@crowdin/crowdin-api-client";
import { Payload } from "payload";
import { CrowdinHtmlObject, PluginOptions } from "../types";
import deepEqual from "deep-equal";
import type {
  BlocksField as BlockField,
  CollectionConfig,
  CollectionSlug,
  Field,
  GlobalConfig,
  GlobalSlug,
  PayloadRequest,
  RichTextField,
} from "payload";
import {
  getLocalizedFields,
  getFieldSlugs,
  buildCrowdinJsonObject,
  buildCrowdinHtmlObject,
  buildPayloadUpdateObject,
  getLocalizedRequiredFields,
  findField,
} from "../utilities";
import {
  convertHtmlToLexical,
  convertHtmlToSlate
} from '../utilities/richTextConversion'

import { Config, CrowdinFile } from "../payload-types";
import { getCollectionConfig, getFile, getFileByDocumentID, getFiles, getFilesByDocumentID, getLexicalFieldArticleDirectory } from "./helpers";
import { getLexicalBlockFields, getLexicalEditorConfig } from "../utilities/lexical";
import { getRelationshipId } from "../utilities/payload";
import { merge } from "es-toolkit";
import { isEmpty } from 'es-toolkit/compat';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const crowdin = require('@crowdin/crowdin-api-client');

interface IgetLatestDocumentTranslation {
  collection: string;
  doc: any;
  locale: string;
  global?: boolean;
}

interface IgetCurrentDocumentTranslation {
  doc: any;
  collection: string;
  locale: string;
  global?: boolean;
}

interface IgetTranslation {
  documentId: string;
  fieldName: string;
  locale: string;
  global?: boolean;
  collection?: CollectionConfig | GlobalConfig;
  /** Pass crowdinArticleDirectoryId to retrieve `crowdin-files` documents with a parent (i.e. Lexical field blocks) */
  crowdinArticleDirectoryId?: string;
  fields?: Field[]
}

interface IupdateTranslation {
  documentId: string;
  collection: string;
  dryRun?: boolean;
  global?: boolean;
  excludeLocales?: string[];
  draft?: boolean;
}

export class payloadCrowdinSyncTranslationsApi {
  translationsApi: Translations;
  projectId: number;
  directoryId?: number;
  payload: Payload;
  req?: PayloadRequest;
  localeMap: PluginOptions["localeMap"];
  sourceLocale: PluginOptions["sourceLocale"];
  htmlToSlateConfig: PluginOptions["htmlToSlateConfig"];
  lexicalBlockFolderPrefix: PluginOptions["lexicalBlockFolderPrefix"];
  disableSelfClean?: PluginOptions["disableSelfClean"];

  constructor(pluginOptions: PluginOptions, payload: Payload, req?: PayloadRequest) {
    // credentials
    const credentials: Credentials = {
      token: pluginOptions.token,
      organization: pluginOptions.organization,
    };
    const { translationsApi } = new crowdin.default(credentials);
    this.projectId = pluginOptions.projectId;
    this.directoryId = pluginOptions.directoryId;
    this.translationsApi = translationsApi;
    this.payload = payload;
    this.req = req;
    this.localeMap = pluginOptions.localeMap;
    this.sourceLocale = pluginOptions.sourceLocale;
    this.htmlToSlateConfig = pluginOptions.htmlToSlateConfig
    this.disableSelfClean = pluginOptions.disableSelfClean
    this.lexicalBlockFolderPrefix = pluginOptions.lexicalBlockFolderPrefix || ``
  }

  async updateTranslation({
    documentId,
    collection,
    dryRun = true,
    global = false,
    draft = false,
    excludeLocales = [],
  }: IupdateTranslation) {
    /**
     * Get existing document
     *
     * * check document exists
     * * check for `meta` field (which can be added by @payloadcms/seo)
     *
     */
    let doc;
    if (global) {
      doc = await this.payload.findGlobal({
        slug: collection as GlobalSlug,
        locale: this.sourceLocale,
        req: this.req,
      });
    } else {
      doc = await this.payload.findByID({
        collection: collection as CollectionSlug,
        id: documentId,
        locale: this.sourceLocale,
        req: this.req,
      });
    }
    const report: { [key: string]: any } = {};
    for (const locale of Object.keys(this.localeMap)) {
      if (excludeLocales.includes(locale)) {
        continue;
      }
      report[locale] = {};
      report[locale].draft = draft,
      report[locale].currentTranslations =
        await this.getCurrentDocumentTranslation({
          doc: doc,
          collection: collection,
          locale: locale,
          global,
        });
      report[locale].latestTranslations =
        await this.getLatestDocumentTranslation({
          collection: collection,
          doc: doc,
          locale: locale,
          global,
        });
      report[locale].changed = !deepEqual(
        report[locale].currentTranslations,
        report[locale].latestTranslations
      );
      if (report[locale].changed && !dryRun) {
        if (global) {
          try {
            await this.payload.updateGlobal({
              slug: collection as keyof Config["globals"],
              locale: locale,
              draft,
              data: {
                ...report[locale].latestTranslations,
                // error on update without the following line.
                // see https://github.com/thompsonsj/payload-crowdin-sync/pull/13/files#r1209271660
                crowdinArticleDirectory: ((doc as any)["crowdinArticleDirectory"]).id,
              },
              req: this.req,
            });
          } catch (error) {
            console.log(
              'updateTranslation',
              {
                documentId,
                collection,
                dryRun,
                global,
                draft,
                excludeLocales,
              },
              'error',
              error
            );
          }
        } else {
          try {
            await this.payload.update({
              collection: collection  as keyof Config["collections"],
              locale: locale,
              id: documentId,
              draft,
              data: report[locale].latestTranslations,
              req: this.req,
            });
          } catch (error) {
            console.log(
              'updateTranslation',
              {
                documentId,
                collection,
                dryRun,
                global,
                draft,
                excludeLocales,
              },
              'error',
              error
            );
          }
        }
      }
    }
    return {
      source: doc,
      translations: { ...report },
    };
  }

  getCollectionConfig(
    collection: string,
    global: boolean
  ): CollectionConfig | GlobalConfig {
    
    return getCollectionConfig(
      collection,
      global,
      this.payload,
    );
  }

  async getCurrentDocumentTranslation({
    doc,
    collection,
    locale,
    global = false,
  }: IgetCurrentDocumentTranslation) {
    // get document
    let document: any;
    if (global) {
      document = await this.payload.findGlobal({
        slug: collection as keyof Config["globals"],
        locale: locale,
        req: this.req,
      });
    } else {
      document = await this.payload.findByID({
        collection: collection as keyof Config["collections"],
        id: doc.id,
        locale: locale,
        req: this.req,
      });
    }

    const collectionConfig = this.getCollectionConfig(collection, global);

    const localizedFields = getLocalizedFields({
      fields: collectionConfig.fields,
    });

    // build crowdin json object
    const crowdinJsonObject = buildCrowdinJsonObject({
      doc: document,
      fields: localizedFields,
    });
    const crowdinHtmlObject = buildCrowdinHtmlObject({
      doc: document,
      fields: localizedFields,
    });
    try {
      const docTranslations = buildPayloadUpdateObject({
        crowdinJsonObject,
        crowdinHtmlObject,
        fields: localizedFields,
        document,
      });
      return docTranslations;
    } catch (error) {
      console.log(
        'getCurrentDocumentTranslation',
        {
          doc,
          collection,
          locale,
          global,
        },
        'error',
        error
      );
      throw new Error(`${error}`);
    }
  }

  /**
   * Retrieve translations from Crowdin for a document in a given locale
   */
  async getLatestDocumentTranslation({
    collection,
    doc,
    locale,
    global = false,
  }: IgetLatestDocumentTranslation) {
    const collectionConfig = this.getCollectionConfig(collection, global);

    const localizedFields = getLocalizedFields({
      fields: collectionConfig.fields,
    });

    if (!localizedFields) {
      return { message: "no localized fields" };
    }

    let docTranslations: { [key: string]: any } = {};
    // add json fields
    const crowdinJsonObject =
      (await this.getTranslation({
        documentId: global ? collectionConfig.slug : doc.id,
        fieldName: "fields",
        locale: locale,
      })) || {};
    if (process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE) {
      console.log('getLatestDocumentTranslation: crowdinJsonObject', crowdinJsonObject)
    }
    // add html fields
    const localizedHtmlFields = await this.getHtmlFieldSlugs(
      global ? collectionConfig.slug : doc.id
    );
    const crowdinHtmlObject: CrowdinHtmlObject = {};
    for (const field of localizedHtmlFields) {
      // need to get the field definiton here somehow?
      crowdinHtmlObject[field] = await this.getTranslation({
        documentId: global ? collectionConfig.slug : doc.id,
        fieldName: field,
        locale: locale,
        collection: collectionConfig,
      });
    }
    if (process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE) {
      console.log('getLatestDocumentTranslation: crowdinHtmlObject', JSON.stringify(crowdinHtmlObject))
    }
    docTranslations = buildPayloadUpdateObject({
      crowdinJsonObject,
      crowdinHtmlObject,
      fields: localizedFields,
      document: doc,
    });

    // Add required fields if not present
    const requiredFieldSlugs = getFieldSlugs(
      getLocalizedRequiredFields(collectionConfig)
    );
    if (requiredFieldSlugs.length > 0) {
      const currentTranslations = await this.getCurrentDocumentTranslation({
        doc: doc,
        collection: collection,
        locale: locale,
        global,
      });
      requiredFieldSlugs.forEach((slug) => {
        if (!Object.prototype.hasOwnProperty.call(docTranslations, slug)) {
          docTranslations[slug] = currentTranslations[slug];
        }
      });
    }
    return docTranslations;
  }

  async getHtmlFieldSlugs(documentId: string): Promise<string[]> {
    const files = await getFilesByDocumentID({documentId, payload: this.payload, req: this.req});
    const slugs = files
    .filter((file) => file.type === "html")
    .map((file) => `${file.field}`)
    return slugs;
  }

  async getHtmlFieldSlugsByArticleDirectory(parentCrowdinArticleDirectoryId?: string): Promise<string[]> {
    const files = await getFiles(`${parentCrowdinArticleDirectoryId}`, this.payload, this.req) as CrowdinFile[];
    const slugs = files
    .filter((file) => file.type === "html")
    .map((file) => `${file.field}`)
    return slugs;
  }

  /**
   * Retrieve translations for a document field name
   *
   * * returns Slate object for html fields
   * * returns all json fields if fieldName is 'fields'
   */
  // TODO refactor out fields override - replace `collection` with `fields`
  async getTranslation({ documentId, fieldName, locale, collection, crowdinArticleDirectoryId, fields }: IgetTranslation) {
    const file = (typeof crowdinArticleDirectoryId === 'string' ? await getFile(fieldName, crowdinArticleDirectoryId, this.payload) : await getFileByDocumentID(fieldName, `${documentId}`, this.payload, this.req)) as CrowdinFile;
    // it is possible a file doesn't exist yet - e.g. an article with localized text fields that contains an empty html field.
    if (!file) {
      return;
    }
    try {
      const response = await this.buildTranslationFile({
        file,
        locale
      })
      if (!response) {
        return
      }
      const data = await this.getFileDataFromUrl(response.data.url);
      if (file.type === "html") {
        const allFields = collection ? collection.fields : fields
        if (allFields) {
          const field = findField({
            dotNotation: fieldName,
            fields: allFields,
            // do not filter out localized fields if lexical block fields
            filterLocalizedFields:!(crowdinArticleDirectoryId),
          }) as RichTextField
          const editorConfig = getLexicalEditorConfig(field)
          // isLexical?
          if (editorConfig) {
            // retrieve the article directory created for this lexical block
            const lexicalFieldCrowdinArticleDirectory = await getLexicalFieldArticleDirectory({
              payload: this.payload,
              parent: file.crowdinArticleDirectory,
              name: `${this.lexicalBlockFolderPrefix}${fieldName}`,
              req: this.req,
            })
            const lexicalFieldCrowdinArticleDirectoryId = getRelationshipId(lexicalFieldCrowdinArticleDirectory as any)

            // get translations here and pass it to convertHtmlToLexical
            // easier than passing `payload` and `pluginOptions` to create a new instance of the class we are in right now - keep convertHtmlToLexical focussed.
            const blockConfig = getLexicalBlockFields(editorConfig)

            const blockTranslations = blockConfig && lexicalFieldCrowdinArticleDirectoryId ? await this.getBlockTranslations({
              blockConfig,
              file,
              locale,
              crowdinArticleDirectoryId: lexicalFieldCrowdinArticleDirectoryId,
            }) : null

            return convertHtmlToLexical(data, editorConfig, blockTranslations) || {
              "root": {
                  "type": "root",
                  "format": "",
                  "indent": 0,
                  "version": 1,
                  "children": [
                      {
                          "children": [
                              {
                                  "detail": 0,
                                  "format": 0,
                                  "mode": "normal",
                                  "style": "",
                                  "text": "lexical configuration not found",
                                  "type": "text",
                                  "version": 1
                              }
                          ],
                          "direction": "ltr",
                          "format": "",
                          "indent": 0,
                          "type": "quote",
                          "version": 1
                      }
                  ],
                  "direction": "ltr"
              }
            }
          }
        }
        return convertHtmlToSlate(data, this.htmlToSlateConfig)
      } else {
        return JSON.parse(data);
      }
    } catch (error) {
      console.log(
        'getTranslation',
        {
          documentId,
          fieldName,
          locale,
          collection: collection?.slug,
          crowdinArticleDirectoryId,
          fields
        },
        'error',
        error
      );
    }
  }

  private async buildTranslationFile({
    file,
    locale
  }: {
    file: CrowdinFile,
    locale: string
  }) {
    try {
      const response = await this.translationsApi.buildProjectFileTranslation(
        this.projectId,
        file.originalId as number,
        {
          targetLanguageId: this.localeMap[locale].crowdinId,
        }
      );
      return response
    }
    catch (error: unknown) {
      if (this.disableSelfClean) {
        return undefined
      }
      if (error instanceof CrowdinError && error.code === 404) {
        await this.payload.delete({
          id: file.id,
          collection: "crowdin-files",
          req: this.req,
        })
      }
      return undefined
    }
  }

  private async getBlockTranslations({
    blockConfig,
    locale,
    file,
    crowdinArticleDirectoryId,
  }: {
    blockConfig: BlockField | undefined,
    file: CrowdinFile,
    locale: string,
    crowdinArticleDirectoryId: string,
  }) {
    // link with plugin/src/lib/api/files/document.ts - store as variable?
    const fieldName = `blocks`
    // find a way to `getTranslation` or getPayloadTranslation` for the subfolder.
    // add ability to pass `fields` and `crowdinArticleDirectory` to `getTranslation`. That will do it.
    if (!blockConfig) {
      return
    }
    const fields: Field[] = [
      blockConfig,
    ]
    let docTranslations: { [key: string]: any } = {};
    // add json fields
    const crowdinJsonObject =
      (await this.getTranslation({
        // field name in dot notation is the 'id' for getTranslation
        documentId: fieldName,
        fieldName: "blocks",
        locale: locale,
        crowdinArticleDirectoryId,
      })) || {};
    // add html fields
    const localizedHtmlFields = await this.getHtmlFieldSlugsByArticleDirectory(crowdinArticleDirectoryId);
    const crowdinHtmlObject: CrowdinHtmlObject = {};
    for (const field of localizedHtmlFields) {
      // need to get the field definition here somehow?
      crowdinHtmlObject[field] = await this.getTranslation({
        documentId: field,
        fieldName: field,
        locale: locale,
        fields,
        crowdinArticleDirectoryId,
      });
    }

    docTranslations = buildPayloadUpdateObject({
      crowdinJsonObject,
      crowdinHtmlObject,
      fields,
      isLocalized: (field) => !!(field),
    });

    // merge non-localized fields back in
    if (!isEmpty(file.fileData?.sourceBlocks)) {
      const sourceBlocks = JSON.parse(`${file.fileData?.sourceBlocks}`) || []

      // build a source translation crowdinJsonObject
      const sourceCrowdinJsonObject = buildCrowdinJsonObject({
        doc: {
          blocks: sourceBlocks,
        },
        fields,
        isLocalized: (field) => !!(field),
      })
      // convert source translation crowdinJsonObject to payloadUpdateObject
      // we are only interested in merging back json fields - otherwise html fields will deep merge creating hybrid rich text content containing both translations
      // this is why a 'sourceCrowdinHtmlObject' is not built
      const sourcePayloadUpdateObject = buildPayloadUpdateObject({
        crowdinJsonObject: sourceCrowdinJsonObject,
        fields,
        isLocalized: (field) => !!(field),
      })

      return merge(sourcePayloadUpdateObject, docTranslations)
    }

    return docTranslations
  }

  private async getFileDataFromUrl(url: string) {
    const response = await fetch(url);
    const body = await response.text();
    return body;
  }

  /**
   * Restore id and blockType to translations
   *
   * In order to update a document, we need to know the id and blockType of each block.
   *
   * Ideally, id and blockType are not sent to Crowdin - hence
   * we need to restore them from the original document.
   *
   * This currently only works for a top-level `layout` blocks field.
   *
   * TODO: make this work for nested blocks.
   */
  restoreIdAndBlockType = (
    document: any,
    translations: any,
    key = "layout"
  ) => {
    if (Object.prototype.hasOwnProperty.call(translations, key)) {
      translations[key] = translations[key].map(
        (block: any, index: number) => ({
          ...block,
          id: document[key][index].id,
          blockType: document[key][index].blockType,
        })
      );
    }
    return translations;
  };
}
