import payload from "payload";
import swcRegister from "@swc/register";
import { v4 as uuid } from "uuid";
import type { InitOptions } from "payload/dist/config/types";
import express from "express";
import path from "path"

type Options = {
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

  process.env['NODE_ENV'] = "test";

  process.env['PAYLOAD_CONFIG_PATH'] = path.resolve(
    __dirname,
    "./../../payload.config.ts"
  );
  
  const port = process.env['PORT'] || 3000;

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
