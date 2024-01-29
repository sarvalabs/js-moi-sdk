import { JsonRpcProvider } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { Wallet } from "js-moi-wallet";

import { LogicDriver, getLogicDriver } from "../src/logic-driver";
import { LogicFactory } from "../src/logic-factory";

import manifest from "../manifests/erc20.json";

const HOST = "http://localhost:1600/";
const MNEMONIC = "main story burst wonder sausage spice okay pioneer person unaware force bubble";
const INITIAL_SUPPLY = 100000000;
const SYMBOL = "MOI";
const RECEIVER = "0x4cdc9a1430ca00cbaaab5dcd858236ba75e64b863d69fa799d31854e103ddf72";
const deviationPath: string | undefined = "m/44'/6174'/0'/0/1";
const provider = new JsonRpcProvider(HOST);

let signer: Signer;

beforeAll(async () => {
    const wallet = new Wallet(provider);
    await wallet.fromMnemonic(MNEMONIC, deviationPath);
    signer = wallet;
});

it("should initialize the wallet", async () => {
    expect(signer).toBeInstanceOf(Wallet);
    expect(signer.getAddress()).toBeDefined();
});

describe("Logic", () => {
    let logicId: string | undefined;

    describe("deploy contract", () => {
        it("should deploy contract without options", async () => {
            const factory = new LogicFactory(manifest, signer);

            const symbol = SYMBOL;
            const supply = INITIAL_SUPPLY;

            const ix = await factory.deploy("Seed!", symbol, supply);
            
            const receipt = await ix.wait();
            const result = await ix.result();
            logicId = result.logic_id;

            expect(ix.hash).toBeDefined();
            expect(receipt).toBeDefined();

        });


        it("should deploy contract with options", async () => {
            const factory = new LogicFactory(manifest, signer);
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
                throw new Error("logicId is not defined");
            };

            logic = await getLogicDriver(logicId, signer);
        });

        it("should able to retrieve balance of the account", async () => {
            const output = await logic.routines.BalanceOf(signer.getAddress());
            
            expect(output.balance).toBe(INITIAL_SUPPLY);
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
            const option = { fuelPrice: 1, fuelLimit: 1000 + Math.floor(Math.random() * 1000) }
            const ix = await logic.routines.Transfer(RECEIVER, amount, option);
            const receipt = await ix.wait();
            const output = await logic.routines.BalanceOf(RECEIVER);

            expect(output.balance).toBeGreaterThanOrEqual(amount);
            expect(ix.hash).toBeDefined();
            expect(receipt).toBeDefined();
        });

        it("should throw error when contract execution throw error using `result()`", async () => {
            const { balance } = await logic.routines.BalanceOf(signer.getAddress());
            const amount = balance + 1
            const ix = await logic.routines.Transfer(RECEIVER, amount);

            try {
                await ix.result();
            } catch (error) {
                expect(error.message).toBe("insufficient balance for sender");
                expect(error.params.receipt).toBeDefined();
            }
        });

        it("should throw error when contract execution throw error using `wait()`", async () => {
            const { balance } = await logic.routines.BalanceOf(signer.getAddress());
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
    });
})
