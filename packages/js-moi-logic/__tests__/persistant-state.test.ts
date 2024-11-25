import { hexToBytes } from "@zenz-solutions/js-moi-utils";
import { Wallet } from "@zenz-solutions/js-moi-wallet";
import { BN } from "bn.js";

import { JsonRpcProvider } from "@zenz-solutions/js-moi-providers";
import { getLogicDriver, type LogicDriver } from "../src.ts/logic-driver";
import { LogicFactory } from "../src.ts/logic-factory";
import { ArrayIndexAccessor, ClassFieldAccessor, generateStorageKey, LengthAccessor, PropertyAccessor, StorageKey } from "../src.ts/state/accessor";
import { loadManifestFromFile } from "./utils/utils";

const HOST = "<YOUR JSON RPC HOST>";
const MNEMONIC = "<YOUR SEED RECOVERY PHRASE>";
const PATH = "m/44'/6174'/7020'/0/0";
const PROVIDER = new JsonRpcProvider(HOST);

const wallet = Wallet.fromMnemonicSync(MNEMONIC, PATH);
wallet.connect(PROVIDER);

describe("Slot Key Generation", () => {
    test("len(X)", () => {
        const baseSlot = generateStorageKey(0);
        const slot = generateStorageKey(baseSlot, new LengthAccessor());

        expect(slot.hex()).toBe("0x0000000000000000000000000000000000000000000000000000000000000000");
    });

    test(`len(X["foo"])`, () => {
        const base = generateStorageKey(0);
        const slot = generateStorageKey(base, new PropertyAccessor("foo"), new LengthAccessor());

        expect(slot.hex()).toBe("0x4e599175a4aa8d5f5d36b2f2795b30e910fd43bce5c2bfb423fa941690ab188d");
    });

    test(`len(X["boo"])`, () => {
        const base = generateStorageKey(0);
        const slot = generateStorageKey(base, new PropertyAccessor("boo"), new LengthAccessor());

        expect(slot.hex()).toBe("0xd2e32084b705074870ff13c6978cdd2a9f0cccb51cacb25596f590210c4f2903");
    });

    test(`X["foo"][0]`, () => {
        const base = generateStorageKey(0);
        const slot = generateStorageKey(base, new PropertyAccessor("foo"), new ArrayIndexAccessor(8));
        expect(slot.hex()).toBe("0x300464d4748307d603e3807009362bfec9fd1ed997c4f3ec1789d073b0c1c891");
    });

    test(`X["foo"][1]`, () => {
        const base = generateStorageKey(0);
        const slot = generateStorageKey(base, new PropertyAccessor("foo"), new ArrayIndexAccessor(1));

        expect(slot.hex()).toBe("0x300464d4748307d603e3807009362bfec9fd1ed997c4f3ec1789d073b0c1c88a");
    });

    test('accessing index of array', () => {
        const slot = generateStorageKey(1, new ArrayIndexAccessor(10));
        expect(slot.hex()).toBe("0x33e423980c9b37d048bd5fadbd4a2aeb95146922045405accc2f468d0ef96992")
    })

    test(`X["boo"][1]`, () => {
        const base = generateStorageKey(0);
        const slot = generateStorageKey(base, new PropertyAccessor("boo"), new ArrayIndexAccessor(1));

        expect(slot.hex()).toBe("0x6641e86771daecc0b8da74d7e9a376067a35c96bc1177764f1c22f7a363b2a0c");
    });

    test(`Y.a`, () => {
        const base = new StorageKey(new BN("23615463689709273622549015552744609029845592521730629701095228557717941624602", "be"));
        const slot = generateStorageKey(base, new ClassFieldAccessor(0));

        expect(slot.hex()).toBe("0xaa5d421bf085129f130aa77b9de3fce691fa3354f6ffca86b34226f0cbbd2e81");
    });

    test(`len(Y.b)`, () => {
        const base = generateStorageKey(1);
        const slot = generateStorageKey(base, new ClassFieldAccessor(1), new LengthAccessor());

        expect(slot.hex()).toBe("0x33e423980c9b37d048bd5fadbd4a2aeb95146922045405accc2f468d0ef96989");
    });

    test(`len(Y.b[1])`, () => {
        const base = generateStorageKey(1);
        const slot = generateStorageKey(base, new ClassFieldAccessor(1), new ArrayIndexAccessor(1), new LengthAccessor());

        expect(slot.hex()).toBe("0x5b291c649aac2341691a24dac6eab0b73560bbf17c6e858fd962147dcf98c970");
    });

    test(`Y.b[1][1]`, () => {
        const base = generateStorageKey(1);
        const slot = generateStorageKey(base, new ClassFieldAccessor(1), new ArrayIndexAccessor(1), new ArrayIndexAccessor(1));

        expect(slot.hex()).toBe("0xff747fb9e7d6b15138adb83cf0c6b0d7a3fc57b14c6f945083ab1ea199fbc475");
    });

    test("Y.b[0][1]", () => {
        const base = generateStorageKey(1);
        const slot = generateStorageKey(base, new ClassFieldAccessor(1), new ArrayIndexAccessor(0), new ArrayIndexAccessor(1));

        expect(slot.hex()).toBe("0x4de85ac5f19b72de74978dd4c4a312d25097652afadbd3b57b805dcbf3728387");
    });

    test("X[5]", () => {
        const base = generateStorageKey(0);
        const slot = generateStorageKey(base, new PropertyAccessor(5));

        expect(slot.hex()).toBe("0x9f5ed330645660302fde5b2350710a32298ec94764dff274bafcd3e211abef06");
    });

    test("X[5.5]", () => {
        const base = generateStorageKey(0);
        const slot = generateStorageKey(base, new PropertyAccessor(5.5));

        expect(slot.hex()).toBe("0x6330aba8f95edd47f3d9f6ca1884ee11479b2dfcfbdd9e9f0775f7057438eff6");
    });
});

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
