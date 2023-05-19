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
                    return _sig.sign(message, this.signingVault);
                }
                default: {
                    throw new Error("invalid signature type");
                }
            }
        }
        throw new Error("signature type cannot be undefiend");
    }
    verify(message, signature, publicKey) {
        let _verificationKey;
        if (typeof publicKey === "string") {
            _verificationKey = Buffer.from(publicKey, 'hex');
        }
        else {
            _verificationKey = publicKey;
        }
        const signatureInBytes = Buffer.from(signature, 'hex');
        switch (signatureInBytes[0]) {
            case 1: {
                if (_verificationKey.length === 32) {
                    _verificationKey = Buffer.concat([Buffer.from([0x03]), _verificationKey]);
                }
                const sigLength = signatureInBytes[1];
                const _sig = this.signingAlgorithms["ecdsa_secp256k1"];
                return _sig.verify(message, signatureInBytes.subarray(2, 2 + sigLength), _verificationKey);
            }
            default: {
                throw new Error("invalid signature");
            }
        }
    }
}
exports.Signer = Signer;
