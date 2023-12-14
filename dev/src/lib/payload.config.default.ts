import { buildConfigWithPluginOptions, localeMap } from "./payload.config";

export default buildConfigWithPluginOptions({
  projectId: 323731,
  directoryId: 1169,
  token: `fake-token`, // CrowdIn API is mocked but we need a token to pass schema validation
  localeMap,
  sourceLocale: "en",
});
