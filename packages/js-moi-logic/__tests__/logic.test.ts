import { JsonRpcProvider } from "js-moi-providers";
import { Wallet } from "js-moi-wallet";

import { LogicDriver, getLogicDriver } from "../src/logic-driver";
import { LogicFactory } from "../src/logic-factory";

import manifest from "../manifests/erc20.json";

const HOST = "http://localhost:1600/";
const MNEMONIC = "visa security tobacco hood forget rate exhibit habit deny good sister slender";
const INITIAL_SUPPLY = 100000000;
const SYMBOL = "MOI";
const RECEIVER = "0x4cdc9a1430ca00cbaaab5dcd858236ba75e64b863d69fa799d31854e103ddf72";
const DEVIATION_PATH = "m/44'/6174'/0'/0/1";
const PROVIDER = new JsonRpcProvider(HOST);

let wallet: Wallet;

beforeAll(async () => {
    wallet = await Wallet.fromMnemonic(MNEMONIC, DEVIATION_PATH);
    wallet.connect(PROVIDER);
});

it("should initialize the wallet", async () => {
    expect(wallet).toBeInstanceOf(Wallet);
    expect(wallet.getAddress()).toBeDefined();
});

describe("Logic", () => {
    let logicId: string | undefined;

    describe("deploy logic", () => {
        it("should deploy logic without options", async () => {
            const factory = new LogicFactory(manifest, wallet);

            const symbol = SYMBOL;
            const supply = INITIAL_SUPPLY;

            const ix = await factory.deploy("Seed!", symbol, supply);
            
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
            const option = { fuelPrice: 1, fuelLimit: 3000 + Math.floor(Math.random() * 3000) }
            const ix = await factory.deploy("Seed!", symbol, supply, option);
            
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
            if(logicId == null) {
                expect(logicId).toBeDefined();
                return;
            };

            logic = await getLogicDriver(logicId, wallet);
        });

        it("should able to retrieve balance of the account", async () => {
            const { balance } = await logic.routines.BalanceOf(wallet.getAddress());
            
            expect(balance).toBe(INITIAL_SUPPLY);
        });

        it("should return object when multiple values are returned", async () => {
            const values = await logic.routines.DoubleReturnValue(wallet.getAddress());
            const { symbol, supply } = values;

            expect(values).toBeDefined();
            expect(typeof symbol).toBe('string');
            expect(typeof supply).toBe('number');
        });

        it("should able to transfer without option", async () => {
            const amount = Math.floor(Math.random() * 1000);
            const ix = await logic.routines.Transfer(RECEIVER, amount);
            const receipt = await ix.wait();
            const { success } = await ix.result();

            expect(ix.hash).toBeDefined();
            expect(receipt).toBeDefined();
            expect(typeof success).toBe('boolean');
        });

        it("should able to transfer with option", async () => {
            const amount = Math.floor(Math.random() * 1000);
            const option = { fuelPrice: 1, fuelLimit: 1000 + Math.floor(Math.random() * 1000) }
            const ix = await logic.routines.Transfer(RECEIVER, amount, option);
            const receipt = await ix.wait();
            const result = await ix.result();
            const { balance } = await logic.routines.BalanceOf(RECEIVER);

            const { success } = result;

            expect(balance).toBeGreaterThanOrEqual(amount);
            expect(ix.hash).toBeDefined();
            expect(receipt).toBeDefined();
            expect(typeof success).toBe('boolean');
        });

        it("should throw error when logic execution throw error using `result()`", async () => {
            const { balance } = await logic.routines.BalanceOf(wallet.getAddress());
            const amount = balance + 1
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
            const amount = balance + 1
            const ix = await logic.routines.Transfer(RECEIVER, amount);

            try {
                await ix.wait();
            } catch (error) {
                expect(error.message).toBe("insufficient balance for sender");
                expect(error.params.receipt).toBeDefined();
            }
        });

        it("should be able to read from persistent storage", async () => {
            const symbol = await logic.persistentState.get("symbol");
    
            expect(symbol).toBe(SYMBOL);
        });

        it("should throw error when reading from persistent storage with invalid key", async () => {
            const invalidKey = "invalid-key";
            
            expect(async () => {
                await logic.persistentState.get(invalidKey);
            }).rejects.toThrow(`The provided slot "${invalidKey}" does not exist.`);
        });
    });
})
