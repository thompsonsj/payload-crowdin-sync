import type { CollectionConfig, Field, GlobalConfig } from 'payload';
import deepEqual from 'deep-equal';
import {
  buildHtmlObject,
  buildJsonObject,
  type IsLocalized,
} from 'payload-localized-fields';
import type { SourceWriter } from './types.js';

const richTextChanged = (
  previousValue: unknown,
  currentValue: unknown,
) => !deepEqual(previousValue || {}, currentValue || {});

const throwIfAnyRejected = (
  results: PromiseSettledResult<unknown>[],
  message: string,
) => {
  const reasons = results
    .filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    )
    .map((result) => result.reason);
  if (reasons.length === 1) {
    throw reasons[0];
  }
  if (reasons.length > 1) {
    throw new AggregateError(reasons, message);
  }
};

export const syncDocumentSource = async ({
  writer,
  collection,
  fields,
  doc,
  previousDoc,
  alwaysUpdate = false,
  isLocalized,
}: {
  writer: SourceWriter;
  collection: CollectionConfig | GlobalConfig;
  fields: Field[];
  doc: { [key: string]: any };
  previousDoc: { [key: string]: any };
  alwaysUpdate?: boolean;
  isLocalized?: IsLocalized;
}) => {
  const currentJson = buildJsonObject({ doc, fields, isLocalized });
  const previousJson = buildJsonObject({
    doc: previousDoc,
    fields,
    isLocalized,
  });

  if (
    alwaysUpdate ||
    (!deepEqual(currentJson, previousJson) &&
      Object.keys(currentJson).length !== 0)
  ) {
    await writer.writeJson({ fileData: currentJson });
  }

  const currentHtml = buildHtmlObject({ doc, fields, isLocalized });
  const previousHtml = buildHtmlObject({
    doc: previousDoc,
    fields,
    isLocalized,
  });

  const htmlWrites = await Promise.allSettled(
    Object.keys(currentHtml).map(async (name) => {
      const currentValue = currentHtml[name];
      const previousValue = previousHtml[name];
      if (!alwaysUpdate && !richTextChanged(previousValue, currentValue)) {
        return;
      }
      await writer.writeHtml({
        name,
        value: currentValue,
        collection,
      });
    }),
  );
  throwIfAnyRejected(htmlWrites, 'Failed to write html source files');
};
