module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  roots: ["<rootDir>/tests"],

  moduleFileExtensions: ["ts", "js", "json"],

  clearMocks: true,

  collectCoverage: true,
  coverageDirectory: "coverage",
};
