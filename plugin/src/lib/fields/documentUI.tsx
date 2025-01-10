'use client'
import React, { FC } from 'react'
import { useFormFields } from '@payloadcms/ui'
import { UIField } from 'payload';
import { CrowdinArticleDirectory } from '../payload-types';

export const DocumentCustomUIField: React.FC<UIField> = () => <LocalePublishedFeedback />;

const LocalePublishedFeedback: FC = () =>  {
  const { crowdinArticleDirectory } = useFormFields(([fields]) => {
    return {
      crowdinArticleDirectory: (fields['crowdinArticleDirectory'].value || []) as CrowdinArticleDirectory,
    }
  });

  return (
    <div>
      <h4>Last sync:</h4>
      <p>{crowdinArticleDirectory.updatedAt}</p>
    </div>
  );
}
