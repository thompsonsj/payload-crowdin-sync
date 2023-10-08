import type { Config } from "jest";

const config: Config = {
  verbose: true,
  modulePathIgnorePatterns: ["dist"],
  testTimeout: 90000,
  testEnvironment: "node",
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  // globalSetup: '<rootDir>/dev/src/tests/globalSetup.ts',
  roots: ["<rootDir>/src/", "<rootDir>/dev/"],
};

export default config;
