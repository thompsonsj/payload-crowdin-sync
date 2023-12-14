import { Field } from "payload/types";

export const basicLocalizedFields: Field[] = [
  {
    name: "textField",
    type: "text",
    localized: true,
  },
  {
    name: "richTextField",
    type: "richText",
    localized: true,
  },
  {
    name: "textareaField",
    type: "textarea",
    localized: true,
  },
];
