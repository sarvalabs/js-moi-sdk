import { Config } from "jest";

const configuration: Config = {
    projects: [
        {
            displayName: 'js-moi-bip39',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/packages/js-moi-bip39/__tests__/*.test.ts'],
            transform: {
                '^.+\\.tsx?$': 'ts-jest',
            },
            moduleFileExtensions: ['js', 'ts', 'd.ts'],
        },
        {
            displayName: 'js-moi-hdnode',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/packages/js-moi-hdnode/__tests__/*.test.ts'],
            transform: {
                '^.+\\.tsx?$': 'ts-jest',
            },
        },
        {
            displayName: 'js-moi-wallet',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/packages/js-moi-wallet/__tests__/*.test.ts'],
            transform: {
                '^.+\\.tsx?$': 'ts-jest',
            },
        },
        {
            displayName: 'js-moi-manifest',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/packages/js-moi-manifest/__tests__/*.test.ts'],
            transform: {
                '^.+\\.tsx?$': 'ts-jest',
            },
        },
        {
            displayName: 'js-moi-utils',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/packages/js-moi-utils/__tests__/*.test.ts'],
            transform: {
                '^.+\\.tsx?$': 'ts-jest',
            },
        },
        {
            displayName: 'js-moi-interactions',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/packages/js-moi-interactions/__tests__/*.test.ts'],
            transform: {
                '^.+\\.tsx?$': 'ts-jest',
            },
        },
        {
            displayName: 'js-moi-identifiers',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/packages/js-moi-identifiers/__tests__/*.test.ts'],
            transform: {
                '^.+\\.tsx?$': 'ts-jest',
            },
        },
        {
            displayName: 'js-moi-asset',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/packages/js-moi-asset/__tests__/*.test.ts'],
            transform: {
                '^.+\\.tsx?$': 'ts-jest',
            },
        },
        {
            // NOTE: scoped to just these two files, not '*.test.ts' - this package's other
            // __tests__ (jsonrpc-provider.test.ts, ws-provider.test.ts) are live-network
            // integration tests with placeholder credentials (<YOUR JSON RPC HOST> etc.),
            // meant to be filled in and run manually against a real node, not in CI. These
            // two are pure unit tests: interaction.test.ts covers the existing encode/
            // validate logic, storage-access-interaction.test.ts covers the new storage-
            // rent/access-control ops (validators, participant derivation, and a POLO
            // wire-encoding round-trip) - the highest-risk new logic in this package.
            displayName: 'js-moi-providers',
            testEnvironment: 'node',
            testMatch: [
                '<rootDir>/packages/js-moi-providers/__tests__/interaction.test.ts',
                '<rootDir>/packages/js-moi-providers/__tests__/storage-access-interaction.test.ts',
            ],
            transform: {
                '^.+\\.tsx?$': 'ts-jest',
            },
        },
        {
            // NOTE: scoped to just these two files, not '*.test.ts' - this package's other
            // __tests__ (logic.test.ts, persistant-state.test.ts) are live-network
            // integration tests with placeholder credentials (<YOUR JSON RPC HOST> etc.),
            // meant to be filled in and run manually against a real node, not in CI. They
            // compile cleanly against the current API; they're just not runnable headless.
            displayName: 'js-moi-logic',
            testEnvironment: 'node',
            testMatch: [
                '<rootDir>/packages/js-moi-logic/__tests__/logic-factory-funding.test.ts',
                '<rootDir>/packages/js-moi-logic/__tests__/routine-options.test.ts',
            ],
            transform: {
                '^.+\\.tsx?$': 'ts-jest',
            },
        },
    ],
    testTimeout: 700000,
    maxConcurrency: 1
}

export default configuration;
