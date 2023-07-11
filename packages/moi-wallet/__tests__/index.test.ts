import { JsonRpcProvider } from "moi-providers";
import { AssetStandard } from "moi-utils";
import { Wallet } from "../src/index";

describe("Test Wallet", () => {
    let wallet: Wallet;

    beforeAll(async () => {
        const mnemonic = "profit behave tribe dash diet stool crawl general country student smooth oxygen";
        const derivationPath = "m/44'/6174'/0'/0/1";
        const provider = new JsonRpcProvider("http://localhost:1600");
        wallet = new Wallet(provider);
        await wallet.fromMnemonic(mnemonic, derivationPath);
    });

    test("Sign Message", async () => {
        const message = "Hello, MOI";
        const sigAlgo = wallet.signingAlgorithms["ecdsa_secp256k1"];
        const signedMsg = wallet.sign(Buffer.from(message), sigAlgo);
        expect(signedMsg).toBe("0146304402201546497d46ed2ad7b1b77d1cdf383a28d988197bcad268be7163ebdf2f70645002207768e4225951c02a488713caf32d76ed8ea0bf3d7706128c59ee01788aac726402");
    });

    test("Sign Interaction", async () => {
        const ixObject = {
            type: 3,
            nonce: 0,
            sender: "870ad6c5150ea8c0355316974873313004c6b9425a855a06fff16f408b0e0a8b",
            fuel_price: 1,
            fuel_limit: 200,
            payload: {
                standard: AssetStandard.MAS0,
                symbol: "SIG",
                supply: 1248577
            }
        }
        const sigAlgo = wallet.signingAlgorithms["ecdsa_secp256k1"]
        const ixArgs = wallet.signInteraction(ixObject, sigAlgo)
        expect(ixArgs).toEqual({
            ix_args: "0e9f0203131696049608900c900c930ca30cb60c03870ad6c5150ea8c0355316974873313004c6b9425a855a06fff16f408b0e0a8b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c80e7f06336363616160534947130d41",
            signature: "0147304502210089d5c9125fbc605eaa7c51ba1157ed774896cc02483992bb9b3180555ba20c1a02202aad27b8c6ce498a9ce6167924b6286fb13865ec9d9e3767d32b8c6a250b3e9e02"
        })
    });
})
