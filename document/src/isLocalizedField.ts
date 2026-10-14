import type { Field } from 'payload';
import { fieldIsArrayType, fieldIsBlockType, fieldIsGroupType, fieldIsID, fieldShouldBeLocalized } from 'payload/shared';
import type { FieldWithName } from './types';

const localizedFieldTypes = ['richText', 'text', 'textarea'];

export const containsNestedFields = (field: Field): boolean =>
  fieldIsGroupType(field) || fieldIsArrayType(field) || fieldIsBlockType(field);

/**
 * Children inherit localization when a group, array, or blocks parent is
 * localized. Payload's fieldShouldBeLocalized uses the opposite rule for
 * database locale inheritance.
 */
const inheritsLocalization = (field: Field, localizedParent = false) =>
  localizedParent ||
  fieldShouldBeLocalized({ field, parentIsLocalized: localizedParent });

/**
 * Note that `id` should be excluded — it is a `text` field that is added by
 * Payload CMS. `blockName` should be excluded — it is a `text` field that is
 * added by Payload CMS and is not localized.
 */
export const isLocalizedField = (field: Field, localizedParent = false) =>
  inheritsLocalization(field, localizedParent) &&
  (localizedFieldTypes.includes(field.type) || containsNestedFields(field)) &&
  !fieldIsID(field) &&
  (field as FieldWithName).name !== 'blockName';

/**
 * Localized-field check for non-localized field collections, e.g. fields
 * within blocks nested in a localized Lexical rich text block.
 */
export const reLocalizeField = (field: Field) =>
  localizedFieldTypes.includes(field.type) && !fieldIsID(field);
