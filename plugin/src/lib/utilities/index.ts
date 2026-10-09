import type {
  ArrayField,
  Block,
  BlocksField,
  CollapsibleField,
  CollectionConfig,
  Field,
  GlobalConfig,
  GroupField,
  RowField
} from 'payload';
import {
  fieldIsArrayType,
  fieldIsBlockType,
  fieldIsGroupType,
  fieldIsID,
  fieldShouldBeLocalized,
  tabHasName,
} from 'payload/shared';
import deepEqual from 'deep-equal';
import { FieldWithName, type CrowdinHtmlObject } from '../types';
import { getBlockFields, traverseFields } from './traverseFields';

export { getBlockFields, traverseFields };
export type { FieldTraversalVisitor } from './traverseFields';

import { merge, omitBy } from 'es-toolkit';
import { get, isEmpty, map } from 'es-toolkit/compat';
import dot from 'dot-object';

const localizedFieldTypes = ['richText', 'text', 'textarea'];

type IsLocalized = (field: Field, localizedParent?: boolean) => boolean;

export const containsNestedFields = (field: Field): boolean =>
  fieldIsGroupType(field) || fieldIsArrayType(field) || fieldIsBlockType(field);

const isCrowdinNestedDataField = (
  field: Field,
): field is GroupField | ArrayField =>
  fieldIsGroupType(field) || fieldIsArrayType(field);

export const findField = ({
  dotNotation,
  fields,
  firstIteration = true,
  filterLocalizedFields = true,
}: {
  dotNotation: string;
  fields: Field[];
  firstIteration?: boolean;
  filterLocalizedFields?: boolean;
}): Field | undefined => {
  const localizedFields = getLocalizedFields({
    fields,
    isLocalized:
      firstIteration && filterLocalizedFields ? undefined : (field) => !!field,
  });
  const keys = dotNotation.split(`.`);
  if (keys.length === 0) {
    return undefined;
  }
  for (const field of localizedFields) {
    if (fieldIsGroupType(field) && keys.length > 1) {
      const dotNotation = keys.slice(1).join(`.`);
      const search = findField({
        dotNotation,
        fields: field.fields,
        firstIteration: false,
      });
      if (search) {
        return search;
      }
    }
    if (fieldIsArrayType(field) && keys.length > 2) {
      const dotNotation = keys.slice(2).join(`.`);
      const search = findField({
        dotNotation,
        fields: field.fields,
        firstIteration: false,
      });
      if (search) {
        return search;
      }
    }
    if (fieldIsBlockType(field) && keys.length > 3) {
      const dotNotation = keys.slice(3).join(`.`);
      const blockType = keys[2];
      // find the block definition
      const block = field.blocks.find(
        (field: Block) => field.slug === blockType,
      );
      if (block) {
        const search = findField({
          dotNotation,
          fields: block.fields,
          firstIteration: false,
        });
        if (search) {
          return search;
        }
      }
    }
    if (field.name === keys[0]) {
      return field;
    }
  }
  return undefined;
};

interface LocalizedFieldsOptions {
  type?: 'json' | 'html';
  localizedParent: boolean;
  isLocalized: IsLocalized;
}

const layoutFieldTypes = ['collapsible', 'tabs', 'row'];

/**
 * Group, array and blocks fields are kept here and dropped later by
 * `recurseNestedFields` if they contain no fields of the requested type.
 */
const filterByType = (field: Field, type?: 'json' | 'html') =>
  containsNestedFields(field) ||
  !type ||
  fieldCrowdinFileType(field as FieldWithName) === type;

/**
 * Reduce a group, array or blocks field to its localized fields, or return
 * `undefined` if none remain. Blocks keep only their `slug` and `fields`.
 */
const recurseNestedFields = (
  field: Field,
  options: LocalizedFieldsOptions,
): Field | undefined => {
  const nestedOptions = {
    ...options,
    localizedParent: options.localizedParent || options.isLocalized(field),
  };
  if (isCrowdinNestedDataField(field)) {
    const fields = getLocalizedFields({
      ...nestedOptions,
      fields: field.fields,
    });
    return fields.length > 0 ? { ...field, fields } : undefined;
  }
  if (fieldIsBlockType(field)) {
    const blocks = field.blocks.flatMap((block: Block) => {
      const fields = getLocalizedFields({
        ...nestedOptions,
        fields: block.fields,
      });
      return fields.length > 0 ? [{ slug: block.slug, fields }] : [];
    });
    return blocks.length > 0 ? { ...field, blocks } : undefined;
  }
  return field;
};

