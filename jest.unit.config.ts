import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests/unit"],
  setupFilesAfterEnv: ["<rootDir>/tests/unit/setup.ts"],
};

export default config;
