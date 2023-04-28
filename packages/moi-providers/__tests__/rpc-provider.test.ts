// // import { Address } from "moi-utils";
// // import { bytesToHex } from "moi-utils";
// // import { decodeBase64 } from "../../moi-utils/src";
// // import { Address } from "moi-utils";
// // import { Address } from "moi-utils";
import { decodeBase64 } from "moi-utils";
import { JsonRpcProvider } from "../src/jsonrpc-provider";
import { Depolorizer, Document } from "js-polo";
// // import { WebSocketProvider } from "../src/websocket-provider";
// // import { WebSocketProvider } from "../src/websocket-provider";

describe("Test core methods", () => {
    test("Send interactions", async () => {
        const provider = new JsonRpcProvider("http://localhost:1600/");
      
        // const address: Address = "377a4674fca572f072a8176d61b86d9015914b9df0a57bb1d80fafecce233084";
        // const assetId: AssetId = "0000ab50535b956988c321c39700f550ebb559582e3ef07607aa5b70c6dee10c2944";

        const response = provider.getInteractionReceipt(
            "0x2b5338efbb99680c26639d19b6fe58cd756ccda082e4db521522b650b2cc9c29"
        )

        // const sampleFunc = (address: Address) => {
        //     console.log(address)
        // }

        // sampleFunc("0x377a4674fca572f072a8176d61b86d15914b9df0a57bb1d80fafecce233084")

        // const add: Address = "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

        // console.log(add)

        // provider.on("block", (result) => {
        //     console.log(result)
        // })

        await response.then(async (response:any) => {
            console.log(response)
            let data = decodeBase64(response.extra_data.outputs);
            console.log(data)
            let depolorizer = new Depolorizer(data);
            let doc: Document = depolorizer.depolorizeDocument();
            let raw = doc.getRaw("ok");

            console.log(doc, raw)

            let depolorizer2 = new Depolorizer(raw.bytes)
            let val = depolorizer2.depolorizeInteger()
            console.log(val)

            // console.log(val)
            
            // console.log(documentDecode())
            
            // await response.result(response.hash).then(response => {
            //     console.log(response)
            // }).catch(err => {
            //     console.log(err)
            // })
        }).catch(err => {
            console.log(err)
        })

        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(0)
            }, 50 * 1000)
        })
    })
})
