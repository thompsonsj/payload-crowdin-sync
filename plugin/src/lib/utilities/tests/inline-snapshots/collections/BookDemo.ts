import type { GlobalConfig } from "payload";
import { heroField } from "./shared/heroField";
import { collapsibleFields as cf } from "./shared/collapsibleFields";

const BookDemo: GlobalConfig = {
  slug: "book-demo",
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  admin: {
    group: "Static Pages",
  },
  fields: [
    cf("Hero", [heroField({ image: true })]),
    cf("Form", [
      {
        type: "group",
        name: "form",
        localized: true,
        fields: [
          {
            type: "text",
            name: "title",
          },
          {
            type: "text",
            name: "subTitle",
          },
          {
            type: "group",
            name: "content",
            localized: true,
            fields: [
              {
                name: "title",
                type: "text",
              },
              {
                name: "items",
                type: "array",
                localized: true,
                fields: [{ type: "text", name: "text" }],
              },
            ],
          },
        ],
      },
    ]),
    {
      name: "logoTitle",
      type: "text",
      required: true,
      localized: true,
    },
    cf("Promo", [
      {
        name: "promo",
        type: "relationship",
        relationTo: "promos",
        hasMany: false,
      },
    ]),
  ],
};

export default BookDemo;
