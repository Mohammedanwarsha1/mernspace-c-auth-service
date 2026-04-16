/** @type {import('jest').Config} */
export default {
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".ts"],
    watchPathIgnorePatterns: [
        "<rootDir>/.git/",
        "<rootDir>/node_modules/",
        "<rootDir>/dist/",
    ],
    modulePathIgnorePatterns: ["<rootDir>/.git/", "<rootDir>/dist/"],
    testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
    moduleNameMapper: {
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
