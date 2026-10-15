import type { Field } from 'payload';
import { buildPayloadUpdateObject } from '../../utilities';
import type { DocumentSlice } from './types';

/**
 * Turn a vendor-neutral document slice into a Payload update.
 */
export const applyDocumentSlice = ({
  slice,
  fields,
  document,
}: {
  slice: DocumentSlice;
  fields: Field[];
  document?: { [key: string]: any };
}) =>
  buildPayloadUpdateObject({
    crowdinJsonObject: slice.json,
    crowdinHtmlObject: slice.html,
    fields,
    document,
  });
