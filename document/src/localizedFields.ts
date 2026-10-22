import type {
  ArrayField,
  Block,
  CollectionConfig,
  CollapsibleField,
  Field,
  GlobalConfig,
  GroupField,
  RowField,
} from 'payload';
import {
  fieldIsArrayType,
  fieldIsBlockType,
  fieldIsGroupType,
  tabHasName,
} from 'payload/shared';
import { isEmpty } from 'es-toolkit/compat';
import { containsNestedFields, isLocalizedField } from './isLocalizedField.js';
import type { FieldWithName, IsLocalized } from './types.js';

export { containsNestedFields };

const isNestedDataField = (field: Field): field is GroupField | ArrayField =>
  fieldIsGroupType(field) || fieldIsArrayType(field);

interface LocalizedFieldsOptions {
  include?: (field: Field) => boolean;
  localizedParent: boolean;
  isLocalized: IsLocalized;
}

const layoutFieldTypes = ['collapsible', 'tabs', 'row'];

/**
 * Group, array and blocks fields are kept here and dropped later by
 * `recurseNestedFields` if they contain no matching fields.
 */
const matchesInclude = (field: Field, include?: (field: Field) => boolean) =>
  containsNestedFields(field) || !include || include(field);

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
  if (isNestedDataField(field)) {
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
    isLocalized: options.isLocalized,
    callback: (tabFields) =>
      getLocalizedFields({ ...options, fields: tabFields }),
  }),
  ...getCollapsibleLocalizedFields({ ...options, fields }),
  ...getRowLocalizedFields({ ...options, fields }),
];

export const getLocalizedFields = ({
  fields,
  include,
  localizedParent = false,
  isLocalized = isLocalizedField,
}: {
  fields: Field[];
  include?: (field: Field) => boolean;
  localizedParent?: boolean;
  isLocalized?: IsLocalized;
}): any[] => {
  const options = { include, localizedParent, isLocalized };
  return [
    ...fields
      .filter(
        (field) =>
          !layoutFieldTypes.includes(field.type) &&
          (isLocalized(field, localizedParent) ||
            containsNestedFields(field)) &&
          matchesInclude(field, include),
      )
      .flatMap((field) => recurseNestedFields(field, options) ?? []),
    ...flattenContainerFields(fields, options),
  ];
};

export const getCollapsibleLocalizedFields = ({
  fields,
  include,
  localizedParent = false,
  isLocalized = isLocalizedField,
}: {
  fields: Field[];
  include?: (field: Field) => boolean;
  localizedParent?: boolean;
  isLocalized?: IsLocalized;
}): any[] =>
  getLocalizedFieldsByType({
    fields,
    containerType: 'collapsible',
    include,
    localizedParent,
    isLocalized,
  });

export const getRowLocalizedFields = ({
  fields,
  include,
  localizedParent = false,
  isLocalized = isLocalizedField,
}: {
  fields: Field[];
  include?: (field: Field) => boolean;
  localizedParent?: boolean;
  isLocalized?: IsLocalized;
}): any[] =>
  getLocalizedFieldsByType({
    fields,
    containerType: 'row',
    include,
    localizedParent,
    isLocalized,
  });

const getLocalizedFieldsByType = ({
  fields,
  containerType,
  include,
  localizedParent = false,
  isLocalized = isLocalizedField,
}: {
  fields: Field[];
  containerType: 'collapsible' | 'row';
  include?: (field: Field) => boolean;
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
        include,
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
  include?: (field: Field) => boolean,
): any[] => {
  const fields = getLocalizedFields({ fields: collection.fields, include });
  return fields.filter((field) => field.required);
};

/**
 * Not yet compatible with nested fields — nested HTML field translations
 * cannot be synced from a flat slug list.
 */
export const getFieldSlugs = (fields: FieldWithName[]): string[] =>
  fields
    .filter(
      (field: Field) => field.type === 'text' || field.type === 'richText',
    )
    .map((field: FieldWithName) => field.name);

export const containsLocalizedFields = ({
  fields,
  include,
  localizedParent,
  isLocalized = isLocalizedField,
}: {
  fields: Field[];
  include?: (field: Field) => boolean;
  localizedParent?: boolean;
  isLocalized?: IsLocalized;
}): boolean =>
  !isEmpty(
    getLocalizedFields({ fields, include, localizedParent, isLocalized }),
  );
