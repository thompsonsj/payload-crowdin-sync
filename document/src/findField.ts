import type { Block, Field } from 'payload';
import { fieldIsArrayType, fieldIsBlockType, fieldIsGroupType } from 'payload/shared';
import { getLocalizedFields } from './localizedFields';

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
      const nestedDotNotation = keys.slice(1).join(`.`);
      const search = findField({
        dotNotation: nestedDotNotation,
        fields: field.fields,
        firstIteration: false,
      });
      if (search) {
        return search;
      }
    }
    if (fieldIsArrayType(field) && keys.length > 2) {
      const nestedDotNotation = keys.slice(2).join(`.`);
      const search = findField({
        dotNotation: nestedDotNotation,
        fields: field.fields,
        firstIteration: false,
      });
      if (search) {
        return search;
      }
    }
    if (fieldIsBlockType(field) && keys.length > 3) {
      const nestedDotNotation = keys.slice(3).join(`.`);
      const blockType = keys[2];
      const block = field.blocks.find(
        (field: Block) => field.slug === blockType,
      );
      if (block) {
        const search = findField({
          dotNotation: nestedDotNotation,
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
