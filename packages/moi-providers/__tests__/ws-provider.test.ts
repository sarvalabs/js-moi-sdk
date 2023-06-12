import { AssetKind, hexToBN, IxType } from "moi-utils";
import { Signer } from "moi-signer";
import { JsonRpcProvider } from "../dist/jsonrpc-provider"
import { WebSocketProvider } from "../dist/websocket-provider"
import { initializeWallet } from "./utils/utils";

describe("Test Websocket Provider", () => {
    const address = "0xf350520ebca8c09efa19f2ed13012ceb70b2e710241748f4ac11bd4a9b43949b";
    let signer: Signer;
    let nonce: number | bigint;
    let wsProvider: WebSocketProvider;

    beforeAll(async () => {
        const rpcProvider = new JsonRpcProvider("http://localhost:1600")
        signer = await initializeWallet(rpcProvider)
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
            sender: address,
            fuel_price: 1,
            fuel_limit: 200,
            payload: {
                type: AssetKind.ASSET_KIND_CONTEXT,
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
            sender: address,
            fuel_price: 1,
            fuel_limit: 200,
            payload: {
                type: AssetKind.ASSET_KIND_CONTEXT,
                symbol: "BOO",
                supply: 1248577
            }
        });
    });
});
