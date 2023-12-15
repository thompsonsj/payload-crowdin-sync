import React, { FC } from 'react'
import { useFormFields } from 'payload/components/forms'
import { UIField } from 'payload/dist/fields/config/types';
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