/**
 * Localized fields inside tabs, collapsible and row fields, in that order.
 * Named tabs become groups.
 */
const flattenContainerFields = (
  fields: Field[],
  options: LocalizedFieldsOptions,
): Field[] => [
  ...convertTabs({
    fields,
    localized: options.localizedParent,
    callback: (tabFields) =>
      getLocalizedFields({ ...options, fields: tabFields }),
  }),
  ...getCollapsibleLocalizedFields({ ...options, fields }),
  ...getRowLocalizedFields({ ...options, fields }),
];

export const getLocalizedFields = ({
  fields,
  type,
  localizedParent = false,
  isLocalized = isLocalizedField,
}: {
  fields: Field[];
  type?: 'json' | 'html';
  localizedParent?: boolean;
  isLocalized?: IsLocalized;
}): any[] => {
  const options = { type, localizedParent, isLocalized };
  return [
    ...fields
      .filter(
        (field) =>
          !layoutFieldTypes.includes(field.type) &&
          (isLocalized(field, localizedParent) ||
            containsNestedFields(field)) &&
          filterByType(field, type),
      )
      .flatMap((field) => recurseNestedFields(field, options) ?? []),
    ...flattenContainerFields(fields, options),
  ];
};

export const getCollapsibleLocalizedFields = ({
  fields,
  type,
  localizedParent = false,
  isLocalized = isLocalizedField,
}: {
  fields: Field[];
  type?: 'json' | 'html';
  localizedParent?: boolean;
  isLocalized?: IsLocalized;
}): any[] =>
  getLocalizedFieldsByType({
    fields,
    containerType: 'collapsible',
    type,
    localizedParent,
    isLocalized,
  });

export const getRowLocalizedFields = ({
  fields,
  type,
  localizedParent = false,
  isLocalized = isLocalizedField,
}: {
  fields: Field[];
  type?: 'json' | 'html';
  localizedParent?: boolean;
  isLocalized?: IsLocalized;
}): any[] =>
  getLocalizedFieldsByType({
    fields,
    containerType: 'row',
    type,
    localizedParent,
    isLocalized,
  });

const getLocalizedFieldsByType = ({
  fields,
  containerType,
  type,
  localizedParent = false,
  isLocalized = isLocalizedField,
}: {
  fields: Field[];
  containerType: 'collapsible' | 'row';
  type?: 'json' | 'html';
  localizedParent?: boolean;
  isLocalized?: IsLocalized;
}): any[] =>
  fields
    .filter((field) => field.type === containerType)
    .flatMap((field) =>
      getLocalizedFields({
        fields:
          containerType === 'collapsible'
            ? (field as CollapsibleField).fields
            : (field as RowField).fields,
        type,
        localizedParent,
        isLocalized,
      }),
    );

export const convertTabs = ({
  fields,
  callback,
  localized = false,
  isLocalized = isLocalizedField,
}: {
  fields: Field[];
  callback: (fields: Field[]) => Field[];
  localized?: boolean;
  isLocalized?: IsLocalized;
}): Field[] =>
  fields
    .filter((field) => field.type === 'tabs')
    .flatMap((field) => {
      if (field.type === 'tabs') {
        const flattenedFields = field.tabs.reduce((tabFields, tab) => {
          return [
            ...tabFields,
            tabHasName(tab)
              ? ({
                  type: 'group',
                  name: tab.name,
                  ...(localized && {
                    localized: true,
                  }),
                  fields: tab.fields,
                } as Field)
              : ({
                  label: 'fromTab',
                  type: 'collapsible',
                  fields: (tab.fields || []).map((tabField) => {
                    if (isLocalized(tabField, localized)) {
                      return {
                        ...tabField,
                        localized: true,
                      } as Field;
                    }
                    return tabField;
                  }),
                } as Field),
          ];
        }, [] as Field[]);
        return callback(flattenedFields);
      }
      return field;
    });

export const getLocalizedRequiredFields = (
  collection: CollectionConfig | GlobalConfig,
  type?: 'json' | 'html',
): any[] => {
  const fields = getLocalizedFields({ fields: collection.fields, type });
  return fields.filter((field) => field.required);
};

/**
 * Not yet compatible with nested fields - this means nested HTML
 * field translations cannot be synced from Crowdin.
 */
export const getFieldSlugs = (fields: FieldWithName[]): string[] =>
  fields
    .filter(
      (field: Field) => field.type === 'text' || field.type === 'richText',
    )
    .map((field: FieldWithName) => field.name);

