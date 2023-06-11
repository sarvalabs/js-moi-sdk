import { JsonRpcProvider } from "moi-providers";
import { Wallet } from "../src/index";

describe("Test Wallet", () => {
    test("Wallet testing", async () => {
        // let testSeed = "behind wish visual father mixture tackle together nurse asset stumble attack erode";
        const wallet = new Wallet()
        await wallet.createRandom()
        console.log(wallet.mnemonic())
    })

    test("Sign Interaction", async () => {
        const mnemonic = "profit behave tribe dash diet stool crawl general country student smooth oxygen";
        const derivationPath = "m/44'/6174'/0'/0/1";
        const ixObject = {
            type: 3,
            nonce: 0,
            sender: "870ad6c5150ea8c0355316974873313004c6b9425a855a06fff16f408b0e0a8b",
            fuel_price: 1,
            fuel_limit: 200,
            payload: {
                type: 3,
                symbol: "MOI",
                supply: 1248577
            }
        }
        const provider = new JsonRpcProvider("http://localhost:1600");
        const wallet = new Wallet(provider);
        await wallet.fromMnemonic(mnemonic, derivationPath)
        const sigAlgo = wallet.signingAlgorithms["ecdsa_secp256k1"]
        const ixArgs = wallet.signInteraction(ixObject, sigAlgo)
        console.log(ixArgs)
    })
})