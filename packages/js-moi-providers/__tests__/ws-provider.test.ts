import { AssetStandard, hexToBN, IxType } from "js-moi-utils";
import { Signer } from "js-moi-signer";
import { JsonRpcProvider } from "../dist/jsonrpc-provider"
import { WebSocketProvider,WebSocketEvents } from "../dist/websocket-provider"
import { initializeWallet } from "./utils/utils";

describe("Test Websocket Provider", () => {
    const address = "0xd958d29acc5e108657563b76601a6acae329623e62ce6d7f09c3a575c0df0789";
    const mnemonic = "script swing flight jacket term wise depend wrong wave people strong capable";
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
        wsProvider.on(address, (tesseract) => {
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
