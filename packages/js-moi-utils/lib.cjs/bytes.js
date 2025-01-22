"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeText = exports.encodeText = exports.randomBytes = exports.bufferToUint8 = exports.isHexString = exports.hexDataLength = exports.isBytes = exports.isInteger = void 0;
/**
 * Checks if the given value is an integer.
 *
 * @param value - The value to check.
 * @returns Returns true if the value is an integer, otherwise false.
 */
const isInteger = (value) => {
    return typeof value === "number" && value === value && value % 1 === 0;
};
exports.isInteger = isInteger;
/**
 * Checks if the given value is a valid byte array.
 *
 * @param {any} value - The value to check.
 * @returns {boolean} - Returns true if the value is a valid byte array, otherwise false.
 */
const isBytes = (value) => {
    if (value == null) {
        return false;
    }
    if (value.constructor === Uint8Array) {
        return true;
    }
    if (typeof value === "string") {
        return false;
    }
    if (!(0, exports.isInteger)(value.length) || value.length < 0) {
        return false;
    }
    for (let i = 0; i < value.length; i++) {
        const v = value[i];
        if (!(0, exports.isInteger)(v) || v < 0 || v >= 256) {
            return false;
        }
    }
    return true;
};
exports.isBytes = isBytes;
/**
 * Calculates the length of the data represented by a hexadecimal string.
 *
 * @param {string} data - The hexadecimal string.
 * @returns {number | null} - The length of the data, or null if the input is
 * not a valid hexadecimal string.
 */
const hexDataLength = (data) => {
    // Check if the input is a valid hexadecimal string and has an even length
    if (!(0, exports.isHexString)(data) || data.length % 2) {
        return null;
    }
    // Calculate the length of the data excluding the "0x" prefix
    return (data.length - 2) / 2;
};
exports.hexDataLength = hexDataLength;
/**
 * Checks if the given value is a valid hexadecimal string.
 *
 * @param {any} value - The value to check.
 * @param {number} length - Optional. The expected length of the hexadecimal string.
 * @returns {boolean} Returns true if the value is a valid hexadecimal string, otherwise false.
 */
const isHexString = (value, length) => {
    if (typeof value !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
        return false;
    }
    if (length && value.length !== 2 + 2 * length) {
        return false;
    }
    return true;
};
exports.isHexString = isHexString;
/**
 * Converts a Buffer to a Uint8Array.
 *
 * @param {Buffer} target - The Buffer to convert.
 * @returns {Uint8Array} The Uint8Array representation of the Buffer.
 */
const bufferToUint8 = (target) => {
    return new Uint8Array(target);
};
exports.bufferToUint8 = bufferToUint8;
/**
 * Generates a Uint8Array of the specified size filled with cryptographically secure random bytes.
 *
 * @param size - The number of random bytes to generate.
 * @returns A Uint8Array containing the generated random bytes.
 */
const randomBytes = (size) => {
    return globalThis.crypto.getRandomValues(new Uint8Array(size));
};
exports.randomBytes = randomBytes;
/**
 * Encodes a given text string into a Uint8Array using the TextEncoder API.
 *
 * @param text - The text string to be encoded.
 * @returns A Uint8Array containing the encoded text.
 */
const encodeText = (text) => {
    return new TextEncoder().encode(text);
};
exports.encodeText = encodeText;
/**
 * Decodes a Uint8Array into a string using the TextDecoder API.
 *
 * @param data - The Uint8Array to decode.
 * @returns The decoded string.
 */
const decodeText = (data) => {
    return new TextDecoder().decode(data);
};
exports.decodeText = decodeText;
//# sourceMappingURL=bytes.js.map