import type { ArrayField, BlocksField, Field } from 'payload';
import { isEmpty } from 'es-toolkit/compat';
import { getLocalizedFields } from './localizedFields';
import { getBlockFields, traverseFields } from './traverseFields';

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
  // gets an appropriate updateDocument structure: flattens collapsible/tab fields
  const filteredFields = getLocalizedFields({
    fields,
    isLocalized: (field) => !!field,
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
