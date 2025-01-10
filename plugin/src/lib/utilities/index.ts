import type {
  Block,
  CollapsibleField,
  CollectionConfig,
  Field,
  GlobalConfig,
} from "payload";
import deepEqual from "deep-equal";
import { FieldWithName, type CrowdinHtmlObject } from "../types";

import {  merge, omitBy } from "es-toolkit";
import { get, isEmpty, map } from 'es-toolkit/compat'
import dot from "dot-object";

const localizedFieldTypes = ["richText", "text", "textarea"];

const nestedFieldTypes = ["array", "group", "blocks"];

type IsLocalized = (field: Field, localizedParent?: boolean) => boolean

export const containsNestedFields = (field: Field) =>
  nestedFieldTypes.includes(field.type);

export const findField = ({
  dotNotation,
  fields,
  firstIteration = true,
  filterLocalizedFields = true,
}: {
  dotNotation: string
  fields: Field[]
  firstIteration?: boolean,
  filterLocalizedFields?: boolean,
}): Field | undefined => {
  const localizedFields = getLocalizedFields({
    fields,
    isLocalized: (firstIteration && filterLocalizedFields) ? undefined : (field) => !!(field),
  })
  const keys = dotNotation.split(`.`)
  if (keys.length === 0) {
    return undefined
  }
  for (const field of localizedFields) {
    if (field.type === 'group' && keys.length > 1) {
      const dotNotation = keys.slice(1).join(`.`)
      const search = findField({
        dotNotation,
        fields: field.fields,
        firstIteration: false,
      })
      if (search) {
        return search
      }
    }
    if (field.type === 'array' && keys.length > 2) {
      const dotNotation = keys.slice(2).join(`.`)
      const search = findField({
        dotNotation,
        fields: field.fields,
        firstIteration: false,
      })
      if (search) {
        return search
      }
    }
    if (field.type === 'blocks' && keys.length > 3) {
      const dotNotation = keys.slice(3).join(`.`)
      const blockType = keys[2]
      // find the block definition
      const block = field.blocks.find((field: Block) => field.slug === blockType)
      if (block) {
        const search = findField({
          dotNotation,
          fields: block.fields,
          firstIteration: false,
        })
        if (search) {
          return search
        }
      }
    }
    if (field.name === keys[0]) {
      return field
    }
  }
  return undefined
}

export const getLocalizedFields = ({
  fields,
  type,
  localizedParent = false,
  isLocalized = isLocalizedField,
}: {
  fields: Field[];
  type?: "json" | "html";
  localizedParent?: boolean;
  isLocalized?: IsLocalized
}): any[] => [
  ...fields
    // localized or group fields only.
    .filter(
      (field) =>
        isLocalized(field, localizedParent) || containsNestedFields(field)
    )
    // further filter on Crowdin field type
    .filter((field) => {
      if (containsNestedFields(field)) {
        return true;
      }
      return type
        ? fieldCrowdinFileType(field as FieldWithName) === type
        : true;
    })
    // exclude group, array and block fields with no localized fields
    // TODO: find a better way to do this - block, array and group logic is duplicated, and this filter needs to be compatible with field extraction logic later in this function
    .filter((field) => {
      const localizedParent = hasLocalizedProp(field);
      if (field.type === "group" || field.type === "array") {
        return containsLocalizedFields({
          fields: field.fields,
          type,
          localizedParent,
          isLocalized,
        });
      }
      if (field.type === "blocks") {
        return field.blocks.find((block) =>
          containsLocalizedFields({
            fields: block.fields,
            type,
            localizedParent,
            isLocalized,
          })
        );
      }
      return true;
    })
    // recursion for group, array and blocks field
    .map((field) => {
      const localizedParent = hasLocalizedProp(field);
      if (field.type === "group" || field.type === "array") {
        return {
          ...field,
          fields: getLocalizedFields({
            fields: field.fields,
            type,
            localizedParent,
            isLocalized,
          }),
        };
      }
      if (field.type === "blocks") {
        const blocks = field.blocks
          .map((block: Block) => {
            if (
              containsLocalizedFields({
                fields: block.fields,
                type,
                localizedParent,
                isLocalized,
              })
            ) {
              return {
                slug: block.slug,
                fields: getLocalizedFields({
                  fields: block.fields,
                  type,
                  localizedParent,
                  isLocalized,
                }),
              };
            }
            return
          })
          .filter((block) => block);
        return {
          ...field,
          blocks,
        };
      }
      return field;
    })
    .filter(
      (field) =>
        (field as any).type !== "collapsible" && (field as any).type !== "tabs"
    ),
  ...convertTabs({
    fields,
    callback: (fields) => getLocalizedFields({
      fields,
      type,
      isLocalized,
    })
  }),
  // recursion for collapsible field - flatten results into the returned array
  ...getCollapsibleLocalizedFields({ fields, type, isLocalized }),
];

