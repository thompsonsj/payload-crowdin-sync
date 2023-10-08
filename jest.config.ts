import type { Config } from "jest";

const config: Config = {
  verbose: true,
  modulePathIgnorePatterns: ["dist"],
  testTimeout: 90000,
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
    "node_modules/get-port/.+\\.(j|t)sx?$": "@swc/jest"
  },
  "transformIgnorePatterns": [
    "node_modules/(?!get-port/.*)"
  ],
  testEnvironment: "node",
  // globalSetup: '<rootDir>/dev/src/tests/globalSetup.ts',
  roots: ["<rootDir>/src/", "<rootDir>/dev/"],
};

export default config;
