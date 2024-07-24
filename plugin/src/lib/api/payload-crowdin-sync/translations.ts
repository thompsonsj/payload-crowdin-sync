import crowdin, {
  Credentials,
  Translations,
} from "@crowdin/crowdin-api-client";
import { Payload } from "payload";
import { CrowdinHtmlObject, PluginOptions } from "../../types";
import deepEqual from "deep-equal";
import {
  CollectionConfig,
  GlobalConfig,
  RichTextField,
  SanitizedCollectionConfig,
  SanitizedGlobalConfig,
} from "payload/types";
import {
  getLocalizedFields,
  getFieldSlugs,
  buildCrowdinJsonObject,
  buildCrowdinHtmlObject,
  buildPayloadUpdateObject,
  getLocalizedRequiredFields,
  findField,
} from "../../utilities";
import {
  convertHtmlToLexical,
  convertHtmlToSlate
} from '../../utilities/richTextConversion'

import { Config } from "../../payload-types";
import { getFileByDocumentID, getFilesByDocumentID } from "../helpers";
import { getLexicalEditorConfig } from "../../utilities/lexical";

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
  localeMap: PluginOptions["localeMap"];
  sourceLocale: PluginOptions["sourceLocale"];
  htmlToSlateConfig: PluginOptions["htmlToSlateConfig"];

  constructor(pluginOptions: PluginOptions, payload: Payload) {
    // credentials
    const credentials: Credentials = {
      token: pluginOptions.token,
    };
    const { translationsApi } = new crowdin(credentials);
    this.projectId = pluginOptions.projectId;
    this.directoryId = pluginOptions.directoryId;
    this.translationsApi = translationsApi;
    this.payload = payload;
    this.localeMap = pluginOptions.localeMap;
    this.sourceLocale = pluginOptions.sourceLocale;
    this.htmlToSlateConfig = pluginOptions.htmlToSlateConfig
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
        slug: collection as keyof Config["globals"],
        locale: this.sourceLocale,
      });
    } else {
      doc = await this.payload.findByID({
        collection: collection as keyof Config["collections"],
        id: documentId,
        locale: this.sourceLocale,
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
            });
          } catch (error) {
            console.log(error);
          }
        } else {
          try {
            await this.payload.update({
              collection: collection  as keyof Config["collections"],
              locale: locale,
              id: documentId,
              draft,
              data: report[locale].latestTranslations,
            });
          } catch (error) {
            console.log(error);
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
    let collectionConfig:
      | SanitizedGlobalConfig
      | SanitizedCollectionConfig
      | undefined;
    if (global) {
      collectionConfig = this.payload.config.globals.find(
        (col: GlobalConfig) => col.slug === collection
      );
    } else {
      collectionConfig = this.payload.config.collections.find(
        (col: CollectionConfig) => col.slug === collection
      );
    }
    if (!collectionConfig)
      throw new Error(`Collection ${collection} not found in payload config`);
    return collectionConfig;
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
      });
    } else {
      document = await this.payload.findByID({
        collection: collection as keyof Config["collections"],
        id: doc.id,
        locale: locale,
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
      console.log(error);
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
        if (!docTranslations.hasOwnProperty(slug)) {
          docTranslations[slug] = currentTranslations[slug];
        }
      });
    }
    return docTranslations;
  }

  async getHtmlFieldSlugs(documentId: string): Promise<string[]> {
    const files = await getFilesByDocumentID(documentId, this.payload);
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
  async getTranslation({ documentId, fieldName, locale, collection }: IgetTranslation) {
    const file = await getFileByDocumentID(fieldName, `${documentId}`, this.payload);
    // it is possible a file doesn't exist yet - e.g. an article with localized text fields that contains an empty html field.
    if (!file) {
      return;
    }
    try {
      const response = await this.translationsApi.buildProjectFileTranslation(
        this.projectId,
        file.originalId as number,
        {
          targetLanguageId: this.localeMap[locale].crowdinId,
        }
      );
      const data = await this.getFileDataFromUrl(response.data.url);
      if (file.type === "html") {
        if (collection) {
          const field = findField({
            dotNotation: fieldName,
            fields: collection.fields
          }) as RichTextField
          const editorConfig = getLexicalEditorConfig(field)
          // isLexical?
          if (editorConfig) {
            return convertHtmlToLexical(data, editorConfig) || {
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
      console.log(error);
    }
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
    key: string = "layout"
  ) => {
    if (translations.hasOwnProperty(key)) {
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
