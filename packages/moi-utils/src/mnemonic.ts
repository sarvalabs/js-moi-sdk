import * as bip39 from 'bip39';
import { ErrorUtils, ErrorCode } from './errors';

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
export const mnemonicToSeed = async(mnemonic: string, wordlist?: string[]): Promise<Buffer> => {
    try {
      // Convert the mnemonic phrase to entropy
      const entropy = bip39.mnemonicToEntropy(mnemonic, wordlist);
      // Convert entropy to a normalized mnemonic phrase
      const normalizedMnemonic = bip39.entropyToMnemonic(entropy, wordlist);
      // Generate the seed buffer from the normalized mnemonic phrase
      return await bip39.mnemonicToSeed(normalizedMnemonic);
    } catch(err) {
      ErrorUtils.throwError(
        "Failed to convert mnemonic to seed", 
        ErrorCode.UNKNOWN_ERROR, 
        { originalError: err }
      );
    }
}


/**
 * isValidSeed
 * 
 * Checks if a seed is valid according to BIP39 standards.
 * 
 * @param {string} seed - The seed to check.
 * @returns {boolean} - True if the seed is valid, false otherwise.
 */
export const isValidSeed = (seed: string): boolean => {
    return bip39.validateMnemonic(seed);
}
