import deepmerge from "deepmerge";
import { Config } from "jest";

interface Package {
    name: string;
    run_tests: boolean;
    config?: Config;
}

const packages: Package[] = [
    {
        name: "js-moi-bip39",
        run_tests: true,
    },
    {
        name: "js-moi-hdnode",
        run_tests: true,
    },
    {
        name: "js-moi-wallet",
        run_tests: true,
    },
    {
        name: "js-moi-manifest",
        run_tests: true,
    },
    {
        name: "js-moi-utils",
        run_tests: true,
    },
    {
        name: "js-moi-providers",
        run_tests: false,
    },
    // {
    //     name: "js-moi-logic",
    //     run_tests: false,
    // },
];

/**
 * Returns the global configuration for Jest.
 *
 * @returns {Config} The Jest configuration object.
 *
 * @remarks
 * This configuration sets the test environment to "ts-node" and uses "ts-jest" to transform TypeScript files.
 * It also specifies the file extensions Jest should recognize and a module name mapper.
 */
const getGlobalConfig = (): Config => {
    return {
        testEnvironment: "ts-node",
        transform: { "^.+\\.tsx?$": "ts-jest" },
        moduleFileExtensions: ["js", "ts", "d.ts"],
        testMatch: ["<rootDir>/packages/**/__tests__/*.test.ts"],
    };
};

/**
 * Retrieves the Jest configuration for a specified project.
 *
 * @param name - The name of the project for which to retrieve the configuration.
 * @returns The Jest configuration for the specified project.
 * @throws Will throw an error if the specified project is not found.
 */
const getProjectConfig = (pkg: Package): Config => {
    return deepmerge.all<Config>([{ displayName: pkg.name }, getGlobalConfig(), pkg.config ?? {}]);
};

const getProjects = (): Config[] => {
    return packages.filter((pkg) => pkg.run_tests).map(getProjectConfig);
};

const configuration: Config = {
    preset: "ts-jest",
    coverageReporters: ["json", "html"],
    collectCoverageFrom: ["packages/**/src.ts/**/*"],
    testTimeout: 700000,
    maxConcurrency: 10,
    projects: getProjects(),
};

export default configuration;