export const getCollapsibleLocalizedFields = ({
  fields,
  type,
  isLocalized = isLocalizedField,
}: {
  fields: Field[];
  type?: "json" | "html";
  isLocalized?: IsLocalized;
}): any[] =>
  fields
    .filter((field) => field.type === "collapsible")
    .flatMap((field) =>
      getLocalizedFields({
        fields: (field as CollapsibleField).fields,
        type,
        isLocalized,
      })
    );

export const convertTabs = ({
  fields,
  callback,
}: {
  fields: Field[];
  callback: (fields: Field[]) => Field[]
}): Field[] =>
  fields
    .filter((field) => field.type === "tabs")
    .flatMap((field) => {
      if (field.type === "tabs") {
        const flattenedFields = field.tabs.reduce((tabFields, tab) => {
          return [
            ...tabFields,
            "name" in tab
              ? ({
                  type: "group",
                  name: tab.name,
                  fields: tab.fields,
                } as Field)
              : ({
                  label: "fromTab",
                  type: "collapsible",
                  fields: tab.fields,
                } as Field),
          ];
        }, [] as Field[]);
        return callback(flattenedFields);
      }
      return field;
    });

export const getLocalizedRequiredFields = (
  collection: CollectionConfig | GlobalConfig,
  type?: "json" | "html"
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
      (field: Field) => field.type === "text" || field.type === "richText"
    )
    .map((field: FieldWithName) => field.name);

const hasLocalizedProp = (field: Field) =>
  "localized" in field && field.localized;

/**
 * Is Localized Field
 *
 * Note that `id` should be excluded - it is a `text` field that is added by Payload CMS.
 */
export const isLocalizedField = (
  field: Field,
  addLocalizedProp = false
) =>
  (hasLocalizedProp(field) || addLocalizedProp) &&
  localizedFieldTypes.includes(field.type) &&
  !excludeBasedOnDescription(field) &&
  (field as FieldWithName).name !== "id";

/**
 * Re-localize Field
 *
 * Is Localized Field - for non-localized field collections. e.g.
 * fields within blocks nested in a localized Lexical rich text block.
 */
export const reLocalizeField = (
  field: Field,
) => localizedFieldTypes.includes(field.type) &&
  !excludeBasedOnDescription(field) &&
  (field as FieldWithName).name !== "id";

const excludeBasedOnDescription = (field: Field) => {
  const description = `${get(field, "admin.description", "")}`;
  if (description.includes("Not sent to Crowdin. Localize in the CMS.")) {
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
  type?: "json" | "html";
  localizedParent?: boolean;
  isLocalized?: IsLocalized;
}): boolean => {
  return !isEmpty(getLocalizedFields({ fields, type, localizedParent, isLocalized }));
};

export const fieldChanged = (
  previousValue: string | object | undefined,
  value: string | object | undefined,
  type: string
) => {
  if (type === "richText") {
    return !deepEqual(previousValue || {}, value || {});
  }
  return previousValue !== value;
};

