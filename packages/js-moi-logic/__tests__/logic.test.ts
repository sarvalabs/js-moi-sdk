import { JsonRpcProvider } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { Wallet } from "js-moi-wallet";

import { getLogicDriver } from "../src/logic-driver";
import { LogicFactory } from "../src/logic-factory";

import manifest from "../manifests/erc20.json";

describe("Test Logic Deploy", () => {
    const HOST = "http://localhost:1600/";
    const MNEMONIC = "main story burst wonder sausage spice okay pioneer person unaware force bubble";
    const INITIAL_SUPPLY = 100000000;
    const SYMBOL = "MOI";
    const RECEIVER = "0x4cdc9a1430ca00cbaaab5dcd858236ba75e64b863d69fa799d31854e103ddf72";
    const deviationPath: string | undefined = "m/44'/6174'/0'/0/1";
    let signer: Signer;
    let logicId: string | undefined;

    beforeAll(async () => {
        const provider = new JsonRpcProvider(HOST);
        const wallet = new Wallet(provider);

        await wallet.fromMnemonic(MNEMONIC, deviationPath);
        signer = wallet;
    });

    test("should initialize the wallet", async () => {
        expect(signer).toBeInstanceOf(Wallet);
        expect(signer.getAddress()).toBeDefined();
    });

    describe("should deploy contract", () => {
        test("should deploy contract without options", async () => {
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


        test("should deploy contract with options", async () => {
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

    test("should able to retrieve balance of the address", async () => {
        if(logicId == null) {
            throw new Error("logicId is not defined");
        };

        if (signer == null) {
            throw new Error("signer is not defined");
        };

        const logic = await getLogicDriver(logicId, signer);

        if(logic == null) {
            throw new Error("logic is not defined");
        }

        const output = await logic.routines.BalanceOf(signer.getAddress());
        
        expect(output.balance).toBe(INITIAL_SUPPLY);
    });

    describe('should able to do mutating routine call', () => { 
        test("should able to transfer without option", async () => {
            if(logicId == null) {
                throw new Error("logicId is not defined");
            };

            if (signer == null) {
                throw new Error("signer is not defined");
            };

            const logic = await getLogicDriver(logicId, signer);

            if(logic == null) {
                throw new Error("logic is not defined");
            }

            const amount = 1000;
            const ix = await logic.routines.Transfer(RECEIVER, amount);
            const receipt = await ix.wait();

            expect(ix.hash).toBeDefined();
            expect(receipt).toBeDefined();
        })

        test("should able to transfer with option", async () => {
            if(logicId == null) {
                throw new Error("logicId is not defined");
            };

            if (signer == null) {
                throw new Error("signer is not defined");
            };

            const logic = await getLogicDriver(logicId, signer);

            if(logic == null) {
                throw new Error("logic is not defined");
            }

            const amount = Math.floor(Math.random() * 1000);
            const option = { fuelPrice: 1, fuelLimit: 1000 + Math.floor(Math.random() * 1000) }
            const ix = await logic.routines.Transfer(RECEIVER, amount, option);
            const receipt = await ix.wait();
            const output = await logic.routines.BalanceOf(RECEIVER);

            expect(output.balance).toBeGreaterThanOrEqual(amount);
            expect(ix.hash).toBeDefined();
            expect(receipt).toBeDefined();
        })
    });

    test("should be able to read from persistent storage", async () => {
        if(logicId == null) {
            throw new Error("logicId is not defined");
        };

        if (signer == null) {
            throw new Error("signer is not defined");
        };

        const logic = await getLogicDriver(logicId, signer);

        if(logic == null) {
            throw new Error("logic is not defined");
        }

        const symbol = await logic.persistentState.get("symbol");

        expect(symbol).toBe(SYMBOL);
    });
})
