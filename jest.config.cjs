module.exports = {
    projects: [
        // {
        //     displayName: 'moi-abi',
        //     testEnvironment: 'ts-node',
        //     testMatch: ['<rootDir>/packages/moi-abi/__tests__/*.test.ts'],
        //     transform: {
        //         '^.+\\.tsx?$': 'ts-jest',
        //     },
        // },
        // {
        //     displayName: 'moi-logic',
        //     testEnvironment: 'ts-node',
        //     testMatch: ['<rootDir>/packages/moi-logic/__tests__/*.test.ts'],
        //     transform: {
        //         '^.+\\.tsx?$': 'ts-jest',
        //     },
        // },
        // {
        //     displayName: 'moi-core',
        //     testEnvironment: 'ts-node',
        //     testMatch: ['<rootDir>/packages/moi-core/__tests__/*.test.ts'],
        //     transform: {
        //         '^.+\\.tsx?$': 'ts-jest',
        //     },
        // },
        // {
        //     displayName: 'moi-utils',
        //     testEnvironment: 'ts-node',
        //     testMatch: ['<rootDir>/packages/moi-utils/__tests__/*.test.ts'],
        //     transform: {
        //         '^.+\\.tsx?$': 'ts-jest',
        //     },
        // }
        {
            displayName: 'moi-providers',
            testEnvironment: 'ts-node',
            testMatch: ['<rootDir>/packages/moi-providers/__tests__/*.test.ts'],
            transform: {
                '^.+\\.tsx?$': 'ts-jest',
            },
            moduleFileExtensions: ['js', 'ts', 'd.ts'],
        },
    ],
    testTimeout: 700000,
    maxConcurrency: 1
}
