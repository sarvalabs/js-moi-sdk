/*
    This module/directory is responsible for handling 
    cryptographic activity like signing and verification 
    using different Curves and Algorithms
*/
import ECDSA_S256 from "./ecdsa"
import { SigType } from "../types"
import { Wallet } from "moi-wallet"

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
                    return _sig.sign(message, this.signingVault);
                }
                default: {
                    throw new Error("invalid signature type")
                }
            }
        }
        throw new Error("signature type cannot be undefiend")
    }

    public verify(message: Buffer, signature: string, publicKey: string|Buffer): boolean {
        let _verificationKey;
        if(typeof publicKey === "string") {
            _verificationKey = Buffer.from(publicKey, 'hex');
        }else {
            _verificationKey = publicKey;
        }

        const signatureInBytes = Buffer.from(signature, 'hex')
        switch(signatureInBytes[0]) {
            case 1: {
                if(_verificationKey.length === 32) {
                    _verificationKey = Buffer.concat([Buffer.from([0x03]), _verificationKey])
                }
                const sigLength = signatureInBytes[1];
                const _sig = this.signingAlgorithms["ecdsa_secp256k1"];
                return _sig.verify(message, signatureInBytes.subarray(2,2+sigLength), _verificationKey);
            }
            default: {
                throw new Error("invalid signature")
            }
        }
    }
}
