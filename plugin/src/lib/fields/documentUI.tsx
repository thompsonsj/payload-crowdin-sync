import React, { FC, useEffect, useState } from 'react'
import type { Props } from 'payload/components/views/Cell'
import { useFormFields } from 'payload/components/forms'
import { UIField } from 'payload/dist/fields/config/types';
import { useDocumentInfo, useLocale } from 'payload/components/utilities';

const baseClass = 'custom-cell'

/**
export const DocumentCustomUICell: React.FC<Props> = (props) => {
  const locale = useLocale()
  const { rowData } = props

  const value = feedback({
    publishLocales: (rowData.publishLocales || [])  as string[],
    locale: locale.code,
    _status: rowData._status as string,
  })

  return <span className={baseClass}>
    {value}
  </span>
}
*/

export const DocumentCustomUIField: React.FC<UIField> = (props) => <LocalePublishedFeedback />;

const LocalePublishedFeedback: FC = () =>  {
  const { publishedDoc } = useDocumentInfo()
  const { crowdinArticleDirectory } = useFormFields(([fields]) => {
    return {
      crowdinArticleDirectory: (fields['crowdinArticleDirectory'].value || []) as any,
    }
  });

  useEffect(() => {
    console.log( publishedDoc, crowdinArticleDirectory )
  }, [crowdinArticleDirectory]);

  return (
    <></>
  );
}
