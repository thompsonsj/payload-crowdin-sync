import type { Field } from 'payload';
import { merge, omitBy } from 'es-toolkit';
import { isEmpty, map } from 'es-toolkit/compat';
import dot from 'dot-object';
import { getLocalizedFields } from './localizedFields';
import { getBlockFields, traverseFields } from './traverseFields';
import { restoreOrder } from './restoreOrder';
import type { FieldWithName, HtmlObject, IsLocalized } from './types';

export const isJsonField = (field: Field) => field.type !== 'richText';

export const isHtmlField = (field: Field) => field.type === 'richText';

/**
 * Skip empty values, and array/blocks that are not arrays.
 *
 * Payload `locale: 'all'` turns a localized array or blocks field into a
 * locale map (`{ en: [...], de_DE: [...] }`). Calling `.map` on that throws.
 */
const skipBuilderField = (
  field: FieldWithName,
  doc: { [key: string]: any },
): boolean => {
  const value = doc[field.name];
  if (!value) {
    return true;
  }
  if (
    (field.type === 'array' || field.type === 'blocks') &&
    !Array.isArray(value)
  ) {
    return true;
  }
  return false;
};

const nestedIsLocalized: IsLocalized = (field) => !!field;

export const buildJsonObject = ({
  doc,
  fields,
  topLevel = true,
  isLocalized,
}: {
  doc: { [key: string]: any };
  fields: Field[];
  topLevel?: boolean;
  isLocalized?: IsLocalized;
}) => {
  const response: { [key: string]: any } = {};
  const filteredFields = getLocalizedFields({
    fields,
    include: isJsonField,
    isLocalized: topLevel ? isLocalized : nestedIsLocalized,
  });
  traverseFields(
    filteredFields,
    { doc, response, isLocalized },
    {
      skip: (field, ctx) => skipBuilderField(field, ctx.doc),
      group(field, ctx) {
        ctx.response[field.name] = buildJsonObject({
          doc: ctx.doc[field.name],
          fields: field.fields,
          topLevel: false,
          isLocalized: ctx.isLocalized,
        });
      },
      array(field, ctx) {
        ctx.response[field.name] = ctx.doc[field.name]
          .map((item: any) => {
            const jsonObject = buildJsonObject({
              doc: item,
              fields: field.fields,
              topLevel: false,
              isLocalized: ctx.isLocalized,
            });
            if (!isEmpty(jsonObject)) {
              return {
                [item.id]: jsonObject,
              };
            }
            return;
          })
          .filter((item: any) => !isEmpty(item))
          .reduce((acc: object, item: any) => ({ ...acc, ...item }), {});
      },
      blocks(field, ctx) {
        ctx.response[field.name] = ctx.doc[field.name]
          .map((item: any) => {
            const jsonObject = buildJsonObject({
              doc: item,
              fields: getBlockFields(field, item.blockType),
              topLevel: false,
              isLocalized: ctx.isLocalized,
            });
            if (!isEmpty(jsonObject)) {
              return {
                [item.id]: {
                  [item.blockType]: jsonObject,
                },
              };
            }
            return;
          })
          .filter((item: any) => !isEmpty(item))
          .reduce((acc: object, item: any) => ({ ...acc, ...item }), {});
      },
      leaf(field, ctx) {
        ctx.response[field.name] = ctx.doc[field.name];
      },
    },
  );
  return omitBy(response, isEmpty);
};

