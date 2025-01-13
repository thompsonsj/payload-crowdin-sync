import type { Field } from 'payload';
import dot from 'dot-object';

export const delocalizeFields = (fields: Field[]): Field[] => {
  const delocalized = fields.map((field: Field) => {
    const dotFields = dot.dot(field);
    const dotKeysNoLocalized = Object.keys(dotFields)
      .filter(key => !key.endsWith('localized'))
      .reduce((obj: {[key: string]: any}, key) => {
        obj[key] = dotFields[key];
        return obj;
      }, {});
    return dot.object(dotKeysNoLocalized);
  })
  return delocalized as Field[];
}
