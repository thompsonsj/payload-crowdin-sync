import type { Field } from 'payload';
import {
  buildUpdateObject,
  type IsLocalized,
} from 'payload-localized-fields';
import type { DocumentSlice } from './types';

/**
 * Turn a vendor-neutral document slice into a Payload update.
 */
export const applyDocumentSlice = ({
  slice,
  fields,
  document,
  isLocalized,
}: {
  slice: DocumentSlice;
  fields: Field[];
  document?: { [key: string]: any };
  isLocalized?: IsLocalized;
}) =>
  buildUpdateObject({
    jsonObject: slice.json,
    htmlObject: slice.html,
    fields,
    document,
    isLocalized,
  });
