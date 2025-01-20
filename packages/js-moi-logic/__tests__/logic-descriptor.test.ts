import { ManifestCoder, ManifestCoderFormat } from "js-moi-manifest";
import { ElementType, EngineKind, isAddress, isHex, LogicId, LogicState, type Hex, type LogicManifest } from "js-moi-utils";
import { parse } from "yaml";
import { LogicDescriptor } from "../src.ts";
import { loadManifestFromFile } from "./manifests";

const manifests = [
    {
        name: "tokenledger",
        isEphemeral: false,
        isPersistent: true,
        kind: EngineKind.PISA,
    },
    {
        name: "lockledger",
        isEphemeral: true,
        isPersistent: true,
        kind: EngineKind.PISA,
    },
    {
        name: "flipper",
        isEphemeral: false,
        isPersistent: true,
        kind: EngineKind.MERU,
    },
];

describe.each(manifests)(`${LogicDescriptor.name} of manifest "$name"`, (manifest) => {
    const descriptor = new LogicDescriptor(loadManifestFromFile(manifest.name));

    describe(descriptor.getEngine, () => {
        it.concurrent("should get manifest engine", async () => {
            const engine = descriptor.getEngine();

            expect(engine).toBeDefined();
            expect(engine.kind).toBe(manifest.kind);
            expect(engine.kind in EngineKind).toBe(true);
            expect(Array.isArray(engine.flags)).toBe(true);
        });
    });

    describe(descriptor.getSyntax, () => {
        it.concurrent("should get manifest syntax", async () => {
            const syntax = descriptor.getSyntax();

            expect(syntax).toBeDefined();
            expect(syntax).toBe(1);
        });
    });

    it.concurrent("should return a instance of ManifestCoder", () => {
        const coder = descriptor.getManifestCoder();

        expect(coder).toBeDefined();
        expect(coder).toBeInstanceOf(ManifestCoder);
    });

    describe("if logic id is not defined", () => {
        describe.each([
            {
                name: "getVersion",
                callback: async () => descriptor.getVersion(),
            },
            {
                name: "getEdition",
                callback: async () => descriptor.getEdition(),
            },
            {
                name: "getLogicAddress",
                callback: async () => descriptor.getLogicAddress(),
            },
            {
                name: "isAssetLogic",
                callback: async () => descriptor.isAssetLogic(),
            },
        ])("$name", ({ callback }) => {
            it.concurrent("should throw error if logic id is not set", async () => {
                await expect(callback()).rejects.toThrow();
            });
        });
    });

    describe("if logic id is defined", () => {
        const value = "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782";

        beforeAll(() => {
            descriptor["setLogicId"](new LogicId(value));
        });

        afterAll(() => {
            descriptor["logicId"] = undefined;
        });

        describe(descriptor.getLogicId, () => {
            it("should return logic id", async () => {
                const logicId = await descriptor.getLogicId();

                expect(logicId).toBeDefined();
                expect(logicId).toBeInstanceOf(LogicId);
                expect(logicId.value).toBe(value);
            });
        });

        describe(descriptor.getVersion, () => {
            it("should return version", async () => {
                const version = await descriptor.getVersion();

                expect(version).toBeDefined();
                expect(version).toBe(0);
            });
        });

        describe(descriptor.getEdition, () => {
            it("should return edition", async () => {
                const edition = await descriptor.getEdition();

                expect(edition).toBeDefined();
                expect(edition).not.toBeNaN();
                expect(edition).toBeGreaterThanOrEqual(0);
            });
        });

        describe(descriptor.getLogicAddress, () => {
            it("should return logic address", async () => {
                const address = await descriptor.getLogicAddress();

                expect(address).toBeDefined();
                expect(isAddress(address)).toBeTruthy();
            });
        });

        describe(descriptor.isAssetLogic, () => {
            it("should return a boolean value", async () => {
                const result = await descriptor.isAssetLogic();

                expect(result).toBeDefined();
                expect(result).toBeFalsy();
            });
        });
    });

    describe(descriptor.isEphemeral, () => {
        it.concurrent(`should return a boolean value of ${manifest.isEphemeral}`, () => {
            const result = descriptor.isEphemeral();

            expect(result).toBeDefined();
            expect(result).toBe(manifest.isEphemeral);
        });
    });

    describe(descriptor.isPersistent, () => {
        it.concurrent(`should return a boolean value of ${manifest.isPersistent}`, () => {
            const result = descriptor.isPersistent();

            expect(result).toBeDefined();
            expect(result).toBe(manifest.isPersistent);
        });
    });

    describe(descriptor.getManifest, () => {
        it.concurrent.each([
            {
                case: "if format is not passed",
                callback: () => descriptor.getManifest(undefined!),
            },
            {
                case: "if format is invalid",
                callback: () => descriptor.getManifest("invalid" as any),
            },
        ])("should throw error if $case", ({ callback }) => {
            expect(callback).toThrow();
        });

        it.concurrent.each([
            {
                format: ManifestCoderFormat.JSON,
                verify: (manifest: LogicManifest) => {
                    expect(manifest).toBeDefined();
                    expect(typeof manifest).toBe("object");
                },
            },
            {
                format: ManifestCoderFormat.YAML,
                verify: (manifest: string) => {
                    expect(manifest).toBeDefined();
                    expect(typeof manifest).toBe("string");
                    expect(() => parse(manifest)).not.toThrow();
                },
            },
            {
                format: ManifestCoderFormat.POLO,
                verify: (manifest: Hex) => {
                    expect(manifest).toBeDefined();
                    expect(isHex(manifest)).toBeTruthy();
                },
            },
        ])(`should return manifest in $format format`, async ({ format, verify }) => {
            const manifest: any = descriptor.getManifest(format as any);

            verify(manifest);
        });
    });

    describe(descriptor.getStateElement, () => {
        it.concurrent.each([
            { state: LogicState.Ephemeral, shouldExist: manifest.isEphemeral },
            { state: LogicState.Persistent, shouldExist: manifest.isPersistent },
        ])("should return state element if state is $state", async ({ state, shouldExist }) => {
            if (shouldExist) {
                const element = descriptor.getStateElement(state);

                expect(element).toBeDefined();
                expect(element.kind).toBe(ElementType.State);
            } else {
                expect(() => descriptor.getStateElement(state)).toThrow();
            }
        });
    });
});
