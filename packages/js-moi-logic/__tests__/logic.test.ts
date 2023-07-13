import erc20 from "../manifests/erc20.json";
import {JsonRpcProvider} from "js-moi-providers";
import {LogicFactory} from "../src/logic-factory";
import { getLogicDriver } from "../src/logic-driver";
import { initializeWallet } from "./utils/utils";
import { Signer } from "js-moi-signer";
import { Wallet } from "js-moi-wallet";

describe("Test Logic Deploy", () => {
    let logicId: string;
    let wallet: Signer;

    test.concurrent("should initialize the wallet", async () => {
        const provider = new JsonRpcProvider("http://localhost:1600/");
        const mnemonic = "disease into limb company taxi unaware collect vehicle upper final problem proof";
        wallet = await initializeWallet(provider, mnemonic);
        expect(wallet).toBeInstanceOf(Wallet);
    })

    test.concurrent("should deploy the erc20 logic", async() => {
        expect(wallet).toBeDefined();

        const factory = new LogicFactory(erc20, wallet);

        const args = [
            "LOGIC-Token", 
            "LOGIC", 
            100000000, 
            "0xffcd8ee6a29ec442dbbf9c6124dd3aeb833ef58052237d521654740857716b34"
        ]

        const response = await factory.deploy("Seeder!", args).send({
            sender: wallet.getAddress(),
            fuelPrice: 1,
            fuelLimit: 2000
        });
        expect(response).toBeDefined();

        const receipt = await response.wait();
        expect(receipt).toBeDefined();

        const result = await response.result();
        expect(result).toBeDefined();
        expect(result.error).not.toBe("0x");

        logicId = result.logic_id;
    });

    test.concurrent("should execute the erc20 routine", async() => {
        expect(logicId).toBeDefined();

        const seeder = "0xffcd8ee6a29ec442dbbf9c6124dd3aeb833ef58052237d521654740857716b34";
        const logicDriver = await getLogicDriver(logicId, wallet);
        const name = await logicDriver.persistentState.get("name")
        expect(name).toBe("LOGIC-Token")

        const response = await logicDriver.routines.BalanceOf([seeder]).send({
            sender: wallet.getAddress(),
            fuelPrice: 1,
            fuelLimit: 2000
        });

        console.log(response)

        const receipt = await response.wait();
        expect(receipt).toBeDefined();

        console.log(receipt)

        const result = await response.result();
        expect(result).toBeDefined();
        expect(result.output.balance).toBe(100000000)

        console.log(result)
    });
})
