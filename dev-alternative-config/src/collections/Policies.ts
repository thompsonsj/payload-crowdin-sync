import type { CollectionConfig } from "payload";
import { lexicalEditorWithBlocks } from "./fields/lexicalEditorWithBlocks";

const Policies: CollectionConfig = {
  slug: "policies",
  admin: {
    defaultColumns: ["title", "author", "category", "tags", "status"],
    useAsTitle: "title",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      localized: true,
    },
    lexicalEditorWithBlocks,
    {
      name: "group",
      type: "group",
      fields: [
        {
          name: "array",
          type: "array",
          fields: [
            {
              name: "title",
              type: "text",
              localized: true,
            },
            lexicalEditorWithBlocks,
          ]
        }
      ]
    }
  ]
}

export default Policies
