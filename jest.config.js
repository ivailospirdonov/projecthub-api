const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  clearMocks: true,
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
};
