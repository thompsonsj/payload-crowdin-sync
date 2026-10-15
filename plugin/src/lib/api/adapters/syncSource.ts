import type { CollectionConfig, Field, GlobalConfig } from 'payload';
import deepEqual from 'deep-equal';
import {
  buildCrowdinHtmlObject,
  buildCrowdinJsonObject,
  fieldChanged,
} from '../../utilities';
import type { SourceWriter } from './types';

export const syncDocumentSource = async ({
  writer,
  collection,
  fields,
  doc,
  previousDoc,
  alwaysUpdate = false,
}: {
  writer: SourceWriter;
  collection: CollectionConfig | GlobalConfig;
  fields: Field[];
  doc: { [key: string]: any };
  previousDoc: { [key: string]: any };
  alwaysUpdate?: boolean;
}) => {
  const currentJson = buildCrowdinJsonObject({ doc, fields });
  const previousJson = buildCrowdinJsonObject({
    doc: previousDoc,
    fields,
  });

  if (
    alwaysUpdate ||
    (!deepEqual(currentJson, previousJson) &&
      Object.keys(currentJson).length !== 0)
  ) {
    await writer.writeJson({ fileData: currentJson });
  }

  const currentHtml = buildCrowdinHtmlObject({ doc, fields });
  const previousHtml = buildCrowdinHtmlObject({
    doc: previousDoc,
    fields,
  });

  await Promise.allSettled(
    Object.keys(currentHtml).map(async (name) => {
      const currentValue = currentHtml[name];
      const previousValue = previousHtml[name];
      if (
        !alwaysUpdate &&
        !fieldChanged(previousValue, currentValue, 'richText')
      ) {
        return;
      }
      await writer.writeHtml({
        name,
        value: currentValue,
        collection,
      });
    }),
  );
};
