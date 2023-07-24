import { CollectionConfig } from "payload/types";

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
    },
    /* Internal fields  */
    {
      name: "crowdinCollectionDirectory",
      type: "relationship",
      relationTo: "crowdin-collection-directories",
      hasMany: false,
    },
    {
      name: "crowdinFiles",
      type: "relationship",
      relationTo: "crowdin-files",
      hasMany: true,
    },
    /* Crowdin fields */
    {
      name: "createdAt",
      type: "date",
    },
    {
      name: "updatedAt",
      type: "date",
    },
    {
      name: "originalId",
      type: "number",
    },
    {
      name: "projectId",
      type: "number",
    },
    {
      name: "directoryId",
      type: "number",
    },
  ],
};

export default CrowdinArticleDirectories;
