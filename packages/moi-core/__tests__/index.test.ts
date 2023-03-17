import Core from "../src/index";

describe("Test core methods", () => {
    test("Send interactions", async () => {
        const core: any = new Core("http://localhost:1600/");
        const ixObject = {
            sender: "0x377a4674fca572f072a8176d61b86d9015914b9df0a57bb1d80fafecce233084",
            type: 2,
            fuel_price: "030D40",
            fuel_limit: "030D40",
            payload: {
                type: 2,
                symbol: "POKO",
                supply: "030D41"
            }
        }
      
        const promise = core.sendInteractions(ixObject)

        promise.on("error", (err) => {
            console.log(err);
        }).on("transactionHash", (txHash) => {
            console.log(txHash)
        }).on("receipt", (receipt) => {
            console.log(receipt)
        });

        return promise.then(result => {
            console.log(result)
        }).catch(err => {
            console.log(err)
        })
    })
})
