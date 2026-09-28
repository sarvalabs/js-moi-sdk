import { Config } from "jest";

// js-moi-identifiers depends on ESM-only packages (@libp2p/peer-id, multiformats).
const esmDependencyTransformIgnorePatterns = [
    "node_modules/(?!(@libp2p|multiformats|uint8arrays|@noble|@scure)/)",
];

const defaultTsJestTransform = {
    "^.+\\.tsx?$": "ts-jest",
};

// Most packages load js-moi-identifiers from lib.cjs, which requires @libp2p/peer-id.
// That dependency is ESM-only and cannot be required from Jest's default CJS runtime.
// Stub it for those projects; js-moi-identifiers tests use the real module via ESM.
const transitiveEsmDependencyMockMapper = {
    "^@libp2p/peer-id$": "<rootDir>/jest/mocks/libp2p-peer-id.ts",
    "^multiformats/hashes/digest$": "<rootDir>/jest/mocks/multiformats-hashes-digest.ts",
};

const configuration: Config = {
    projects: [
        {
            displayName: "js-moi-bip39",
            testEnvironment: "node",
            testMatch: ["<rootDir>/packages/js-moi-bip39/__tests__/*.test.ts"],
            transform: defaultTsJestTransform,
            moduleFileExtensions: ["js", "ts", "d.ts"],
            moduleNameMapper: transitiveEsmDependencyMockMapper,
        },
        {
            displayName: "js-moi-hdnode",
            testEnvironment: "node",
            testMatch: ["<rootDir>/packages/js-moi-hdnode/__tests__/*.test.ts"],
            transform: defaultTsJestTransform,
            moduleNameMapper: transitiveEsmDependencyMockMapper,
        },
        {
            displayName: "js-moi-wallet",
            testEnvironment: "node",
            testMatch: ["<rootDir>/packages/js-moi-wallet/__tests__/*.test.ts"],
            transform: defaultTsJestTransform,
            moduleNameMapper: transitiveEsmDependencyMockMapper,
        },
        {
            displayName: "js-moi-manifest",
            testEnvironment: "node",
            testMatch: ["<rootDir>/packages/js-moi-manifest/__tests__/*.test.ts"],
            transform: defaultTsJestTransform,
            moduleNameMapper: transitiveEsmDependencyMockMapper,
        },
        {
            displayName: "js-moi-utils",
            testEnvironment: "node",
            testMatch: ["<rootDir>/packages/js-moi-utils/__tests__/*.test.ts"],
            transform: defaultTsJestTransform,
            moduleNameMapper: transitiveEsmDependencyMockMapper,
        },
        {
            displayName: "js-moi-interactions",
            testEnvironment: "node",
            testMatch: ["<rootDir>/packages/js-moi-interactions/__tests__/*.test.ts"],
            transform: defaultTsJestTransform,
            moduleNameMapper: transitiveEsmDependencyMockMapper,
        },
        {
            displayName: "js-moi-identifiers",
            testEnvironment: "node",
            testMatch: ["<rootDir>/packages/js-moi-identifiers/__tests__/*.test.ts"],
            preset: "ts-jest/presets/default-esm",
            extensionsToTreatAsEsm: [".ts"],
            moduleNameMapper: {
                '^(\\.{1,2}/.*)\\.js$': '$1',
            },
            transform: {
                '^.+\\.tsx?$': [
                    'ts-jest',
                    {
                        useESM: true,
                        tsconfig: '<rootDir>/packages/js-moi-identifiers/tsconfig.json',
                    },
                ],
            },
            transformIgnorePatterns: esmDependencyTransformIgnorePatterns,
        },
        {
            displayName: "js-moi-asset",
            testEnvironment: "node",
            testMatch: ["<rootDir>/packages/js-moi-asset/__tests__/*.test.ts"],
            transform: defaultTsJestTransform,
            moduleNameMapper: transitiveEsmDependencyMockMapper,
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
            displayName: "js-moi-providers",
            testEnvironment: "node",
            testMatch: [
                "<rootDir>/packages/js-moi-providers/__tests__/interaction.test.ts",
                "<rootDir>/packages/js-moi-providers/__tests__/storage-access-interaction.test.ts",
            ],
            transform: defaultTsJestTransform,
            moduleNameMapper: transitiveEsmDependencyMockMapper,
        },
        {
            // NOTE: scoped to just these two files, not '*.test.ts' - this package's other
            // __tests__ (logic.test.ts, persistant-state.test.ts) are live-network
            // integration tests with placeholder credentials (<YOUR JSON RPC HOST> etc.),
            // meant to be filled in and run manually against a real node, not in CI. They
            // compile cleanly against the current API; they're just not runnable headless.
            displayName: "js-moi-logic",
            testEnvironment: "node",
            testMatch: [
                "<rootDir>/packages/js-moi-logic/__tests__/logic-factory-funding.test.ts",
                "<rootDir>/packages/js-moi-logic/__tests__/routine-options.test.ts",
            ],
            transform: defaultTsJestTransform,
            moduleNameMapper: transitiveEsmDependencyMockMapper,
        },
    ],
    testTimeout: 700000,
    maxConcurrency: 1
}

export default configuration;
