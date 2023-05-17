import { Wallet } from "../src/index";

describe("Test Wallet", () => {
    test("Wallet testing", async () => {
        // let testSeed = "behind wish visual father mixture tackle together nurse asset stumble attack erode";
        const wallet = new Wallet()
        await wallet.createRandom()
        console.log(wallet.mnemonic())
    })
})