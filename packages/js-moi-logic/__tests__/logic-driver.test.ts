import { ManifestCoder } from "js-moi-manifest";
import { LogicId, LogicState, StorageKey } from "js-moi-utils";
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

describe(LogicDriver, () => {
    const wallet = getWallet();
    const manifest = loadManifestFromFile("tokenledger");

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

        it("should throw error if state is not in logic", () => {
            const state = LogicState.Ephemeral;
            expect(() => driver.getStorageKey(state, (b) => b.name("Symbol"))).toThrow(`State "${state}" not found in logic.`);
        });
    });
});
