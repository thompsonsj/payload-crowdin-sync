import type { CollectionConfig } from "payload";
import { multiRichTextFields } from "./fields/multiRichTextFields";

const MultiRichText: CollectionConfig = {
  slug: "multi-rich-text",
  fields: multiRichTextFields,
};

export default MultiRichText;
