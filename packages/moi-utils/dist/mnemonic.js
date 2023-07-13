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
exports.isValidSeed = exports.mnemonicToSeed = void 0;
const bip39 = __importStar(require("moi-bip39"));
const errors_1 = require("./errors");
/**
 * Converts a mnemonic phrase to a seed buffer using BIP39.
 *
 * @param {string} mnemonic - The mnemonic phrase.
 * @param {string[]} wordlist - The wordlist to use for the mnemonic. (optional)
 * @returns {Promise<Buffer>} The seed buffer.
 * @throws {Error} If an error occurs during the conversion process.
 */
const mnemonicToSeed = async (mnemonic, wordlist) => {
    try {
        // Convert the mnemonic phrase to entropy
        const entropy = bip39.mnemonicToEntropy(mnemonic, wordlist);
        // Convert entropy to a normalized mnemonic phrase
        const normalizedMnemonic = bip39.entropyToMnemonic(entropy, wordlist);
        // Generate the seed buffer from the normalized mnemonic phrase
        return await bip39.mnemonicToSeed(normalizedMnemonic);
    }
    catch (err) {
        errors_1.ErrorUtils.throwError("Failed to convert mnemonic to seed", errors_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
exports.mnemonicToSeed = mnemonicToSeed;
/**
 * Checks if a seed is valid according to BIP39 standards.
 *
 * @param {string} seed - The seed to check.
 * @returns {boolean} - True if the seed is valid, false otherwise.
 */
const isValidSeed = (seed) => {
    return bip39.validateMnemonic(seed);
};
exports.isValidSeed = isValidSeed;
