"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIdentifier = exports.BaseIdentifier = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const flags_1 = require("./flags");
const identifier_tag_1 = require("./identifier-tag");
class BaseIdentifier {
    value;
    constructor(value) {
        value = value instanceof Uint8Array ? value : (0, js_moi_utils_1.hexToBytes)(value);
        if (value.length !== 32) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid identifier length. Expected 32 bytes.", "value", value);
        }
        this.value = value;
    }
    /**
     * Generates a fingerprint for the identifier.
     *
     * The fingerprint is a subset of the byte representation of the identifier,
     * starting from the 5th byte (index 4) and ending at the 28th byte (index 27).
     *
     * @returns {Uint8Array} The fingerprint as a Uint8Array.
     */
    getFingerprint() {
        return this.toBytes().slice(4, 28);
    }
    /**
     * Retrieves the tag associated with the current identifier.
     *
     * @returns {IdentifierTag} The tag of the identifier.
     */
    getTag() {
        return BaseIdentifier.getTag(this.value);
    }
    /**
     * Retrieves the variant number from the identifier's value.
     *
     * The variant is extracted from a specific slice of the identifier's value,
     * starting at byte 28 and interpreted as a 32-bit unsigned integer in big-endian order.
     *
     * @returns {number} The variant number.
     */
    getVariant() {
        const blob = new Uint8Array(this.value.slice(28));
        return new DataView(blob.buffer).getUint32(0, false);
    }
    /**
     * Checks if the current identifier has the specified flag.
     *
     * @param flag - The flag to check against the identifier.
     * @returns `true` if the identifier has the specified flag, otherwise `false`.
     */
    hasFlag(flag) {
        return flag.supports(this.getTag()) || (0, flags_1.getFlag)(this.value[1], flag.index);
    }
    /**
     * Converts the current value to a byte array.
     *
     * @returns {Uint8Array} A new Uint8Array containing the bytes of the current value.
     */
    toBytes() {
        return this.value.slice();
    }
    /**
     * Converts the identifier value to a hexadecimal string.
     *
     * @returns {Hex} The hexadecimal representation of the identifier value.
     */
    toHex() {
        return (0, js_moi_utils_1.bytesToHex)(this.value);
    }
    toString() {
        return this.toHex();
    }
    toJSON() {
        return this.toString();
    }
    /**
     * Retrieves the tag from the given identifier value.
     *
     * @param value - The identifier value as a Uint8Array. Must be 32 bytes in length.
     * @returns An instance of IdentifierTag representing the tag of the identifier.
     * @throws {Error} If the length of the identifier value is not 32 bytes.
     */
    static getTag(value) {
        if (value.length !== 32) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid identifier length. Expected 32 bytes.", "value", value);
        }
        return new identifier_tag_1.IdentifierTag(value[0]);
    }
}
exports.BaseIdentifier = BaseIdentifier;
/**
 * Checks if the given value is an identifier.
 *
 * @param value - The value to check.
 * @returns True if the value is an instance of `BaseIdentifier`, otherwise false.
 */
const isIdentifier = (value) => {
    return value instanceof BaseIdentifier;
};
exports.isIdentifier = isIdentifier;
//# sourceMappingURL=base-identifier.js.map