/**
 * Crowdin treats children as syncable when a localized group/array/blocks parent
 * sets localizedParent, even if the child lacks localized: true. Payload's
 * fieldShouldBeLocalized uses the opposite rule for DB locale inheritance.
 */
const hasCrowdinLocalizationFlag = (
  field: Field,
  localizedParent = false,
) =>
  localizedParent ||
  fieldShouldBeLocalized({ field, parentIsLocalized: localizedParent });

/**
 * Is Localized Field
 *
 * Note that `id` should be excluded - it is a `text` field that is added by Payload CMS.
 * Note that `blockName` should be excluded - it is a `text` field that is added by Payload CMS and is not localized.
 */
export const isLocalizedField = (field: Field, localizedParent = false) =>
  hasCrowdinLocalizationFlag(field, localizedParent) &&
  (localizedFieldTypes.includes(field.type) || containsNestedFields(field)) &&
  !excludeBasedOnConfig(field) &&
  !fieldIsID(field) &&
  (field as FieldWithName).name !== 'blockName';

/**
 * Re-localize Field
 *
 * Is Localized Field - for non-localized field collections. e.g.
 * fields within blocks nested in a localized Lexical rich text block.
 */
export const reLocalizeField = (field: Field) =>
  localizedFieldTypes.includes(field.type) &&
  !excludeBasedOnConfig(field) &&
  !fieldIsID(field);

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

export const containsLocalizedFields = ({
  fields,
  type,
  localizedParent,
  isLocalized = isLocalizedField,
}: {
  fields: Field[];
  type?: 'json' | 'html';
  localizedParent?: boolean;
  isLocalized?: IsLocalized;
}): boolean => {
  return !isEmpty(
    getLocalizedFields({ fields, type, localizedParent, isLocalized }),
  );
};

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

export const fieldCrowdinFileType = (field: FieldWithName): 'json' | 'html' =>
  field.type === 'richText' ? 'html' : 'json';

type RestoreOrderContext = {
  updateDocument: { [key: string]: any };
  document: { [key: string]: any };
  response: { [key: string]: any };
};

const restoreCollectionItems = (
  field: ArrayField | BlocksField,
  ctx: RestoreOrderContext,
  isBlocks: boolean,
) => {
  ctx.response[field.name] = ctx.document[field.name]
    .map((item: any) => {
      const arrayItem = ctx.updateDocument[field.name].find(
        (updateItem: any) => {
          return updateItem.id === item.id;
        },
      );
      if (!arrayItem) {
        return {
          id: item.id,
          ...(isBlocks && { blockType: item.blockType }),
        };
      }
      const subFields = isBlocks
        ? getBlockFields(field as BlocksField, item.blockType)
        : (field as ArrayField).fields;
      return {
        ...restoreOrder({
          updateDocument: arrayItem,
          document: item,
          fields: subFields,
        }),
        id: arrayItem.id,
        ...(isBlocks && { blockType: arrayItem.blockType }),
      };
    })
    .filter((item: any) => !isEmpty(item));
};

/**
 * Reorder blocks and array values based on the order of the original document.
 */
export const restoreOrder = ({
  updateDocument,
  document,
  fields,
}: {
  updateDocument: { [key: string]: any };
  document: { [key: string]: any };
  fields: Field[];
}) => {
  const response: { [key: string]: any } = {};
  // it is possible the original document is empty (e.g. new document)
  if (!document) {
    return updateDocument;
  }
  // use getLocalizedFields with no type or localization check
  // gets an appropriate updateDocument structure: flattens collapsible/tag fields
  const filteredFields = getLocalizedFields({
    fields,
    isLocalized: (fields) => !!fields,
  });
  traverseFields(
    filteredFields,
    { updateDocument, document, response },
    {
      skip: (field, ctx) => !ctx.updateDocument || !ctx.updateDocument[field.name],
      group(field, ctx) {
        ctx.response[field.name] = restoreOrder({
          updateDocument: ctx.updateDocument[field.name],
          document: ctx.document[field.name],
          fields: field.fields,
        });
      },
      array(field, ctx) {
        restoreCollectionItems(field, ctx, false);
      },
      blocks(field, ctx) {
        restoreCollectionItems(field, ctx, true);
      },
      leaf(field, ctx) {
        ctx.response[field.name] = ctx.updateDocument[field.name];
      },
    },
  );
  return response;
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
      skip: (field, ctx) => !ctx.doc[field.name],
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
      skip: (field, ctx) => !ctx.doc[field.name],
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
