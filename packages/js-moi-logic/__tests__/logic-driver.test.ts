import { ManifestCoder } from "js-moi-manifest";
import { InteractionResponse } from "js-moi-providers";
import { bytesToHex, ElementType, LogicId, LogicState, OperationStatus, OpType, randomBytes, StorageKey, type Interaction } from "js-moi-utils";
import { getLogicDriver, LogicDriver } from "../src.ts";
import { getWallet } from "./helpers";
import { loadManifestFromFile } from "./manifests";

describe(getLogicDriver, () => {
    const wallet = getWallet();
    const manifest = loadManifestFromFile("flipper");
    const logicId = "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782";

    beforeAll(() => {
        jest.spyOn(wallet.getProvider(), "getLogic").mockReturnValue({
            manifest: ManifestCoder.encodeManifest(manifest),
            metadata: { logic_id: logicId },
        } as any);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it("should setup driver from logic address", async () => {
        const driver = await getLogicDriver(new LogicId(logicId).getAddress(), wallet);

        expect(driver).toBeInstanceOf(LogicDriver);
        expect((await driver.getLogicId()).value).toEqual(logicId);
    });

    it("should setup driver from logic id", async () => {
        const driver = await getLogicDriver(new LogicId(logicId), wallet);

        expect(driver).toBeInstanceOf(LogicDriver);
        expect((await driver.getLogicId()).value).toEqual(logicId);
    });

    it("should setup logic driver from manifest", async () => {
        const driver = await getLogicDriver(manifest, wallet);

        expect(driver).toBeDefined();
        expect(driver).toBeInstanceOf(LogicDriver);
    });
});

const logics = [
    {
        name: "tokenledger",
        isEphemeral: false,
        isPersistent: true,
    },
    {
        name: "lockledger",
        isEphemeral: true,
        isPersistent: true,
    },
];

describe.each(logics)(`${LogicDriver.name} :: $name`, (logic) => {
    const wallet = getWallet();
    const manifest = loadManifestFromFile(logic.name);
    const driver = new LogicDriver({ manifest, signer: wallet });

    describe("constructor", () => {
        it("should throw error if manifest is not provided", () => {
            expect(() => new LogicDriver({ manifest: null!, signer: wallet })).toThrow("Manifest is required.");
        });

        it("should throw error if signer is not provided", () => {
            expect(() => new LogicDriver({ manifest, signer: null! })).toThrow();
        });
    });

    describe(driver.getStorageKey, () => {
        it("should get storage key", async () => {
            const key = driver.getStorageKey(LogicState.Persistent, (b) => b.name("Symbol"));

            expect(key).toBeInstanceOf(StorageKey);
        });

        if (!logic.isEphemeral) {
            it("should throw error if state is not in logic", () => {
                const state = LogicState.Ephemeral;
                expect(() => driver.getStorageKey(state, (b) => b.name("Symbol"))).toThrow(`State "${state}" not found in logic.`);
            });
        }
    });

    describe(driver.isDeployed, () => {
        it("should return true if logic is deployed", async () => {
            const logicId = "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782";
            const mockLogicId = new LogicId(logicId);
            const getLogicSpy = jest.spyOn(driver, "getLogicId").mockResolvedValue(mockLogicId);

            expect(await driver.isDeployed()).toBe(true);
            getLogicSpy.mockRestore();
        });

        it("should return false if logic is not deployed", async () => {
            expect(await driver.isDeployed()).toBe(false);
        });
    });

    describe(driver.getLogicId, () => {
        it("should throw error if logic is not deployed", async () => {
            await expect(driver.getLogicId()).rejects.toThrow("Logic id not found. This can happen if the logic is not deployed.");
        });

        it("should get logic id", async () => {
            const interaction = {
                hash: bytesToHex(randomBytes(32)),
                confirmation: {
                    operations: [
                        {
                            type: OpType.LogicDeploy,
                            status: OperationStatus.Ok,
                            payload: {
                                error: "0x",
                                logic_id: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                            },
                        },
                    ],
                },
            };
            driver["deployIxResponse"] = new InteractionResponse(interaction as Interaction, wallet.getProvider());

            const logicId = await driver.getLogicId();
            expect(logicId.value).toEqual(interaction.confirmation.operations[0].payload.logic_id);

            driver["deployIxResponse"] = undefined;
        });
    });

    describe("endpoints", () => {
        it.each(manifest.elements.filter((element) => element.kind === ElementType.Routine))('should setup endpoint "$data.name"', (element) => {
            const routine = driver.endpoint[element.data.name];

            expect(routine).toBeDefined();
            expect(routine).toBeInstanceOf(Function);
        });
    });
});
