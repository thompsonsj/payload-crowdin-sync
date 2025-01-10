import type { Field } from "payload";

export const collapsibleFields = (label: string, fields: any): Field => ({
  type: "collapsible",
  label,
  admin: {
    initCollapsed: true,
  },
  fields,
});
