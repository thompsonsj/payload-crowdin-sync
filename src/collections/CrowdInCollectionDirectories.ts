import { CollectionConfig } from "payload/types";

const CrowdinCollectionDirectories: CollectionConfig = {
  slug: "crowdin-collection-directories",
  admin: {
    defaultColumns: ["name", "title", "collectionSlug", "updatedAt"],
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
    {
      name: "title",
      type: "text",
    },
    /* Internal fields  */
    {
      name: "collectionSlug",
      type: "text",
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

export default CrowdinCollectionDirectories;
