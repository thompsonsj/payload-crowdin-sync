import type { Config } from "jest";

const config: Config = {
  preset: 'ts-jest/presets/js-with-ts',
  verbose: true,
  modulePathIgnorePatterns: ["dist"],
  testTimeout: 90000,
  testEnvironment: "node",
  // globalSetup: '<rootDir>/dev/src/tests/globalSetup.ts',
  roots: ["<rootDir>/src/", "<rootDir>/dev/"],
};

export default config;
