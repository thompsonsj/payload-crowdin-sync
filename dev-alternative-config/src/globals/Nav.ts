import type { GlobalConfig } from "payload";

const Nav: GlobalConfig = {
  slug: "nav",
  fields: [
    {
      name: "items",
      type: "array",
      required: true,
      maxRows: 8,
      fields: [
        {
          name: "label",
          type: "text",
        },
      ],
    },
  ],
};

export default Nav;
