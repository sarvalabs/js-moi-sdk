"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDNode = void 0;
const bip32_1 = require("@scure/bip32");
const buffer_1 = require("buffer");
const js_moi_utils_1 = require("js-moi-utils");
/**
 * This class represents a Hierarchical Deterministic (HD) Node used in
 * cryptographic key generation and derivation.
 */
class HDNode {
    node;
    constructor(node) {
        this.node = node;
    }
    /**
     * Generates an HDNode from a seed buffer.
     *
     * @param {Buffer} seed - The seed buffer.
     * @throws {Error} If an error occurs during the HDNode generation.
     */
    static fromSeed(seed) {
        try {
            // Generate the master HDNode from the seed buffer
            const node = bip32_1.HDKey.fromMasterSeed(seed, undefined);
            // Derive the child HDNode using the specified path or default path
            return new HDNode(node);
        }
        catch (err) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to generate HDNode from seed", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    /**
     * Generates an HDNode from an extended key.
     *
     * @param {string} extendedKey - The extended key.
     * @throws {Error} If an error occurs during the HDNode generation.
     */
    static fromExtendedKey(extendedKey) {
        try {
            const node = bip32_1.HDKey.fromExtendedKey(extendedKey, undefined);
            return new HDNode(node);
        }
        catch (err) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to generate HDNode from extended key", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    /**
     * Derives a child HDNode from the current HDNode using the specified path.
     *
     * @param {string} path - The derivation path for the child HDNode.
     * @returns {HDNode} The derived child HDNode.
     * @throws {Error} If the HDNode is not initialized.
     */
    derivePath(path) {
        if (!this.node) {
            js_moi_utils_1.ErrorUtils.throwError("HDNode not initialized", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        const childNode = this.node.derive(path);
        return new HDNode(childNode);
    }
    /**
     * Derives a child HDNode from the current HDNode using the specified index.
     *
     * @param {number} index - The child index.
     * @returns {HDNode} The derived child HDNode.
     * @throws {Error} If the HDNode is not initialized.
     */
    deriveChild(index) {
        if (!this.node) {
            js_moi_utils_1.ErrorUtils.throwError('HDNode not initialized', js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        const childNode = this.node.deriveChild(index);
        return new HDNode(childNode);
    }
    /**
     * Returns the extended private key associated with this HDNode.
     * @returns The string representation of the extended private key.
     */
    getExtendedPrivateKey() {
        return this.node.privateExtendedKey;
    }
    /**
     * Returns the extended public key for the HDNode.
     * @returns The string representation of the extended public key.
     */
    getExtendedPublicKey() {
        return this.node.publicExtendedKey;
    }
    /**
     * Retrieves the public key associated with the HDNode.
     *
     * @returns {Buffer} The public key.
     * @throws {Error} If the HDNode is not initialized.
     */
    publicKey() {
        if (!this.node) {
            js_moi_utils_1.ErrorUtils.throwError("HDNode not initialized", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        return buffer_1.Buffer.from(this.node.publicKey);
    }
    /**
     * Retrieves the private key associated with the HDNode.
     *
     * @returns {Buffer} The private key.
     * @throws {Error} If the HDNode is not initialized or private key is not available.
     */
    privateKey() {
        if (!this.node) {
            js_moi_utils_1.ErrorUtils.throwError("HDNode not initialized", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        if (!this.node.privateKey) {
            js_moi_utils_1.ErrorUtils.throwError("Private key not available in the HDNode", js_moi_utils_1.ErrorCode.PROPERTY_NOT_DEFINED);
        }
        return buffer_1.Buffer.from(this.node.privateKey);
    }
}
exports.HDNode = HDNode;
//# sourceMappingURL=hdnode.js.map