module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/build/"],
  roots: ["<rootDir>/src/__tests__"],
  testMatch: ["**/*.test.ts"],
  verbose: true,
  maxConcurrency: 50,
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
};
