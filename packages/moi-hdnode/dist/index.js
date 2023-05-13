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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDNode = void 0;
const hdkey_1 = __importDefault(require("hdkey"));
const bip39 = __importStar(require("bip39"));
const moi_constants_1 = require("moi-constants");
class HDNode {
    node;
    constructor() { }
    async mnemonicToSeed(mnemonic, wordlist) {
        try {
            mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, wordlist), wordlist);
            return await bip39.mnemonicToSeed(mnemonic, undefined);
        }
        catch (err) {
            throw err;
        }
    }
    fromSeed(seed) {
        try {
            const masterHdNode = hdkey_1.default.fromMasterSeed(seed, undefined);
            this.node = masterHdNode.derive(moi_constants_1.MOI_DERIVATION_PATH);
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    fromExtendedKey(extendedKey) {
        try {
            const hdNode = hdkey_1.default.fromExtendedKey(extendedKey, undefined);
            this.node = hdNode.derive(moi_constants_1.MOI_DERIVATION_PATH);
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    derivePath(path) {
        if (!this.node) {
            throw new Error("HDNode not initialized");
        }
        return this.node.derive(path);
    }
    publicKey() {
        return this.node._publicKey;
    }
    privateKey() {
        return this.node._privateKey;
    }
}
exports.HDNode = HDNode;
