import type { CollectionConfig, Field, GlobalConfig } from 'payload';
import deepEqual from 'deep-equal';
import { FieldWithName, type CrowdinHtmlObject } from '../types';
import {
  containsLocalizedFields as getDocumentContainsLocalizedFields,
  getBlockFields,
  getCollapsibleLocalizedFields as getDocumentCollapsibleLocalizedFields,
  getLocalizedFields as getDocumentLocalizedFields,
  getRowLocalizedFields as getDocumentRowLocalizedFields,
  isLocalizedField as isDocumentLocalizedField,
  reLocalizeField as isDocumentReLocalizeField,
  restoreOrder,
  traverseFields,
  type IsLocalized,
} from '../document';

export {
  containsNestedFields,
  convertTabs,
  findField,
  getBlockFields,
  getFieldSlugs,
  restoreOrder,
  traverseFields,
} from '../document';
export type { FieldTraversalVisitor } from '../document';
export type { IsLocalized } from '../document';

import { merge, omitBy } from 'es-toolkit';
import { get, isEmpty, map } from 'es-toolkit/compat';
import dot from 'dot-object';

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
 * Skip empty values, and array/blocks fields that are not arrays.
 *
 * `restoreVersion` passes `previousDoc` with `locale: 'all'`, so a
 * localized array or blocks field is a locale map (`{ en: [...], de_DE:
 * [...] }`) rather than an array. Calling `.map` on that throws (#186).
 */
const skipCrowdinBuilderField = (
  field: FieldWithName,
  doc: { [key: string]: any },
): boolean => {
  const value = doc[field.name];
  if (!value) {
    return true;
  }
  if (
    (field.type === 'array' || field.type === 'blocks') &&
    !Array.isArray(value)
  ) {
    return true;
  }
  return false;
};

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
}) => {
  let response: { [key: string]: any } = {};
  if (crowdinHtmlObject) {
    const destructured = dot.object(crowdinHtmlObject) as {
      [key: string]: any;
    };

    merge(crowdinJsonObject, destructured);
  }
  const filteredFields = getLocalizedFields({
    fields,
    type: topLevel ? (!crowdinHtmlObject ? 'json' : undefined) : undefined,
    isLocalized: topLevel ? isLocalized : (field) => !!field,
  });
  traverseFields(
    filteredFields,
    { crowdinJsonObject, response },
    {
      skip: (field, ctx) => !ctx.crowdinJsonObject[field.name],
      group(field, ctx) {
        ctx.response[field.name] = buildPayloadUpdateObject({
          crowdinJsonObject: ctx.crowdinJsonObject[field.name],
          fields: field.fields,
          topLevel: false,
        });
      },
      array(field, ctx) {
        ctx.response[field.name] = map(
          ctx.crowdinJsonObject[field.name],
          (item, id) => {
            const payloadUpdateObject = buildPayloadUpdateObject({
              crowdinJsonObject: item,
              fields: field.fields,
              topLevel: false,
            });
            return {
              ...payloadUpdateObject,
              id,
            };
          },
        ).filter((item: any) => !isEmpty(item));
      },
      blocks(field, ctx) {
        ctx.response[field.name] = map(
          ctx.crowdinJsonObject[field.name],
          (item, id) => {
            const blockType = Object.keys(item)[0];
            const payloadUpdateObject = buildPayloadUpdateObject({
              crowdinJsonObject: item[blockType],
              fields: getBlockFields(field, blockType),
              topLevel: false,
            });
            return {
              ...payloadUpdateObject,
              id,
              blockType,
            };
          },
        ).filter((item: any) => !isEmpty(item));
      },
      leaf(field, ctx) {
        ctx.response[field.name] = ctx.crowdinJsonObject[field.name];
      },
    },
  );
  if (document) {
    response = restoreOrder({
      updateDocument: response,
      document,
      fields,
    });
  }
  return omitBy(response, isEmpty);
};

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
}) => {
  const response: { [key: string]: any } = {};

  const filteredFields = getLocalizedFields({
    fields,
    type: 'json',
    // localization check not needed after `topLevel`, but still need to filter field type.
    isLocalized: topLevel ? isLocalized : (field) => !!field,
  });
  traverseFields(
    filteredFields,
    { doc, response, isLocalized },
    {
      skip: (field, ctx) => skipCrowdinBuilderField(field, ctx.doc),
      group(field, ctx) {
        ctx.response[field.name] = buildCrowdinJsonObject({
          doc: ctx.doc[field.name],
          fields: field.fields,
          topLevel: false,
          isLocalized: ctx.isLocalized,
        });
      },
      array(field, ctx) {
        ctx.response[field.name] = ctx.doc[field.name]
          .map((item: any) => {
            const crowdinJsonObject = buildCrowdinJsonObject({
              doc: item,
              fields: field.fields,
              topLevel: false,
              isLocalized: ctx.isLocalized,
            });
            if (!isEmpty(crowdinJsonObject)) {
              return {
                [item.id]: crowdinJsonObject,
              };
            }
            return;
          })
          .filter((item: any) => !isEmpty(item))
          .reduce((acc: object, item: any) => ({ ...acc, ...item }), {});
      },
      blocks(field, ctx) {
        ctx.response[field.name] = ctx.doc[field.name]
          .map((item: any) => {
            const crowdinJsonObject = buildCrowdinJsonObject({
              doc: item,
              fields: getBlockFields(field, item.blockType),
              topLevel: false,
              isLocalized: ctx.isLocalized,
            });
            if (!isEmpty(crowdinJsonObject)) {
              return {
                [item.id]: {
                  [item.blockType]: crowdinJsonObject,
                },
              };
            }
            return;
          })
          .filter((item: any) => !isEmpty(item))
          .reduce((acc: object, item: any) => ({ ...acc, ...item }), {});
      },
      leaf(field, ctx) {
        ctx.response[field.name] = ctx.doc[field.name];
      },
    },
  );
  return omitBy(response, isEmpty);
};

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
}) => {
  const response: CrowdinHtmlObject = {};
  // it is convenient to be able to pass all fields - filter in this case
  const filteredFields = getLocalizedFields({
    fields,
    type: 'html',
    // localization check not needed after `topLevel`, but still need to filter field type.
    isLocalized: topLevel ? isLocalized : (field) => !!field,
  });

  traverseFields(
    filteredFields,
    { doc, prefix, isLocalized, response },
    {
      skip: (field, ctx) => skipCrowdinBuilderField(field, ctx.doc),
      group(field, ctx) {
        const subPrefix = `${[ctx.prefix, field.name]
          .filter((string) => string)
          .join('.')}`;
        Object.assign(
          ctx.response,
          buildCrowdinHtmlObject({
            doc: ctx.doc[field.name],
            fields: field.fields,
            prefix: subPrefix,
            topLevel: false,
            isLocalized: ctx.isLocalized,
          }),
        );
      },
      array(field, ctx) {
        const arrayValues = ctx.doc[field.name].map((item: any) => {
          const subPrefix = `${[ctx.prefix, `${field.name}`, `${item.id}`]
            .filter((string) => string)
            .join('.')}`;
          return buildCrowdinHtmlObject({
            doc: item,
            fields: field.fields,
            prefix: subPrefix,
            topLevel: false,
            isLocalized: ctx.isLocalized,
          });
        });
        Object.assign(ctx.response, merge({}, Object.assign({}, ...arrayValues)));
      },
      blocks(field, ctx) {
        const arrayValues = ctx.doc[field.name].map((item: any) => {
          const subPrefix = `${[
            ctx.prefix,
            `${field.name}`,
            `${item.id}`,
            `${item.blockType}`,
          ]
            .filter((string) => string)
            .join('.')}`;
          return buildCrowdinHtmlObject({
            doc: item,
            fields: getBlockFields(field, item.blockType),
            prefix: subPrefix,
            topLevel: false,
            isLocalized: ctx.isLocalized,
          });
        });
        Object.assign(ctx.response, merge({}, Object.assign({}, ...arrayValues)));
      },
      leaf(field, ctx) {
        const name = [ctx.prefix, field.name]
          .filter((string) => string)
          .join('.');
        ctx.response[name] = ctx.doc[field.name];
      },
    },
  );
  return response;
};
