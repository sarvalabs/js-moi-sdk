import type { Config } from "jest";

const config: Config = {
    clearMocks: true,
    collectCoverage: false,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    projects: [
        {
            transform: { "^.+.tsx?$": ["ts-jest", {}] },
            displayName: "js-moi-utils",
            testEnvironment: "node",
            testMatch: ["<rootDir>/packages/js-moi-utils/__tests__/*.test.ts"],
        },
    ],
};

export default config;
