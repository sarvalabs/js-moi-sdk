/*
    This module/directory is responsible for handling 
    cryptographic activity like signing and verification 
    using different Curves and Algorithms
*/
import ECDSA_S256 from "./ecdsa"
import { SigType } from "../types"
import { Wallet } from "moi-wallet"
import Signature from "./signature"

export class Signer {
    private signingVault: Wallet
    signingAlgorithms: any

    constructor(vault?: Wallet) {
        this.signingVault = vault
        this.signingAlgorithms = {
            "ecdsa_secp256k1" : new ECDSA_S256()
        }
    }

    public sign(message: Buffer, sigAlgo: SigType): String {
        if(sigAlgo) {
            switch(sigAlgo.sigName) {
                case "ECDSA_S256": {
                    const _sig = this.signingAlgorithms["ecdsa_secp256k1"];
                    const sigBytes = _sig.sign(message, this.signingVault);
                    return sigBytes.Serialize().toString('hex');
                }
                default: {
                    throw new Error("invalid signature type")
                }
            }
        }
        throw new Error("signature type cannot be undefiend")
    }

    public verify(message: Buffer, signature: string|Buffer, publicKey: string|Buffer): boolean {
        let verificationKey: Buffer;

        if(typeof publicKey === "string") {
            verificationKey = Buffer.from(publicKey, 'hex');
        }else {
            verificationKey = Buffer.from(publicKey)
        }
        
        const sig = new Signature();
        sig.UnMarshall(signature);

        switch(sig.SigByte()) {
            case 1: {
                const _sig = this.signingAlgorithms["ecdsa_secp256k1"];

                return _sig.verify(message, sig, verificationKey);
            }
            default: {
                throw new Error("invalid signature")
            }
        }
    }
}
