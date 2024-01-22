import { AssetStandard, hexToBN, IxType } from "js-moi-utils";
import { Signer } from "js-moi-signer";
import { JsonRpcProvider } from "../src/jsonrpc-provider"
import { WebSocketProvider, WebSocketEvents } from "../src/websocket-provider"
import { initializeWallet } from "./utils/utils";

describe("Test Websocket Provider", () => {
    const address = "0x2c1fe83b9d6a5c81c5e6d4da20d2d0509ac3c1eb154e5f5b1fc7d5fd4a03b9cc";
    const mnemonic = "cushion tissue toss meadow glare math custom because inform describe vacant combine";
    let signer: Signer;
    let nonce: number | bigint;
    let wsProvider: WebSocketProvider;

    beforeAll(async () => {
        const rpcProvider = new JsonRpcProvider("http://localhost:1600")
        signer = await initializeWallet(rpcProvider, mnemonic);
        nonce = await signer.getNonce();
        wsProvider = new WebSocketProvider("ws://localhost:1600/ws", {
            reconnectOptions: {
                auto: true,
                delay: 5000
            }
        })
    })
    
    it('should receive new tesseracts', (done) => {
        // subscribe to new tesseracts
        wsProvider.on(WebSocketEvents.ALL_TESSERACTS, (tesseract) => {
            // check if the tesseract height has increased
            expect(hexToBN(tesseract.header.height)).toBeGreaterThan(0);
            done();
        });

        // create a new tesseract
        signer.sendInteraction({
            type: IxType.ASSET_CREATE,
            nonce: nonce,
            fuel_price: 1,
            fuel_limit: 200,
            payload: {
                standard: AssetStandard.MAS0,
                symbol: "FOO",
                supply: 1248577
            }
        });
    });


    it('should receive new tesseracts based on address', (done) => {
        // subscribe to new tesseracts
        wsProvider.on(address, (tesseract) => {
            // check if the tesseract height has increased
            expect(hexToBN(tesseract.header.height)).toBeGreaterThan(1);
            done();
        });

        // create a new tesseract
        signer.sendInteraction({
            type: IxType.ASSET_CREATE,
            nonce: Number(nonce) + 1,
            fuel_price: 1,
            fuel_limit: 200,
            payload: {
                standard: AssetStandard.MAS0,
                symbol: "BOO",
                supply: 1248577
            }
        });
    });

    test("should receive a new pending interaction hash", (done) => {
        wsProvider.on(WebSocketEvents.PENDING_INTERACTIONS, (hash) => {
            expect(hash).toBeTruthy();
            expect(typeof hash).toBe("string");
            done();
        })

        // will create a new interaction
        signer.sendInteraction({
            type: IxType.ASSET_CREATE,
            nonce: Number(nonce) + 1,
            fuel_price: 1,
            fuel_limit: 200,
            payload: {
                standard: AssetStandard.MAS0,
                symbol: "BAZ",
                supply: 1248577
            }
        });
    });
});
