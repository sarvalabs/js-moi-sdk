/// <reference types="node" />
import HDKey from "hdkey";
/**
 * HDNode Class
 *
 * This class represents a Hierarchical Deterministic (HD) Node used in
 cryptographic key generation and derivation.
 */
export declare class HDNode {
    private node;
    constructor();
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
    mnemonicToSeed(mnemonic: string, wordlist?: string[]): Promise<Buffer>;
    /**
     * fromSeed
     *
     * Generates an HDNode from a seed buffer.
     *
     * @param {Buffer} seed - The seed buffer.
     * @param {string} path - The derivation path for the HDNode. (optional)
     * @throws {Error} If an error occurs during the HDNode generation.
     */
    fromSeed(seed: Buffer, path?: string): void;
    /**
     * fromExtendedKey
     *
     * Generates an HDNode from an extended key.
     *
     * @param {string} extendedKey - The extended key.
     * @throws {Error} If an error occurs during the HDNode generation.
     */
    fromExtendedKey(extendedKey: string): void;
    /**
     * derivePath
     *
     * Derives a child HDNode from the current HDNode using the specified path.
     *
     * @param {string} path - The derivation path for the child HDNode.
     * @returns {HDKey} The derived child HDNode.
     * @throws {Error} If the HDNode is not initialized.
     */
    derivePath(path: string): HDKey;
    /**
     * publicKey
     *
     * Retrieves the public key associated with the HDNode.
     *
     * @returns {Buffer} The public key.
     */
    publicKey(): Buffer;
    /**
     * privateKey
     *
     * Retrieves the private key associated with the HDNode.
     *
     * @returns {Buffer} The private key.
     */
    privateKey(): Buffer;
}
