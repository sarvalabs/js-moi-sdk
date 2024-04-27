import { Wallet } from "js-moi-wallet";

import { LogicDriver, getLogicDriver } from "../src.ts/logic-driver";
import { LogicFactory } from "../src.ts/logic-factory";

import type { LogicManifest } from "js-moi-manifest";
import { loadManifestFromFile } from "js-moi-manifest/__tests__/utils/helper";
import { JsonRpcProvider } from "js-moi-providers";

const HOST = "http://localhost:1600/";
const MNEMONIC = "laptop hybrid ripple unaware entire cover flag rally deliver adjust nerve ready";
const INITIAL_SUPPLY = 100000000;
const SYMBOL = "MOI";
const RECEIVER = "0x4cdc9a1430ca00cbaaab5dcd858236ba75e64b863d69fa799d31854e103ddf72";
const PATH = "m/44'/6174'/0'/0/1";
const PROVIDER = new JsonRpcProvider(HOST);

let wallet: Wallet;

beforeAll(async () => {
    wallet = await Wallet.fromMnemonic(MNEMONIC, PATH);
    wallet.connect(PROVIDER);
});

it("should initialize the wallet", async () => {
    expect(wallet).toBeInstanceOf(Wallet);
    expect(wallet.getAddress()).toBeDefined();
});

describe("Logic", () => {
    let logicId: string | undefined;
    let manifest: LogicManifest.Manifest;

    beforeAll(async () => {
        manifest = await loadManifestFromFile("../../manifests/tokenledger.json");
    });

    describe("deploy logic", () => {
        it("should deploy logic without options", async () => {
            const factory = new LogicFactory(manifest, wallet);

            const ix = await factory.deploy("Seeder", SYMBOL, INITIAL_SUPPLY);

            const receipt = await ix.wait();
            const result = await ix.result();
            logicId = result.logic_id;

            expect(ix.hash).toBeDefined();
            expect(receipt).toBeDefined();
        });

        it("should deploy logic with options", async () => {
            const factory = new LogicFactory(manifest, wallet);
            const symbol = "MOI";
            const supply = 100000000;
            const option = { fuelPrice: 1, fuelLimit: 3000 + Math.floor(Math.random() * 3000) };
            const ix = await factory.deploy("Seeder", symbol, supply, option);

            const receipt = await ix.wait();
            const result = await ix.result();
            logicId = result.logic_id;

            expect(ix.hash).toBeDefined();
            expect(receipt).toBeDefined();
        });
    });

    describe("logic driver initialized using signer", () => {
        let logic: LogicDriver;

        beforeAll(async () => {
            if (logicId == null) {
                const factory = new LogicFactory(manifest, wallet);
                const ix = await factory.deploy("Seeder", SYMBOL, INITIAL_SUPPLY);
                await ix.wait();
                const result = await ix.result();
                logicId = result.logic_id;
            }

            logic = await getLogicDriver(logicId!, wallet);
        });

        it("should able to retrieve balance of the account", async () => {
            const { balance } = await logic.routines.BalanceOf(wallet.getAddress());

            expect(balance).toBe(INITIAL_SUPPLY);
        });

        it("should able to transfer without option", async () => {
            const amount = Math.floor(Math.random() * 1000);
            const ix = await logic.routines.Transfer(RECEIVER, amount);
            const receipt = await ix.wait();

            expect(ix.hash).toBeDefined();
            expect(receipt).toBeDefined();
        });

        it("should able to transfer with option", async () => {
            const amount = Math.floor(Math.random() * 1000);
            const option = { fuelPrice: 1, fuelLimit: 1000 + Math.floor(Math.random() * 1000) };
            const ix = await logic.routines.Transfer(RECEIVER, amount, option);
            const receipt = await ix.wait();
            const { balance } = await logic.routines.BalanceOf(RECEIVER);

            expect(balance).toBeGreaterThanOrEqual(amount);
            expect(ix.hash).toBeDefined();
            expect(receipt).toBeDefined();
        });

        it("should throw error when logic execution throw error using `result()`", async () => {
            const { balance } = await logic.routines.BalanceOf(wallet.getAddress());
            const amount = balance + 1;
            const ix = await logic.routines.Transfer(RECEIVER, amount);

            try {
                await ix.result();
            } catch (error) {
                expect(error.message).toBe("insufficient balance for sender");
                expect(error.params.receipt).toBeDefined();
            }
        });

        it("should throw error when logic execution throw error using `wait()`", async () => {
            const { balance } = await logic.routines.BalanceOf(wallet.getAddress());
            const amount = balance + 1;
            const ix = await logic.routines.Transfer(RECEIVER, amount);

            try {
                await ix.wait();
            } catch (error) {
                expect(error.message).toBe("insufficient balance for sender");
                expect(error.params.receipt).toBeDefined();
            }
        });

        it("should be able to read from persistent storage", async () => {
            const symbol = await logic.persistentState.get((b) => b.entity("symbol"));

            expect(symbol).toBe(SYMBOL);
        });

        it("should throw error when reading from persistent storage with invalid key", async () => {
            const invalidKey = "invalid-key";

            expect(async () => {
                await logic.persistentState.get((b) => b.entity(invalidKey));
            }).rejects.toThrow(`'${invalidKey}' is not member of persistent state`);
        });
    });

    describe("logic driver initialized using provider", () => {
        let logic: LogicDriver;

        beforeAll(async () => {
            if (logicId == null) {
                const factory = new LogicFactory(manifest, wallet);
                const ix = await factory.deploy("Seeder", SYMBOL, INITIAL_SUPPLY);
                await ix.wait();
                const result = await ix.result();
                logicId = result.logic_id;
            }

            logic = await getLogicDriver(logicId!, PROVIDER);
        });

        it("should able to retrieve balance of the account", async () => {
            const { balance } = await logic.routines.BalanceOf(wallet.getAddress());

            expect(balance).toBeGreaterThan(0);
        });

        it("should throw an exception in mutating routine call", async () => {
            const amount = Math.floor(Math.random() * 1000);

            expect(async () => {
                await logic.routines.Transfer(RECEIVER, amount);
            }).rejects.toThrow("Mutating routine calls require a signer to be initialized.");
        });

        it("should be able to read from persistent storage", async () => {
            const symbol = await logic.persistentState.get((b) => b.entity("symbol"));

            expect(symbol).toBe(SYMBOL);
        });

        it("should throw an exception when reading from persistent storage with invalid key", async () => {
            const invalidKey = "invalid-key";

            expect(async () => {
                await logic.persistentState.get((b) => b.entity(invalidKey));
            }).rejects.toThrow(`'${invalidKey}' is not member of persistent state`);
        });
    });

    let logic: LogicDriver;

    beforeAll(async () => {
        logic = new LogicDriver("0x", manifest, wallet);
    });

    it("should be able return is routine mutable or not", () => {
        const routine = [
            { name: "Transfer", mutable: true },
            { name: "BalanceOf", mutable: false },
        ];

        for (const { name, mutable } of routine) {
            if (name in logic.routines) {
                const isMutable = logic.routines[name].isMutable();
                expect(isMutable).toBe(mutable);
            }
        }
    });
});
