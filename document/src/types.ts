import type { Field } from 'payload';

export type FieldWithName = Field & { name: string };

export type IsLocalized = (field: Field, localizedParent?: boolean) => boolean;

/** Rich-text values keyed by dotted path (`items.<id>.body`). */
export type HtmlObject = { [key: string]: string | object | undefined };
