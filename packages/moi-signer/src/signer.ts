/*
    This module/directory is responsible for handling 
    cryptographic activity like signing and verification 
    using different Curves and Algorithms
*/
import ECDSA_S256 from "./ecdsa"
import { SigType } from "../types"
import { Wallet } from "moi-wallet"
import Signature from "./signature"
import { bytesToHex, hexToBytes } from "moi-utils"

export class Signer {
    private signingVault: Wallet
    signingAlgorithms: any

    constructor(vault?: Wallet) {
        this.signingVault = vault
        this.signingAlgorithms = {
            "ecdsa_secp256k1" : new ECDSA_S256()
        }
    }

    public sign(message: Uint8Array, sigAlgo: SigType): String {
        if(sigAlgo) {
            switch(sigAlgo.sigName) {
                case "ECDSA_S256": {
                    const _sigAlgo = this.signingAlgorithms["ecdsa_secp256k1"];
                    const sig = _sigAlgo.sign(message, this.signingVault);
                    const sigBytes =  sig.Serialize()
                    return bytesToHex(sigBytes)
                }
                default: {
                    throw new Error("invalid signature type")
                }
            }
        }
        throw new Error("signature type cannot be undefiend")
    }

    public verify(message: Uint8Array, signature: string | Uint8Array, publicKey: String | Uint8Array): boolean {
        let verificationKey: Uint8Array;

        if (typeof publicKey === "string") {
            verificationKey = hexToBytes(publicKey as string)
        } else {
            verificationKey = publicKey as Uint8Array
        }

        const sig = new Signature();
        sig.UnMarshall(signature);

        switch (sig.SigByte()) {
            case 1: {
                const _sig = this.signingAlgorithms["ecdsa_secp256k1"];

                return _sig.verify(message, sig, verificationKey);
            }
            default: {
                throw new Error("Invalid signature");
            }
        }

    }
}
