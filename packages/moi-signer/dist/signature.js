"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moi_utils_1 = require("moi-utils");
/**
 * Signature
 *
 * Represents a signature object, storing its components and providing methods for
 * manipulation and serialization.
 */
class Signature {
    prefix;
    digest;
    extraData;
    name;
    constructor(prefix = Buffer.alloc(0), digest = Buffer.alloc(0), extraData = Buffer.alloc(0), signatureName = "") {
        this.prefix = prefix;
        this.digest = digest;
        this.extraData = extraData;
        this.name = signatureName;
    }
    /**
     * unmarshall
     *
     * Unmarshalls a serialized signature into its individual components.
     *
     * @param signature - The serialized signature to be unmarshalled, as a
     * Buffer or hexadecimal string.
     * @throws Error if the signature length or index is invalid.
     */
    unmarshall(signature) {
        const sig = typeof signature === "string" ? Buffer.from(signature, 'hex') : Buffer.from(signature);
        const sigLen = sig[1];
        if (typeof sigLen === "undefined") {
            moi_utils_1.ErrorUtils.throwError("Invalid signature length", moi_utils_1.ErrorCode.INVALID_SIGNATURE);
        }
        const sigIndex = sig[0];
        if (typeof sigIndex !== "number") {
            moi_utils_1.ErrorUtils.throwError("Invalid signature index.", moi_utils_1.ErrorCode.INVALID_SIGNATURE);
        }
        this.prefix = sig.subarray(0, 2);
        this.digest = sig.subarray(2, 2 + sigLen);
        this.extraData = sig.subarray(2 + sigLen);
        this.name = this.getSignatureName(sigIndex);
    }
    /**
     * getDigest
     *
     * Retrieves the digest bytes of the signature.
     *
     * @returns The digest bytes of the signature as a Buffer.
     */
    getDigest() {
        return this.digest;
    }
    /**
     * getSigByte
     *
     * Retrieves the signature byte of the signature prefix.
     *
     * @returns The signature byte as a number.
     * @throws Error if the signature byte is invalid.
     */
    getSigByte() {
        if (typeof this.prefix[0] !== "number") {
            moi_utils_1.ErrorUtils.throwError("Invalid signature byte.", moi_utils_1.ErrorCode.INVALID_SIGNATURE);
        }
        return this.prefix[0];
    }
    /**
     * getName
     *
     * Retrieves the name of the signature algorithm.
     *
     * @returns The name of the signature algorithm as a string.
     */
    getName() {
        return this.name;
    }
    /**
     * getExtra
     *
     * Retrieves the additional data associated with the signature.
     *
     * @returns The extra data as a Buffer.
     */
    getExtra() {
        return this.extraData;
    }
    /**
     * serialize
     *
     * Serializes the signature into a Buffer.
     *
     * @returns The serialized signature as a Buffer.
     * @throws Error if the signature is not initialized.
     */
    serialize() {
        if (this.name === "") {
            moi_utils_1.ErrorUtils.throwError("Signature is not initialized.", moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        const finalSigBytesWithoutExtra = Buffer.concat([this.prefix, this.digest]);
        return Buffer.concat([finalSigBytesWithoutExtra, this.extraData]);
    }
    /**
     * getSignatureName
     *
     * Retrieves the name of the signature algorithm based on the given signature index.
     *
     * @param sigIndex - The signature index used to determine the signature algorithm name.
     * @returns The name of the signature algorithm as a string.
     */
    getSignatureName(sigIndex) {
        switch (sigIndex) {
            case 1: return "ECDSA_S256";
            default: return "";
        }
    }
}
exports.default = Signature;
