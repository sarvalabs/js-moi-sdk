import { Config } from "jest";

const configuration: Config = {
    projects: [
        {
            displayName: "js-moi-bip39",
            testEnvironment: "ts-node",
            testMatch: ["<rootDir>/packages/js-moi-bip39/__tests__/*.test.ts"],
            transform: {
                "^.+\\.tsx?$": "ts-jest",
            },
            moduleFileExtensions: ["js", "ts", "d.ts"],
        },
        {
            displayName: "js-moi-hdnode",
            testEnvironment: "ts-node",
            testMatch: ["<rootDir>/packages/js-moi-hdnode/__tests__/*.test.ts"],
            transform: {
                "^.+\\.tsx?$": "ts-jest",
            },
        },
        // {
        //     displayName: "js-moi-wallet",
        //     testEnvironment: "ts-node",
        //     testMatch: ["<rootDir>/packages/js-moi-wallet/__tests__/*.test.ts"],
        //     transform: {
        //         "^.+\\.tsx?$": "ts-jest",
        //     },
        // },
        {
            displayName: "js-moi-manifest",
            testEnvironment: "ts-node",
            testMatch: ["<rootDir>/packages/js-moi-manifest/__tests__/*.test.ts"],
            transform: {
                "^.+\\.tsx?$": "ts-jest",
            },
        },
        {
            displayName: "js-moi-utils",
            testEnvironment: "ts-node",
            testMatch: ["<rootDir>/packages/js-moi-utils/__tests__/*.test.ts"],
            transform: {
                "^.+\\.tsx?$": "ts-jest",
            },
        },
        {
            displayName: "js-moi-providers",
            testEnvironment: "ts-node",
            testMatch: ["<rootDir>/packages/js-moi-providers/__tests__/*.test.ts"],
            transform: {
                "^.+\\.tsx?$": "ts-jest",
            },
        },
        // {
        //     displayName: 'js-moi-logic',
        //     testEnvironment: 'ts-node',
        //     testMatch: ['<rootDir>/packages/js-moi-logic/__tests__/*.test.ts'],
        //     transform: {
        //         '^.+\\.tsx?$': 'ts-jest',
        //     },
        // }
    ],
    testTimeout: 700000,
    maxConcurrency: 1,
};

export default configuration;
