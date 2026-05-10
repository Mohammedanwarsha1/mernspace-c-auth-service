/** @type {import('jest').Config} */
process.env.NODE_ENV = "test";

export default {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    verbose: true,
    collectCoverage: true,
    coverageProvider: "v8",
    collectCoverageFrom: ["src/**/*.ts", "!test/**", "!**/node_modules/**"],
    maxWorkers: 1,
    extensionsToTreatAsEsm: [".ts"],
    watchPathIgnorePatterns: [
        "<rootDir>/.git/",
        "<rootDir>/node_modules/",
        "<rootDir>/dist/",
    ],
    modulePathIgnorePatterns: ["<rootDir>/.git/", "<rootDir>/dist/"],
    testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
    moduleNameMapper: {
        "^jwks-rsa$": "<rootDir>/test/mocks/jwks-rsa.ts",
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                useESM: true,
                tsconfig: "tsconfig.json",
            },
        ],
    },
};
