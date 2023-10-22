import { buildConfigWithPluginOptions, localeMap } from "./payload.config";
import { payloadHtmlToSlateConfig, payloadSlateToHtmlConfig } from "../../dist";

export default buildConfigWithPluginOptions({
  projectId: 323731,
  directoryId: 1169,
  token: `fake-token`, // CrowdIn API is mocked but we need a token to pass schema validation
  localeMap,
  sourceLocale: "en",
  slateToHtmlConfig: {
    ...payloadSlateToHtmlConfig,
    elementMap: {
      ...payloadSlateToHtmlConfig.elementMap,
      table: "table",
      ["table-row"]: "tr",
      ["table-cell"]: "td",
      ["table-header"]: "thead",
      ["table-header-cell"]: "th",
      ["table-body"]: "tbody",
    },
  },
});
