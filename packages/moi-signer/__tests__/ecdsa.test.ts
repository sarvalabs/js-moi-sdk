import { Wallet } from "moi-wallet";
import { Signer } from "../src";

describe("Test ECDSA Signing with SECP256k1 Curve", () => {
    describe("Signing raw message", () => {
        it("should signing the message `hello, world`", async() => {
            const __vault = new Wallet();
            await __vault.fromMnemonic("unlock element young void mass casino suffer twin earth drill aerobic tooth", undefined);
            
            const _signer = new Signer(__vault);
            const _message = Buffer.from("hello, world");
            const _signature = _signer.sign(_message, _signer.signingAlgorithms["ecdsa_secp256k1"]);

            expect(_signature).toBe("01473045022100acbfe695e7dbd3c5361238478327813b01feda3a9e7e7ca2867ab873f4444d20022079f41e1cf3fc2816fbb194186162c800dffc041a4eef9a8ba9b1f3c3ff2e399f");
        })
    })
})
