module.exports = {
    projects: [
        {
            displayName: 'moi-bip39',
            testEnvironment: 'ts-node',
            testMatch: ['<rootDir>/packages/moi-bip39/__tests__/*.test.ts'],
            transform: {
                '^.+\\.tsx?$': 'ts-jest',
            },
            moduleFileExtensions: ['js', 'ts', 'd.ts'],
        },
        {
            displayName: 'moi-hdnode',
            testEnvironment: 'ts-node',
            testMatch: ['<rootDir>/packages/moi-hdnode/__tests__/*.test.ts'],
            transform: {
                '^.+\\.tsx?$': 'ts-jest',
            },
        },
        {
            displayName: 'moi-wallet',
            testEnvironment: 'ts-node',
            testMatch: ['<rootDir>/packages/moi-wallet/__tests__/*.test.ts'],
            transform: {
                '^.+\\.tsx?$': 'ts-jest',
            },
        },
        {
            displayName: 'moi-manifest',
            testEnvironment: 'ts-node',
            testMatch: ['<rootDir>/packages/moi-manifest/__tests__/*.test.ts'],
            transform: {
                '^.+\\.tsx?$': 'ts-jest',
            },
        },
        {
            displayName: 'moi-utils',
            testEnvironment: 'ts-node',
            testMatch: ['<rootDir>/packages/moi-utils/__tests__/*.test.ts'],
            transform: {
                '^.+\\.tsx?$': 'ts-jest',
            },
        }
    ],
    testTimeout: 700000,
    maxConcurrency: 1
}