export const removeLineBreaks = (string: string) =>
  string.replace(/(\r\n|\n|\r)/gm, "");

export const fieldCrowdinFileType = (field: FieldWithName): "json" | "html" =>
  field.type === "richText" ? "html" : "json";

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
  let response: { [key: string]: any } = {};
  // it is possible the original document is empty (e.g. new document)
  if (!document) {
    return updateDocument;
  }
  // use getLocalizedFields with no type or localization check
  // gets an appropriate updateDocument structure: flattens collapsible/tag fields
  fields = getLocalizedFields({
    fields,
    isLocalized: (fields) => !!(fields)
  })
  fields.forEach((field: any) => {
    if (!updateDocument || !updateDocument[field.name]) {
      return;
    }
    if (field.type === "group") {
      response[field.name] = restoreOrder({
        updateDocument: updateDocument[field.name],
        document: document[field.name],
        fields: field.fields,
      });
    } else if (field.type === "array" || field.type === "blocks") {
      response[field.name] = document[field.name]
        .map((item: any) => {
          const arrayItem = updateDocument[field.name].find(
            (updateItem: any) => {
              return updateItem.id === item.id;
            }
          );
          if (!arrayItem) {
            return {
              id: item.id,
              ...(field.type === "blocks" && { blockType: item.blockType }),
            };
          }
          const subFields =
            field.type === "blocks"
              ? field.blocks.find(
                  (block: Block) => block.slug === item.blockType
                )?.fields || []
              : field.fields;
          return {
            ...restoreOrder({
              updateDocument: arrayItem,
              document: item,
              fields: subFields,
            }),
            id: arrayItem.id,
            ...(field.type === "blocks" && { blockType: arrayItem.blockType }),
          };
        })
        .filter((item: any) => !isEmpty(item));
    } else {
      response[field.name] = updateDocument[field.name];
    }
  });
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
    const destructured = dot.object(crowdinHtmlObject) as {[key: string]: any };

    merge(crowdinJsonObject, destructured);
  }
  const filteredFields = getLocalizedFields({
    fields,
    type: topLevel ? (!crowdinHtmlObject ? "json" : undefined) : undefined,
    isLocalized: topLevel ? isLocalized : (field) => !!(field)
  });
  filteredFields.forEach((field) => {
    if (!crowdinJsonObject[field.name]) {
      return;
    }
    if (field.type === "group") {
      response[field.name] = buildPayloadUpdateObject({
        crowdinJsonObject: crowdinJsonObject[field.name],
        fields: field.fields,
        topLevel: false,
      });
    } else if (field.type === "array") {
      response[field.name] = map(crowdinJsonObject[field.name], (item, id) => {
        const payloadUpdateObject = buildPayloadUpdateObject({
          crowdinJsonObject: item,
          fields: field.fields,
          topLevel: false,
        });
        return {
          ...payloadUpdateObject,
          id,
        };
      }).filter((item: any) => !isEmpty(item));
    } else if (field.type === "blocks") {
      response[field.name] = map(crowdinJsonObject[field.name], (item, id) => {
        // get first and only object key
        const blockType = Object.keys(item)[0];
        const payloadUpdateObject = buildPayloadUpdateObject({
          crowdinJsonObject: item[blockType], 
          fields:
            field.blocks.find((block: Block) => block.slug === blockType)
              ?.fields || [],
          topLevel: false,
        });
        return {
          ...payloadUpdateObject,
          id,
          blockType,
        };
      }).filter((item: any) => !isEmpty(item));
    } else {
      response[field.name] = crowdinJsonObject[field.name];
    }
  });
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
  let response: { [key: string]: any } = {};
  
  const filteredFields = getLocalizedFields({
    fields,
    type: "json",
    // localization check not needed after `topLevel`, but still need to filter field type.
    isLocalized: topLevel ? isLocalized : (field) => !!(field),
  });
  filteredFields.forEach((field) => {
    if (!doc[field.name]) {
      return;
    }
    if (field.type === "group") {
      response[field.name] = buildCrowdinJsonObject({
        doc: doc[field.name],
        fields: field.fields,
        topLevel: false,
        isLocalized,
      });
    } else if (field.type === "array") {
      response[field.name] = doc[field.name]
        .map((item: any) => {
          const crowdinJsonObject = buildCrowdinJsonObject({
            doc: item,
            fields: field.fields,
            topLevel: false,
            isLocalized,
          });
          if (!isEmpty(crowdinJsonObject)) {
            return {
              [item.id]: crowdinJsonObject,
            };
          }
          return
        })
        .filter((item: any) => !isEmpty(item))
        .reduce((acc: object, item: any) => ({ ...acc, ...item }), {});
    } else if (field.type === "blocks") {
      response[field.name] = doc[field.name]
        .map((item: any) => {
          const crowdinJsonObject = buildCrowdinJsonObject({
            doc: item,
            fields:
              field.blocks.find((block: Block) => block.slug === item.blockType)
                ?.fields || [],
            topLevel: false,
            isLocalized,
          });
          if (!isEmpty(crowdinJsonObject)) {
            return {
              [item.id]: {
                [item.blockType]: crowdinJsonObject,
              },
            };
          }
          return
        })
        .filter((item: any) => !isEmpty(item))
        .reduce((acc: object, item: any) => ({ ...acc, ...item }), {});
    } else {
      response[field.name] = doc[field.name];
    }
  });
  return omitBy(response, isEmpty);
};

