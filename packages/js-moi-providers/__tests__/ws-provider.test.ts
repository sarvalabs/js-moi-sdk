import { AssetStandard, hexToBN, IxType } from "js-moi-utils";
import { Signer } from "js-moi-signer";
import { JsonRpcProvider } from "../dist/jsonrpc-provider"
import { WebSocketProvider } from "../dist/websocket-provider"
import { initializeWallet } from "./utils/utils";

describe("Test Websocket Provider", () => {
    const address = "0xd210e094cd2432ef7d488d4310759b6bd81a0cda35a5fcce3dab87c0a841bdba";
    const mnemonic = "disease into limb company taxi unaware collect vehicle upper final problem proof";
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
});
