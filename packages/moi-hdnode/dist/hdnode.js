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
const moi_utils_1 = require("moi-utils");
/**
 * HDNode Class
 *
 * This class represents a Hierarchical Deterministic (HD) Node used in
 cryptographic key generation and derivation.
 */
class HDNode {
    node;
    constructor() { }
    /**
     * mnemonicToSeed
     *
     * Converts a mnemonic phrase to a seed buffer using BIP39.
     *
     * @param {string} mnemonic - The mnemonic phrase.
     * @param {string[]} wordlist - The wordlist to use for the mnemonic. (optional)
     * @returns {Promise<Buffer>} The seed buffer.
     * @throws {Error} If an error occurs during the conversion process.
     */
    async mnemonicToSeed(mnemonic, wordlist) {
        try {
            // Convert the mnemonic phrase to entropy
            const entropy = bip39.mnemonicToEntropy(mnemonic, wordlist);
            // Convert entropy to a normalized mnemonic phrase
            const normalizedMnemonic = bip39.entropyToMnemonic(entropy, wordlist);
            // Generate the seed buffer from the normalized mnemonic phrase
            return await bip39.mnemonicToSeed(normalizedMnemonic);
        }
        catch (err) {
            moi_utils_1.ErrorUtils.throwError("Failed to convert mnemonic to seed", moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    /**
     * fromSeed
     *
     * Generates an HDNode from a seed buffer.
     *
     * @param {Buffer} seed - The seed buffer.
     * @param {string} path - The derivation path for the HDNode. (optional)
     * @throws {Error} If an error occurs during the HDNode generation.
     */
    fromSeed(seed, path) {
        try {
            // Generate the master HDNode from the seed buffer
            const masterHdNode = hdkey_1.default.fromMasterSeed(seed, undefined);
            // Derive the child HDNode using the specified path or default path
            this.node = masterHdNode.derive(path ? path : moi_constants_1.MOI_DERIVATION_PATH);
        }
        catch (err) {
            moi_utils_1.ErrorUtils.throwError("Failed to generate HDNode from seed", moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    /**
     * fromExtendedKey
     *
     * Generates an HDNode from an extended key.
     *
     * @param {string} extendedKey - The extended key.
     * @throws {Error} If an error occurs during the HDNode generation.
     */
    fromExtendedKey(extendedKey) {
        try {
            const hdNode = hdkey_1.default.fromExtendedKey(extendedKey, undefined);
            this.node = hdNode.derive(moi_constants_1.MOI_DERIVATION_PATH);
        }
        catch (err) {
            moi_utils_1.ErrorUtils.throwError("Failed to generate HDNode from extended key", moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    /**
     * derivePath
     *
     * Derives a child HDNode from the current HDNode using the specified path.
     *
     * @param {string} path - The derivation path for the child HDNode.
     * @returns {HDKey} The derived child HDNode.
     * @throws {Error} If the HDNode is not initialized.
     */
    derivePath(path) {
        if (!this.node) {
            moi_utils_1.ErrorUtils.throwError("HDNode not initialized", moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        return this.node.derive(path);
    }
    /**
     * publicKey
     *
     * Retrieves the public key associated with the HDNode.
     *
     * @returns {Buffer} The public key.
     */
    publicKey() {
        if (!this.node) {
            moi_utils_1.ErrorUtils.throwError("HDNode not initialized", moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        return this.node._publicKey;
    }
    /**
     * privateKey
     *
     * Retrieves the private key associated with the HDNode.
     *
     * @returns {Buffer} The private key.
     */
    privateKey() {
        if (!this.node) {
            moi_utils_1.ErrorUtils.throwError("HDNode not initialized", moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        if (!this.node.privateKey) {
            moi_utils_1.ErrorUtils.throwError("Private key not available in the HDNode", moi_utils_1.ErrorCode.PROPERTY_NOT_DEFINED);
        }
        return this.node._privateKey;
    }
}
exports.HDNode = HDNode;
