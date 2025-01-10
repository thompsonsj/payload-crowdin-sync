import type { CollectionConfig } from "payload";

const CrowdinArticleDirectories: CollectionConfig = {
  slug: "crowdin-article-directories",
  admin: {
    defaultColumns: [
      "name",
      "title",
      "crowdinCollectionDirectory",
      "createdAt",
    ],
    useAsTitle: "name",
    group: "Crowdin Admin",
  },
  access: {
    read: () => true,
  },
  fields: [
    /* Crowdin field */
    {
      name: "name",
      type: "text",
      admin: {
        readOnly: true,
      }
    },
    /* Internal fields  */
    {
      name: "crowdinCollectionDirectory",
      type: "relationship",
      relationTo: "crowdin-collection-directories",
      hasMany: false,
      admin: {
        readOnly: true,
      }
    },
    {
      name: "crowdinFiles",
      type: "relationship",
      relationTo: "crowdin-files",
      hasMany: true,
      admin: {
        readOnly: true,
      }
    },
    {
      name: "parent",
      type: "relationship",
      relationTo: "crowdin-article-directories",
      admin: {
        readOnly: true,
      }
    },
    /* Crowdin fields */
    {
      type: "group",
       /* For reference only - unused */
      name: "reference",
      fields: [
        {
          name: "createdAt",
          type: "date",
          admin: {
            readOnly: true,
          }
        },
        {
          name: "updatedAt",
          type: "date",
          admin: {
            readOnly: true,
          }
        },
        {
          name: "projectId",
          type: "number",
          admin: {
            readOnly: true,
          }
        },
      ]
    },
    {
      name: "originalId",
      type: "number",
      admin: {
        readOnly: true,
      }
    },
    {
      name: "directoryId",
      type: "number",
      admin: {
        readOnly: true,
      }
    },
  ],
};

export default CrowdinArticleDirectories;
