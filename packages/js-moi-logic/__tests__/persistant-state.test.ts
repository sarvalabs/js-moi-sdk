import { hexToBytes } from "js-moi-utils";
import { Wallet } from "js-moi-wallet";

import { HttpProvider } from "js-moi-providers";
import { getLogicDriver, type LogicDriver } from "../src.ts/logic-driver";
import { LogicFactory } from "../src.ts/logic-factory";
import { loadManifestFromFile } from "./utils/utils";

const HOST = "<YOUR JSON RPC HOST>";
const MNEMONIC = "<YOUR SEED RECOVERY PHRASE>";
const PATH = "m/44'/6174'/7020'/0/0";
const PROVIDER = new HttpProvider(HOST);

const wallet = Wallet.fromMnemonicSync(MNEMONIC, PATH);
wallet.connect(PROVIDER);

describe("Accessing Persistance Storage", () => {
    let logic: LogicDriver;
    const supply = 100000000;
    const symbol = "MOI";

    beforeAll(async () => {
        const manifest = await loadManifestFromFile("../../manifests/tokenledger.json");
        const factory = new LogicFactory(manifest, wallet);
        const ix = await factory.deploy("Seed", symbol, supply);
        const result = await ix.result();

        await new Promise((resolve) => setTimeout(resolve, 3000)); // This is wait time as instantly fetching logic causing logic not found error

        logic = await getLogicDriver(result.logic_id, wallet);
    });

    test("it should return the size of the map", async () => {
        const length = await logic.persistentState.get<number>((accessor) => accessor.entity("Balances"));

        expect(typeof length).toBe("number");
        expect(length).toBe(1);
    });

    test("it should able access value of map", async () => {
        const address = hexToBytes(wallet.address);
        const balance = await logic.persistentState.get<string>((accessor) => accessor.entity("Balances").property(address));

        expect(typeof balance).toBe("number");
        expect(balance).toBe(supply);
    });

    test("it should be able to access primitive in state", async () => {
        const value = await logic.persistentState.get<string>((accessor) => accessor.entity("Symbol"));

        expect(typeof value).toBe("string");
        expect(value).toBe(symbol);
    });
});