export const buildCrowdinHtmlObject = ({
  doc,
  fields,
  prefix = "",
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
  let response: CrowdinHtmlObject  = {};
  // it is convenient to be able to pass all fields - filter in this case
  const filteredFields = getLocalizedFields({
    fields,
    type: "html",
    // localization check not needed after `topLevel`, but still need to filter field type.
    isLocalized: topLevel ? isLocalized : (field) => !!(field),
  });

  filteredFields.forEach((field) => {
    const name = [prefix, (field as FieldWithName).name]
      .filter((string) => string)
      .join(".");
    if (!doc[field.name]) {
      return;
    }
    if (field.type === "group") {
      const subPrefix = `${[prefix, field.name]
        .filter((string) => string)
        .join(".")}`;
      response = {
        ...response,
        ...buildCrowdinHtmlObject({
          doc: doc[field.name],
          fields: field.fields,
          prefix: subPrefix,
          topLevel: false,
          isLocalized,
        }),
      };
    } else if (field.type === "array") {
      const arrayValues = doc[field.name].map((item: any, index: number) => {
        const subPrefix = `${[prefix, `${field.name}`, `${item.id}`]
          .filter((string) => string)
          .join(".")}`;
        return buildCrowdinHtmlObject({
          doc: item,
          fields: field.fields,
          prefix: subPrefix,
          topLevel: false,
          isLocalized,
        });
      });
      response = {
        ...response,
        ...merge({}, Object.assign({}, ...arrayValues)),
      };
    } else if (field.type === "blocks") {
      const arrayValues = doc[field.name].map((item: any, index: number) => {
        const subPrefix = `${[
          prefix,
          `${field.name}`,
          `${item.id}`,
          `${item.blockType}`,
        ]
          .filter((string) => string)
          .join(".")}`;
        return buildCrowdinHtmlObject({
          doc: item,
          fields:
            field.blocks.find((block: Block) => block.slug === item.blockType)
              ?.fields || [],
          prefix: subPrefix,
          topLevel: false,
          isLocalized,
        });
      });
      response = {
        ...response,
        ...merge({}, Object.assign({}, ...arrayValues)),
      };
    } else {
      response[name] = doc[field.name]
    }
  });
  return response;
};
