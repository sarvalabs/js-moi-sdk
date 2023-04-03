// import { Address } from "moi-utils";
// import { bytesToHex } from "moi-utils";
import { decodeBase64 } from "../../moi-utils/src";
import { JsonRpcProvider } from "../src/jsonrpc-provider";
import { Depolorizer, Document } from "js-polo";
// import { WebSocketProvider } from "../src/websocket-provider";
// import { WebSocketProvider } from "../src/websocket-provider";

describe("Test core methods", () => {
    test("Send interactions", async () => {
        const provider = new JsonRpcProvider("http://localhost:1600/");
      
        // const address: Address = "377a4674fca572f072a8176d61b86d9015914b9df0a57bb1d80fafecce233084";
        // const assetId: AssetId = "0000ab50535b956988c321c39700f550ebb559582e3ef07607aa5b70c6dee10c2944";

        const response = provider.getInteractionReceipt("9ec10f6179497f5e2effe2e3d90fdafc788926d25a7fb7fe10e3cadec9921928")

        // provider.on("block", (result) => {
        //     console.log(result)
        // })

        await response.then(async (response:any) => {
            let data = decodeBase64(response.ExtraData.return_data);
            let depolorizer = new Depolorizer(data);
            let doc: Document = depolorizer.depolorizeDocument();
            let raw = doc.getRaw("balance");

            let depolorizer2 = new Depolorizer(raw.bytes)
            let val = depolorizer2.depolorizeInteger()

            console.log(val)
            
            // console.log(documentDecode())
            
            // await response.wait(response.hash).then(response => {
            //     console.log(response)
            // }).catch(err => {
            //     console.log(err)
            // })
        }).catch(err => {
            console.log(err)
        })

        // await new Promise((resolve, reject) => {
        //     setTimeout(() => {
        //         resolve(0)
        //     }, 50 * 1000)
        // })
    })
})
