import { HDKey } from "@scure/bip32";
import { Buffer } from "buffer";
/**
 * This class represents a Hierarchical Deterministic (HD) Node used in
 * cryptographic key generation and derivation.
 */
export declare class HDNode {
    private node;
    constructor(node: HDKey);
    /**
     * Generates an HDNode from a seed buffer.
     *
     * @param {Buffer} seed - The seed buffer.
     * @throws {Error} If an error occurs during the HDNode generation.
     */
    static fromSeed(seed: Buffer): HDNode;
    /**
     * Generates an HDNode from an extended key.
     *
     * @param {string} extendedKey - The extended key.
     * @throws {Error} If an error occurs during the HDNode generation.
     */
    static fromExtendedKey(extendedKey: string): HDNode;
    /**
     * Derives a child HDNode from the current HDNode using the specified path.
     *
     * @param {string} path - The derivation path for the child HDNode.
     * @returns {HDNode} The derived child HDNode.
     * @throws {Error} If the HDNode is not initialized.
     */
    derivePath(path: string): HDNode;
    /**
     * Derives a child HDNode from the current HDNode using the specified index.
     *
     * @param {number} index - The child index.
     * @returns {HDNode} The derived child HDNode.
     * @throws {Error} If the HDNode is not initialized.
     */
    deriveChild(index: number): HDNode;
    /**
     * Returns the extended private key associated with this HDNode.
     * @returns The string representation of the extended private key.
     */
    getExtendedPrivateKey(): string;
    /**
     * Returns the extended public key for the HDNode.
     * @returns The string representation of the extended public key.
     */
    getExtendedPublicKey(): string;
    /**
     * Retrieves the public key associated with the HDNode.
     *
     * @returns {Buffer} The public key.
     * @throws {Error} If the HDNode is not initialized.
     */
    publicKey(): Buffer;
    /**
     * Retrieves the private key associated with the HDNode.
     *
     * @returns {Buffer} The private key.
     * @throws {Error} If the HDNode is not initialized or private key is not available.
     */
    privateKey(): Buffer;
}
//# sourceMappingURL=hdnode.d.ts.map