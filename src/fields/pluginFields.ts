import type { Field, TabsField } from "payload/types";

interface Args {
  fields: Field[];
  tabbedUI?: boolean;
}

const crowdinArticleDirectoryField: Field = {
  name: "crowdinArticleDirectory",
  type: "relationship",
  relationTo: "crowdin-article-directories",
  hasMany: false,
  /*admin: {
    readOnly: true,
    disabled: true,
  },*/
};

const pluginFields: Field[] = [
  crowdinArticleDirectoryField,
]

export const pluginCollectionOrGlobalFields = ({ fields, tabbedUI = false }: Args): Field[] => {
  if (tabbedUI) {
    const pluginTabs: TabsField[] = [
      {
        type: 'tabs',
        tabs: [
          // append a new tab onto the end of the tabs array, if there is one at the first index
          // if needed, create a new `Content` tab in the first index for this collection's base fields
          ...(fields?.[0].type === 'tabs'
            ? fields[0]?.tabs
            : [
                {
                  label: 'Content',
                  fields: [...(fields || [])],
                },
              ]),
          {
            label: 'Crowdin',
            fields: [
              crowdinArticleDirectoryField,
            ],
          },
        ],
      },
    ]
  
    return [
      ...pluginTabs,
      ...(fields?.[0].type === 'tabs' ? fields?.slice(1) : []),
    ]
  }
  
  return [
    ...fields,
    ...pluginFields,
  ]
};

