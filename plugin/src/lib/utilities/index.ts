import type { CollectionConfig, Field, GlobalConfig } from 'payload';
import deepEqual from 'deep-equal';
import { FieldWithName, type CrowdinHtmlObject } from '../types.js';
import {
  buildHtmlObject,
  buildJsonObject,
  buildUpdateObject,
  containsLocalizedFields as getDocumentContainsLocalizedFields,
  getCollapsibleLocalizedFields as getDocumentCollapsibleLocalizedFields,
  getLocalizedFields as getDocumentLocalizedFields,
  getRowLocalizedFields as getDocumentRowLocalizedFields,
  isLocalizedField as isDocumentLocalizedField,
  reLocalizeField as isDocumentReLocalizeField,
  type IsLocalized,
} from 'payload-localized-fields';

export {
  containsNestedFields,
  convertTabs,
  findField,
  getBlockFields,
  getFieldSlugs,
  restoreOrder,
  traverseFields,
} from 'payload-localized-fields';
export type { FieldTraversalVisitor } from 'payload-localized-fields';
export type { IsLocalized } from 'payload-localized-fields';

import { get } from 'es-toolkit/compat';

const excludeBasedOnConfig = (field: Field) => {
  const description = `${get(field, 'admin.description', '')}`;
  if (description.includes('Not sent to Crowdin. Localize in the CMS.')) {
    return true;
  }
  const custom = get(field, 'custom.crowdinSync.disable', false);
  if (custom) {
    return true;
  }
  return false;
};

/**
 * Crowdin's default localized-field check: Payload localization plus
 * plugin exclude rules (admin description / custom.crowdinSync.disable).
 */
export const isLocalizedField = (field: Field, localizedParent = false) =>
  isDocumentLocalizedField(field, localizedParent) &&
  !excludeBasedOnConfig(field);

export const reLocalizeField = (field: Field) =>
  isDocumentReLocalizeField(field) && !excludeBasedOnConfig(field);

export const fieldCrowdinFileType = (field: FieldWithName): 'json' | 'html' =>
  field.type === 'richText' ? 'html' : 'json';

const includeFromCrowdinType = (type?: 'json' | 'html') =>
  type
    ? (field: Field) => fieldCrowdinFileType(field as FieldWithName) === type
    : undefined;

type CrowdinLocalizedFieldsOptions = {
  fields: Field[];
  type?: 'json' | 'html';
  include?: (field: Field) => boolean;
  localizedParent?: boolean;
  isLocalized?: IsLocalized;
};

const crowdinLocalizedFieldOptions = ({
  type,
  include,
  isLocalized,
  ...rest
}: CrowdinLocalizedFieldsOptions) => ({
  ...rest,
  include: include ?? includeFromCrowdinType(type),
  isLocalized: isLocalized ?? isLocalizedField,
});

export const getLocalizedFields = (options: CrowdinLocalizedFieldsOptions) =>
  getDocumentLocalizedFields(crowdinLocalizedFieldOptions(options));

export const getCollapsibleLocalizedFields = (
  options: CrowdinLocalizedFieldsOptions,
) => getDocumentCollapsibleLocalizedFields(crowdinLocalizedFieldOptions(options));

export const getRowLocalizedFields = (options: CrowdinLocalizedFieldsOptions) =>
  getDocumentRowLocalizedFields(crowdinLocalizedFieldOptions(options));

export const getLocalizedRequiredFields = (
  collection: CollectionConfig | GlobalConfig,
  type?: 'json' | 'html',
): any[] =>
  getLocalizedFields({ fields: collection.fields, type }).filter(
    (field) => field.required,
  );

export const containsLocalizedFields = (
  options: CrowdinLocalizedFieldsOptions,
): boolean =>
  getDocumentContainsLocalizedFields(crowdinLocalizedFieldOptions(options));

export const fieldChanged = (
  previousValue: string | object | undefined,
  value: string | object | undefined,
  type: string,
) => {
  if (type === 'richText') {
    return !deepEqual(previousValue || {}, value || {});
  }
  return previousValue !== value;
};

export const removeLineBreaks = (string: string) =>
  string.replace(/(\r\n|\n|\r)/gm, '');

/**
 * Convert Crowdin objects to Payload CMS data objects.
 *
 * * `crowdinJsonObject` is the JSON object returned from Crowdin.
 * * `crowdinHtmlObject` is the HTML object returned from Crowdin. Optional. Merged into resulting object if provided.
 * * `fields` is the collection or global fields array.
 * * `topLevel` is a flag used internally to filter json fields before recursion.
 * * `document` is the document object. Optional. Used to restore the order of `array` and `blocks` field values.
 */
export const buildPayloadUpdateObject = ({
  crowdinJsonObject,
  crowdinHtmlObject,
  fields,
  topLevel = true,
  document,
  isLocalized,
}: {
  crowdinJsonObject: { [key: string]: any };
  crowdinHtmlObject?: CrowdinHtmlObject;
  /** Use getLocalizedFields to pass localized fields only */
  fields: Field[];
  /** Flag used internally to filter json fields before recursion. */
  topLevel?: boolean;
  document?: { [key: string]: any };
  isLocalized?: IsLocalized;
}) =>
  buildUpdateObject({
    jsonObject: crowdinJsonObject,
    htmlObject: crowdinHtmlObject,
    fields,
    topLevel,
    document,
    isLocalized: isLocalized ?? isLocalizedField,
  });

export const buildCrowdinJsonObject = ({
  doc,
  fields,
  topLevel = true,
  isLocalized,
}: {
  doc: { [key: string]: any };
  /** Use getLocalizedFields to pass localized fields only */
  fields: Field[];
  /** Flag used internally to filter json fields before recursion. */
  topLevel?: boolean;
  isLocalized?: IsLocalized;
}) =>
  buildJsonObject({
    doc,
    fields,
    topLevel,
    isLocalized: isLocalized ?? isLocalizedField,
  });

export const buildCrowdinHtmlObject = ({
  doc,
  fields,
  prefix = '',
  topLevel = true,
  isLocalized,
}: {
  doc: { [key: string]: any };
  /** Use getLocalizedFields to pass localized fields only */
  fields: Field[];
  /** Use to build dot notation field during recursion. */
  prefix?: string;
  /** Flag used internally to filter html fields before recursion. */
  topLevel?: boolean;
  isLocalized?: IsLocalized;
}) =>
  buildHtmlObject({
    doc,
    fields,
    prefix,
    topLevel,
    isLocalized: isLocalized ?? isLocalizedField,
  });
