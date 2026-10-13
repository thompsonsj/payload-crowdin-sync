import type { Field } from 'payload';

export type FieldWithName = Field & { name: string };

export type IsLocalized = (field: Field, localizedParent?: boolean) => boolean;
