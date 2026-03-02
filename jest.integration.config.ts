import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  testMatch: ["**/*.integration.spec.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/integration/setup.ts"],
};

export default config;
