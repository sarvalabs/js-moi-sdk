"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
    This module/directory is responsible for handling
    cryptographic activity like signing, encryption/Decryption, verification etc
*/
const Utils = __importStar(require("./utils"));
const sr25519 = __importStar(require("./sr25519"));
const ecdsa = __importStar(require("./ecdsa"));
const Types = __importStar(require("../types/index"));
class Signer {
    signingVault;
    sigAlgorithm;
    constructor(vault, sigAlgo) {
        const sigTypeAtts = Utils.getSigTypeAttributes(sigAlgo);
        if (sigTypeAtts[1] !== vault.curve()) {
            throw new Error("given signature algorithm does not support for this curve");
        }
        this.sigAlgorithm = sigTypeAtts[0];
        this.signingVault = vault;
    }
    Sign(message) {
        switch (this.sigAlgorithm) {
            case Types.SCHNORR: {
                return sr25519.Sign(message, this.signingVault);
            }
            case Types.ECDSA: {
                return ecdsa.Sign(message, this.signingVault);
            }
            default: {
                throw new Error("unsupported signature algorithm");
            }
        }
    }
    Verify(message, signature) {
        switch (this.sigAlgorithm) {
            case Types.SCHNORR: {
                return sr25519.Verify(message, signature, this.signingVault.publicKey());
            }
            case Types.ECDSA: {
                return ecdsa.Verify(message, signature, this.signingVault.publicKey());
            }
            default: {
                throw new Error("unsupported signature algorithm");
            }
        }
    }
}
exports.default = Signer;
