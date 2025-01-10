import type { Field } from "payload";

export const basicNonLocalizedFields: Field[] = [
  {
    name: "textField",
    type: "text",
  },
  {
    name: "textareaField",
    type: "textarea",
  },
  // select not supported: included to ensure it does not send to Crowdin
  {
    name: "select",
    type: "select",
    options: ["one", "two"],
  },
  // image not supported: included to ensure it does send to Crowdin
  {
    name: "image",
    type: "upload",
    relationTo: "media",
  },
];

export const basicLocalizedFields: Field[] = [
  {
    name: "textField",
    type: "text",
    localized: true,
  },
  {
    name: "textareaField",
    type: "textarea",
    localized: true,
  },
  // select not supported: included to ensure it does not send to Crowdin
  {
    name: "select",
    type: "select",
    localized: true,
    options: ["one", "two"],
  },
  // image not supported: included to ensure it does send to Crowdin
  {
    name: "image",
    type: "upload",
    relationTo: "media",
    localized: true,
  },
];

export const emptyFieldDocValue = {
  textField: "",
  textareaField: "",
  select: "one",
  image: "63ea51826ff825cddad3c296",
};

export const fieldDocValue = {
  textField: "Text field content",
  textareaField: "A textarea field value.\nWith a new line.",
  select: "one",
  image: "63ea51826ff825cddad3c296",
};

export const fieldJsonCrowdinObject = (prefix?: string) => {
  const value = {
    textField: "Text field content",
    textareaField: "A textarea field value.\nWith a new line.",
  };
  if (prefix) {
    var tgt = {};
    dot.str(prefix, value, tgt);
    return tgt;
  }
  return value;
};
