import { hexToBN, IxType } from "moi-utils";
import { JsonRpcProvider } from "../src/jsonrpc-provider"
import { WebSocketProvider } from "../src/websocket-provider"

describe("Test Websocket Provider", () => {
    const address = "0x377a4674fca572f072a8176d61b86d9015914b9df0a57bb1d80fafecce233084";
    let rpcProvider: JsonRpcProvider;
    let wsProvider: WebSocketProvider;

    beforeAll(() => {
        rpcProvider = new JsonRpcProvider("http://localhost:1600")
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
        rpcProvider.sendInteraction({
            type: IxType.ASSET_CREATE,
            sender: address,
            fuel_price: "0x130D41",
            fuel_limit: "0x130D41",
            payload: {
              type: 2,
              symbol: "FOO",
              supply: "0x130D41"
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
        rpcProvider.sendInteraction({
            type: IxType.ASSET_CREATE,
            sender: address,
            fuel_price: "0x130D41",
            fuel_limit: "0x130D41",
            payload: {
              type: 2,
              symbol: "BOO",
              supply: "0x130D41"
            }
        });
    });
});