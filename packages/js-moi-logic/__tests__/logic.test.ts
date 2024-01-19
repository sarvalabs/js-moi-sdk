import { JsonRpcProvider } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { Wallet } from "js-moi-wallet";
import todo from "../manifests/todo.json";
import { getLogicDriver } from "../src/logic-driver";
import { LogicFactory } from "../src/logic-factory";
import { initializeProvider, initializeWallet } from "./utils/utils";

describe("Test Logic Deploy", () => {
    let wallet: Signer;

    test.concurrent("should initialize the wallet", async () => {
        const provider = new JsonRpcProvider("http://localhost:1600/");
        const mnemonic = "disease into limb company taxi unaware collect vehicle upper final problem proof";
        wallet = await initializeWallet(provider, mnemonic);
        expect(wallet).toBeInstanceOf(Wallet);
    })

    test.concurrent("should deploy the Todo contract with routine request options", async() => {
        const provider = initializeProvider();
        const mnemonic = "crisp seed misery heart hire record can lab exchange skirt always that"
        const wallet  = await initializeWallet(provider, mnemonic);

        const factory = new LogicFactory(todo, wallet);

        const response = await factory.deploy("InitOwner!")
        expect(response).toBeDefined();

        const receipt = await response.wait();
        expect(receipt).toBeDefined();

        const result = await response.result();
        expect(result).toBeDefined();
        expect(result.error).not.toBe("0x");

        // logicId = result.logic_id;
    });

    test.concurrent("should deploy the todo routine with routine request options", async() => {
        const provider = initializeProvider();
        const mnemonic = "crisp seed misery heart hire record can lab exchange skirt always that"
        const wallet  = await initializeWallet(provider, mnemonic);

        console.log(wallet.getAddress())

        const factory = new LogicFactory(todo, wallet);

        const response = await factory.deploy("InitOwner!", {
            fuelPrice: 1,
            fuelLimit: 1000
        })
        expect(response).toBeDefined();

        const receipt = await response.wait();
        expect(receipt).toBeDefined();

        const result = await response.result();
        expect(result).toBeDefined();
        expect(result.error).not.toBe("0x");
    });

    test.concurrent("show able to insert add without routine options", async() => {
        const logicId = "0x080000c613b3d1ec878c2879f9e122e795733bb7e98298af3080256466ab133407fce6"
        const provider = initializeProvider();
        const mnemonic = "crisp seed misery heart hire record can lab exchange skirt always that"
        const wallet  = await initializeWallet(provider, mnemonic);

        const logicDriver = await getLogicDriver(logicId, wallet);

        const title = `Todo ${Math.floor(Math.random() * 1000)}`
        const response = await logicDriver.routines.AddTodo(title)

        const receipt = await response.wait();
        expect(receipt).toBeDefined();

        const result = await response.result();
        expect(result).toBeDefined();
    });

    test.concurrent("show able to retrieve the todo list", async () => {
        const logicId = "0x0800004bf40852ac85851a2f75a657e4bd2b35d753d5ccc1d904c93733511ae2c3111a"
        const provider = initializeProvider();
        const mnemonic = "crisp seed misery heart hire record can lab exchange skirt always that"
        const wallet  = await initializeWallet(provider, mnemonic);

        const logicDriver = await getLogicDriver(logicId, wallet);

        const result = await logicDriver.routines.GetTodos();

        expect("allTodos" in result).toBeTruthy();
    });

    test.concurrent("show able to retrieve the todo list with routine options", async () => {
        const logicId = "0x0800004bf40852ac85851a2f75a657e4bd2b35d753d5ccc1d904c93733511ae2c3111a"
        const provider = initializeProvider();
        const mnemonic = "crisp seed misery heart hire record can lab exchange skirt always that"
        const wallet  = await initializeWallet(provider, mnemonic);

        const logicDriver = await getLogicDriver(logicId, wallet);

        const result = await logicDriver.routines.GetTodos({
            fuelPrice: 1,
            fuelLimit: 1000
        });

        expect("allTodos" in result).toBeTruthy();
    });
 

})
