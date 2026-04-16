/** @type {import('jest').Config} */
export default {
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".ts"],
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
