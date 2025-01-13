import { Field, RichTextField } from "payload/types";

export const isRichTextField = (val: Field | string | undefined | null): val is RichTextField => {
  return val !== undefined && val !== null && typeof val !== 'string';
}
