// import { Wallet } from "moi-wallet";
// import { Signer } from "../src";
// import { JsonRpcProvider } from "moi-providers";
// import { bytesToHex } from "moi-utils";
// import { serializeIxObject } from "../src/serializer";

describe("Test ECDSA Signing and verification with SECP256k1 Curve", () => {
    const sampleMnemonic = "unlock element young void mass casino suffer twin earth drill aerobic tooth"
    const smapleSig = "01473045022100acbfe695e7dbd3c5361238478327813b01feda3a9e7e7ca2867ab873f4444d20022079f41e1cf3fc2816fbb194186162c800dffc041a4eef9a8ba9b1f3c3ff2e399f03";
    const pubKey = "e0c762f9f5e47395559346f4f780329c49eebd0a53cbb69c3cb3117ff4e0e24f";
    const _message = Buffer.from("hello, world");

    describe("Signing raw message", () => {
        it("should signing the message `hello, world`", async() => {
            // console.log(bytesToHex(_message))
            // const provider = new JsonRpcProvider("http://localhost:1600");
            // const signer = new Signer(provider)

            // const __vault = new Wallet();
            // await __vault.fromMnemonic(sampleMnemonic, undefined);
            
            // const _signer = new Signer(__vault);
            // const _signature = _signer.sign(_message, _signer.signingAlgorithms["ecdsa_secp256k1"]);

            // expect(_signature).toBe(smapleSig);
        })
    })

    describe("Verification of multi-hash signature", () => {
        it("should verify the publicKey against the given signature with rawMessage `hello, world`", async() => {
            const _signer = new Signer();
            const verification =  _signer.verify(_message, smapleSig, pubKey);
            expect(verification).toBe(true);
        })
    })
})
