import { bytesToHex, ErrorCode, ErrorUtils, hexToBytes, isHex, isNullBytes } from "js-moi-utils";
import { setFlag } from "./flags";
import { IdentifierTag } from "./identifier-tag";
import { ParticipantId } from "./participant-id";
export class Identifier {
    bytes;
    constructor(value) {
        if (value.length !== 32) {
            ErrorUtils.throwArgumentError("Invalid byte length for identifier. Expected 32 bytes.", "value", value);
        }
        this.bytes = value;
    }
    /**
     * Retrieves the tag associated with the identifier.
     *
     * @returns {IdentifierTag} The tag of the identifier, created from the first byte of the identifier's byte array.
     */
    getTag() {
        return new IdentifierTag(this.bytes[0]);
    }
    /**
     * Retrieves the flags from the identifier.
     *
     * @returns {number} The flags as a number.
     */
    getFlags() {
        return this.bytes[1];
    }
    /**
     * Retrieves metadata from the identifier.
     *
     * @returns {Uint8Array} A Uint8Array containing the metadata extracted from the identifier.
     */
    getMetadata() {
        return new Uint8Array([this.bytes[2], this.bytes[3]]);
    }
    /**
     * Generates a fingerprint from the identifier bytes.
     *
     * The fingerprint is a subset of the identifier's byte array,
     * starting from the 5th byte (index 4) up to the 28th byte (index 27).
     *
     * @returns {Uint8Array} A new Uint8Array containing the fingerprint bytes.
     */
    getFingerprint() {
        return new Uint8Array(this.bytes.slice(4, 28));
    }
    getVariantBytes() {
        return new Uint8Array(this.bytes.slice(28));
    }
    /**
     * Retrieves the variant from the identifier bytes.
     *
     * This method extracts a slice of the `bytes` array starting from the 28th byte
     * and interprets it as an unsigned 32-bit integer in big-endian order.
     *
     * @returns {number} The variant as an unsigned 32-bit integer.
     */
    getVariant() {
        return new DataView(this.getVariantBytes().buffer).getUint32(0, false);
    }
    /**
     * Checks if the identifier is a variant.
     *
     * This method retrieves the variant bytes of the identifier and checks if all bytes are zero.
     *
     * @returns {boolean} `true` if all variant bytes are zero, otherwise `false`.
     */
    isVariant() {
        const variant = this.getVariantBytes();
        return !isNullBytes(variant);
    }
    deriveVariant(variant, set, unset) {
        const derived = new Uint8Array(this.bytes);
        new DataView(derived.buffer.slice(28)).setInt32(0, variant, false);
        for (const flag of set) {
            if (!flag.supports(this.getTag())) {
                ErrorUtils.throwError("Flag not supported for identifier.", ErrorCode.UNSUPPORTED_OPERATION, flag);
            }
            derived[1] = setFlag(derived[1], flag.index, true);
        }
        for (const flag of unset) {
            if (!flag.supports(this.getTag())) {
                ErrorUtils.throwError("Flag not supported for identifier.", ErrorCode.UNSUPPORTED_OPERATION, flag);
            }
            derived[1] = setFlag(derived[1], flag.index, false);
        }
        return new Identifier(derived);
    }
    /**
     * Checks if the current identifier is nil (empty or uninitialized).
     *
     * @returns {boolean} `true` if the identifier is nil, otherwise `false`.
     */
    isNill() {
        return isNullBytes(this.bytes);
    }
    /**
     * Converts the current instance's bytes to a Uint8Array.
     *
     * @returns {Uint8Array} The byte array representation of the instance.
     */
    toBytes() {
        return new Uint8Array(this.bytes);
    }
    toParticipantId() {
        return new ParticipantId(new Uint8Array(this.bytes));
    }
    /**
     * Converts the identifier bytes to a hexadecimal string.
     *
     * @returns {Hex} The hexadecimal representation of the identifier bytes.
     */
    toHex() {
        return bytesToHex(this.bytes);
    }
    /**
     * Create an `Identifier` from a hex string.
     *
     * @param value The hex string to create the `Identifier` from.
     * @returns The `Identifier` created from the hex string.
     */
    static fromHex(value) {
        if (!isHex(value, 32)) {
            ErrorUtils.throwArgumentError("Invalid hex value for identifier. Expected 32 bytes hex string.", "value", value);
        }
        return new Identifier(hexToBytes(value));
    }
}
//# sourceMappingURL=identifier.js.map