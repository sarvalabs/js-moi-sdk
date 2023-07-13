import { Buffer } from "buffer";

/**
 * Array-like type representing bytes.
 */
export type Bytes = ArrayLike<number>;

/**
 * Checks if the given value is an integer.
 *
 * @param {number} value - The value to check.
 * @returns {boolean} - Returns true if the value is an integer, otherwise false.
 */
export const isInteger = (value: number) => {
    return (typeof(value) === "number" && value === value && (value % 1) === 0);
}

/**
 * Checks if the given value is a valid byte array.
 *
 * @param {any} value - The value to check.
 * @returns {boolean} - Returns true if the value is a valid byte array, otherwise false.
 */
export const isBytes = (value: any): value is Bytes => {
    if (value == null) { return false; }

    if (value.constructor === Uint8Array) { return true; }
    if (typeof(value) === "string") { return false; }
    if (!isInteger(value.length) || value.length < 0) { return false; }

    for (let i = 0; i < value.length; i++) {
        const v = value[i];
        if (!isInteger(v) || v < 0 || v >= 256) { return false; }
    }
    return true;
}

/**
 * Calculates the length of the data represented by a hexadecimal string.
 *
 * @param {string} data - The hexadecimal string.
 * @returns {number | null} - The length of the data, or null if the input is 
 * not a valid hexadecimal string.
 */
export const hexDataLength = (data: string) => {
    // Check if the input is a valid hexadecimal string and has an even length
    if (!isHexString(data) || (data.length % 2)) {
        return null;
    }

    // Calculate the length of the data excluding the "0x" prefix
    return (data.length - 2) / 2;
}

/**
 * Checks if the given value is a valid hexadecimal string.
 *
 * @param {any} value - The value to check.
 * @param {number} length - Optional. The expected length of the hexadecimal string.
 * @returns {boolean} Returns true if the value is a valid hexadecimal string, otherwise false.
 */
export const isHexString = (value: any, length?: number): boolean => {
    if (typeof(value) !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
        return false
    }
    if (length && value.length !== 2 + 2 * length) { return false; }
    return true;
}

/**
 * Converts a Buffer to a Uint8Array.
 *
 * @param {Buffer} target - The Buffer to convert.
 * @returns {Uint8Array} The Uint8Array representation of the Buffer.
 */
export const bufferToUint8 = (target: Buffer): Uint8Array => {
    return new Uint8Array(target)
}
