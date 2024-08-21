import { Signer } from "js-moi-signer";
import { AssetStandard, hexToBN, TxType } from "js-moi-utils";
import { JsonRpcProvider } from "../src.ts/jsonrpc-provider";
import { WebSocketEvents, WebSocketProvider } from "../src.ts/websocket-provider";
import { initializeWallet } from "./utils/utils";

describe("Test Websocket Provider", () => {
    const address = "0xa2b800066048596c9b207585e1f342823a50c91260cef3e33afccbdde8cd0495";
    const mnemonic = "barely pioneer dawn hair prize enhance twist guard review goddess educate retreat";
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
            // check if the tesseract is defined
            expect(tesseract).toBeDefined();
            done();
        });

        // create a new tesseract
        signer.sendInteraction({
            nonce: nonce,
            fuel_price: 1,
            fuel_limit: 200,
            transactions: [
                {
                    type: TxType.ASSET_CREATE,
                    payload: {
                        standard: AssetStandard.MAS0,
                        symbol: "FOO",
                        supply: 1248577
                    }
                }
            ]
        });
    });


    it('should receive new tesseracts based on address', (done) => {
        // subscribe to new tesseracts
        wsProvider.on(address, (tesseract) => {
            // check if the tesseract height has increased
            expect(tesseract).toBeDefined();
            const participant = tesseract.participants.find(p => 
                p.address === address
            );

            expect(participant).toBeDefined()
            expect(hexToBN(participant.height)).toBeGreaterThan(1)
            done();
        });

        // create a new tesseract
        signer.sendInteraction({
            nonce: Number(nonce) + 1,
            fuel_price: 1,
            fuel_limit: 200,
            transactions: [
                {
                    type: TxType.ASSET_CREATE,
                    payload: {
                        standard: AssetStandard.MAS0,
                        symbol: "BOO",
                        supply: 1248577
                    }
                }
            ]
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
            nonce: Number(nonce) + 2,
            fuel_price: 1,
            fuel_limit: 200,
            transactions: [
                {
                    type: TxType.ASSET_CREATE,
                    payload: {
                        standard: AssetStandard.MAS0,
                        symbol: "BAZ",
                        supply: 1248577
                    }
                }
            ]
        });
    });
});
