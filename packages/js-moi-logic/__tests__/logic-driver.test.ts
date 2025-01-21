import { ManifestCoder } from "js-moi-manifest";
import { LogicId } from "js-moi-utils";
import { getLogicDriver, LogicDriver } from "../src.ts";
import { getWallet } from "./helpers";
import { loadManifestFromFile } from "./manifests";

// const runNetworkTest = process.env["RUN_NETWORK_TEST"] === "true";

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
        jest.clearAllMocks();
    });

    it("should setup driver from logic address", async () => {
        const driver = await getLogicDriver(new LogicId(logicId).getAddress(), wallet);

        expect(driver).toBeInstanceOf(LogicDriver);
    });

    it("should setup driver from logic id", async () => {
        const driver = await getLogicDriver(new LogicId(logicId), wallet);

        expect(driver).toBeInstanceOf(LogicDriver);
    });

    it("should setup logic driver from manifest", async () => {
        const driver = await getLogicDriver(manifest, wallet);

        expect(driver).toBeDefined();
        expect(driver).toBeInstanceOf(LogicDriver);
    });
});
