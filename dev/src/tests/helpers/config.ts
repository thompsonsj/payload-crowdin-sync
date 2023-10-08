import payload from "payload";
import swcRegister from "@swc/register";
import { v4 as uuid } from "uuid";
import type { InitOptions } from "payload/dist/config/types";
import path from "path";
import express from "express";

type Options = {
  __dirname: string;
  payloadConfigFile?: string,
  init?: Partial<InitOptions>;
};

export async function initPayloadTest(
  options: Options
): Promise<{ serverURL: string }> {
  const initOptions = {
    local: true,
    secret: uuid(),
    mongoURL: `mongodb://localhost/${uuid()}`,
    ...(options.init || {}),
  };
  const payloadConfigPath = options.payloadConfigFile ? `./../${options.payloadConfigFile}` :  "./../payload.config.default.ts"

  process.env.NODE_ENV = "test";
  process.env.PAYLOAD_CONFIG_PATH = path.resolve(
    options.__dirname,
    payloadConfigPath
  );

  const port = process.env.PORT || 3000;

  if (!initOptions?.local) {
    initOptions.express = express();
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - bad @swc/register types
  swcRegister({
    sourceMaps: "inline",
    jsc: {
      parser: {
        syntax: "typescript",
        tsx: true,
      },
    },
    module: {
      type: "commonjs",
    },
  });

  await payload.init(initOptions);

  if (initOptions.express) {
    initOptions.express.listen(port);
  }

  return { serverURL: `http://localhost:${port}` };
}
