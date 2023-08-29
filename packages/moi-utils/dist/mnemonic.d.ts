/// <reference types="node" />
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
export declare const mnemonicToSeed: (mnemonic: string, wordlist?: string[]) => Promise<Buffer>;
/**
 * isValidSeed
 *
 * Checks if a seed is valid according to BIP39 standards.
 *
 * @param {string} seed - The seed to check.
 * @returns {boolean} - True if the seed is valid, false otherwise.
 */
export declare const isValidSeed: (seed: string) => boolean;
