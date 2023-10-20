import { slateEditor } from "@payloadcms/richtext-slate";

interface IHeroFieldOptions {
  image?: boolean;
  badge?: boolean;
}

const defaultOptions = { image: false, badge: false };

export const heroField = (options: IHeroFieldOptions = {}): any => {
  options = { ...defaultOptions, ...options };

  const config = {
    name: "hero",
    type: "group",
    localized: true,
    fields: [
      {
        name: "title",
        type: "richText",
        editor: slateEditor({
          admin: {
            elements: [],
            leaves: ["bold"],
          },
        }),
      },
      {
        name: "text",
        type: "richText",
        editor: slateEditor({
          admin: {
            elements: [],
            leaves: ["bold"],
          },
        }),
      },
      options.badge && {
        name: "badge",
        type: "group",
        localized: true,
        fields: [
          {
            name: "badgeText",
            type: "text",
          },
          {
            name: "text",
            type: "text",
          },
          {
            name: "link",
            type: "text",
            admin: {
              description: "Not sent to CrowdIn. Localize in the CMS.",
            },
          },
        ],
      },
      options.image && {
        name: "image",
        type: "upload",
        relationTo: "media",
      },
    ].filter(Boolean),
  };

  return config;
};
