"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDNode = void 0;
const hdkey_1 = __importDefault(require("hdkey"));
const moi_utils_1 = require("moi-utils");
/**
 * HDNode Class
 *
 * This class represents a Hierarchical Deterministic (HD) Node used in
 cryptographic key generation and derivation.
 */
class HDNode {
    node;
    constructor(node) {
        this.node = node;
    }
    /**
     * fromSeed
     *
     * Generates an HDNode from a seed buffer.
     *
     * @param {Buffer} seed - The seed buffer.
     * @throws {Error} If an error occurs during the HDNode generation.
     */
    static fromSeed(seed) {
        try {
            // Generate the master HDNode from the seed buffer
            const node = hdkey_1.default.fromMasterSeed(seed, undefined);
            // Derive the child HDNode using the specified path or default path
            return new HDNode(node);
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
    static fromExtendedKey(extendedKey) {
        try {
            const node = hdkey_1.default.fromExtendedKey(extendedKey, undefined);
            return new HDNode(node);
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
     * @returns {HDNode} The derived child HDNode.
     * @throws {Error} If the HDNode is not initialized.
     */
    derivePath(path) {
        if (!this.node) {
            moi_utils_1.ErrorUtils.throwError("HDNode not initialized", moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        const childNode = this.node.derive(path);
        return new HDNode(childNode);
    }
    /**
     * deriveChild
     *
     * Derives a child HDNode from the current HDNode using the specified index.
     *
     * @param {number} index - The child index.
     * @returns {HDNode} The derived child HDNode.
     * @throws {Error} If the HDNode is not initialized.
     */
    deriveChild(index) {
        if (!this.node) {
            moi_utils_1.ErrorUtils.throwError('HDNode not initialized', moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        const childNode = this.node.deriveChild(index);
        return new HDNode(childNode);
    }
    /**
     * publicKey
     *
     * Retrieves the public key associated with the HDNode.
     *
     * @returns {Buffer} The public key.
     * @throws {Error} If the HDNode is not initialized.
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
     * @throws {Error} If the HDNode is not initialized or private key is not available.
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
