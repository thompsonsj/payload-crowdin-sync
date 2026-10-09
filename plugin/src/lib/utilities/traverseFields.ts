import type { ArrayField, BlocksField, Field, GroupField } from 'payload';
import type { FieldWithName } from '../types';

/**
 * Fields for a blocks item, looked up by `blockType`.
 */
export const getBlockFields = (
  field: BlocksField,
  blockType: string,
): Field[] =>
  field.blocks.find((block) => block.slug === blockType)?.fields ?? [];

export type FieldTraversalVisitor<C> = {
  skip?: (field: FieldWithName, context: C) => boolean;
  group: (field: GroupField & { name: string }, context: C) => void;
  array: (field: ArrayField, context: C) => void;
  blocks: (field: BlocksField, context: C) => void;
  leaf: (field: FieldWithName, context: C) => void;
};

/**
 * Walk named fields and dispatch to a visitor by type.
 *
 * Callers filter fields first (`getLocalizedFields`). Nested walks are the
 * visitor's job: filter subfields, then call `traverseFields` again (usually
 * via the parent builder).
 */
export const traverseFields = <C>(
  fields: Field[],
  context: C,
  visitor: FieldTraversalVisitor<C>,
): void => {
  for (const field of fields) {
    if (!('name' in field)) {
      continue;
    }
    const named = field as FieldWithName;
    if (visitor.skip?.(named, context)) {
      continue;
    }
    if (field.type === 'group') {
      visitor.group(field, context);
    } else if (field.type === 'array') {
      visitor.array(field, context);
    } else if (field.type === 'blocks') {
      visitor.blocks(field, context);
    } else {
      visitor.leaf(named, context);
    }
  }
};
