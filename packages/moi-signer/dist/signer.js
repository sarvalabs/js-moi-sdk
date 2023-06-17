"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signer = void 0;
/*
    This module/directory is responsible for handling
    cryptographic activity like signing and verification
    using different Curves and Algorithms
*/
const ecdsa_1 = __importDefault(require("./ecdsa"));
const signature_1 = __importDefault(require("./signature"));
class Signer {
    signingVault;
    signingAlgorithms;
    constructor(vault) {
        this.signingVault = vault;
        this.signingAlgorithms = {
            "ecdsa_secp256k1": new ecdsa_1.default()
        };
    }
    sign(message, sigAlgo) {
        if (sigAlgo) {
            switch (sigAlgo.sigName) {
                case "ECDSA_S256": {
                    const _sig = this.signingAlgorithms["ecdsa_secp256k1"];
                    const sigBytes = _sig.sign(message, this.signingVault);
                    return sigBytes.Serialize().toString('hex');
                }
                default: {
                    throw new Error("invalid signature type");
                }
            }
        }
        throw new Error("signature type cannot be undefiend");
    }
    verify(message, signature, publicKey) {
        let verificationKey;
        if (typeof publicKey === "string") {
            verificationKey = Buffer.from(publicKey, 'hex');
        }
        else {
            verificationKey = Buffer.from(publicKey);
        }
        const sig = new signature_1.default();
        sig.UnMarshall(signature);
        switch (sig.SigByte()) {
            case 1: {
                const _sig = this.signingAlgorithms["ecdsa_secp256k1"];
                return _sig.verify(message, sig, verificationKey);
            }
            default: {
                throw new Error("invalid signature");
            }
        }
    }
}
exports.Signer = Signer;
