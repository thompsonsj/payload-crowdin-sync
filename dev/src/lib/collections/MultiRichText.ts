import { CollectionConfig } from "payload/types";
import { multiRichTextFields } from "./fields/multiRichTextFields";

const MultiRichText: CollectionConfig = {
  slug: "multi-rich-text",
  fields: multiRichTextFields,
};

export default MultiRichText;
