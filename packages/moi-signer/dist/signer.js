"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signer = void 0;
const ecdsa_1 = __importDefault(require("./ecdsa"));
const signature_1 = __importDefault(require("./signature"));
class Signer {
    // private signingVault: Wallet
    provider;
    signingAlgorithms;
    constructor(provider) {
        this.provider = provider;
        // this.signingVault = vault
        this.signingAlgorithms = {
            "ecdsa_secp256k1": new ecdsa_1.default()
        };
    }
    getProvider() {
        if (this.provider) {
            return this.provider;
        }
        throw new Error("Provider is not initialized!");
    }
    async getNonce(options) {
        try {
            const provider = this.getProvider();
            return provider.getInteractionCount(this.getAddress(), options);
        }
        catch (err) {
            throw err;
        }
    }
    async sendInteraction(ixObject) {
        try {
            const provider = this.getProvider();
            const sigAlgo = this.signingAlgorithms["ecdsa_secp256k1"];
            const ixRequest = this.signInteraction(ixObject, sigAlgo);
            return await provider.sendInteraction(ixRequest);
        }
        catch (err) {
            throw new Error("Failed to send interaction", err);
        }
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
        sig.unmarshall(signature);
        switch (sig.getSigByte()) {
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