export const buildHtmlObject = ({
  doc,
  fields,
  prefix = '',
  topLevel = true,
  isLocalized,
}: {
  doc: { [key: string]: any };
  fields: Field[];
  prefix?: string;
  topLevel?: boolean;
  isLocalized?: IsLocalized;
}): HtmlObject => {
  const response: HtmlObject = {};
  const filteredFields = getLocalizedFields({
    fields,
    include: isHtmlField,
    isLocalized: topLevel ? isLocalized : nestedIsLocalized,
  });

  traverseFields(
    filteredFields,
    { doc, prefix, isLocalized, response },
    {
      skip: (field, ctx) => skipBuilderField(field, ctx.doc),
      group(field, ctx) {
        const subPrefix = `${[ctx.prefix, field.name]
          .filter((string) => string)
          .join('.')}`;
        Object.assign(
          ctx.response,
          buildHtmlObject({
            doc: ctx.doc[field.name],
            fields: field.fields,
            prefix: subPrefix,
            topLevel: false,
            isLocalized: ctx.isLocalized,
          }),
        );
      },
      array(field, ctx) {
        const arrayValues = ctx.doc[field.name].map((item: any) => {
          const subPrefix = `${[ctx.prefix, `${field.name}`, `${item.id}`]
            .filter((string) => string)
            .join('.')}`;
          return buildHtmlObject({
            doc: item,
            fields: field.fields,
            prefix: subPrefix,
            topLevel: false,
            isLocalized: ctx.isLocalized,
          });
        });
        Object.assign(ctx.response, merge({}, Object.assign({}, ...arrayValues)));
      },
      blocks(field, ctx) {
        const arrayValues = ctx.doc[field.name].map((item: any) => {
          const subPrefix = `${[
            ctx.prefix,
            `${field.name}`,
            `${item.id}`,
            `${item.blockType}`,
          ]
            .filter((string) => string)
            .join('.')}`;
          return buildHtmlObject({
            doc: item,
            fields: getBlockFields(field, item.blockType),
            prefix: subPrefix,
            topLevel: false,
            isLocalized: ctx.isLocalized,
          });
        });
        Object.assign(ctx.response, merge({}, Object.assign({}, ...arrayValues)));
      },
      leaf(field, ctx) {
        const name = [ctx.prefix, field.name]
          .filter((string) => string)
          .join('.');
        ctx.response[name] = ctx.doc[field.name];
      },
    },
  );
  return response;
};

export const buildUpdateObject = ({
  jsonObject,
  htmlObject,
  fields,
  topLevel = true,
  document,
  isLocalized,
}: {
  jsonObject: { [key: string]: any };
  htmlObject?: HtmlObject;
  fields: Field[];
  topLevel?: boolean;
  document?: { [key: string]: any };
  isLocalized?: IsLocalized;
}) => {
  let response: { [key: string]: any } = {};
  let source = jsonObject;
  if (htmlObject) {
    const destructured = dot.object({ ...htmlObject }) as {
      [key: string]: any;
    };
    source = merge(structuredClone(jsonObject), destructured);
  }
  const filteredFields = getLocalizedFields({
    fields,
    include: topLevel ? (!htmlObject ? isJsonField : undefined) : undefined,
    isLocalized: topLevel ? isLocalized : nestedIsLocalized,
  });
  traverseFields(
    filteredFields,
    { jsonObject: source, response },
    {
      skip: (field, ctx) => !ctx.jsonObject[field.name],
      group(field, ctx) {
        ctx.response[field.name] = buildUpdateObject({
          jsonObject: ctx.jsonObject[field.name],
          fields: field.fields,
          topLevel: false,
        });
      },
      array(field, ctx) {
        ctx.response[field.name] = map(
          ctx.jsonObject[field.name],
          (item, id) => {
            const payloadUpdateObject = buildUpdateObject({
              jsonObject: item,
              fields: field.fields,
              topLevel: false,
            });
            return {
              ...payloadUpdateObject,
              id,
            };
          },
        ).filter((item: any) => !isEmpty(item));
      },
      blocks(field, ctx) {
        ctx.response[field.name] = map(
          ctx.jsonObject[field.name],
          (item, id) => {
            const blockType = Object.keys(item)[0];
            const payloadUpdateObject = buildUpdateObject({
              jsonObject: item[blockType],
              fields: getBlockFields(field, blockType),
              topLevel: false,
            });
            return {
              ...payloadUpdateObject,
              id,
              blockType,
            };
          },
        ).filter((item: any) => !isEmpty(item));
      },
      leaf(field, ctx) {
        ctx.response[field.name] = ctx.jsonObject[field.name];
      },
    },
  );
  if (document) {
    response = restoreOrder({
      updateDocument: response,
      document,
      fields,
    });
  }
  return omitBy(response, isEmpty);
};
