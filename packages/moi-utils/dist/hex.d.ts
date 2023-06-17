import BN from "bn.js";
/**
 * numToHex
 *
 * Converts a number, bigint, or BN instance to a hexadecimal string representation.
 * If the input value is not already a BN instance, it is converted to one.
 * Throws an error if the input value is a negative number.
 *
 * @param {number | bigint | BN} value - The value to convert to a hexadecimal string.
 * @returns {string} - The hexadecimal string representation of the value.
 * @throws {Error} - If the input value is a negative number.
 */
export declare const numToHex: (value: number | bigint | BN) => string;
/**
 * toQuantity
 *
 * Converts a number, bigint, or BN instance to a quantity string representation.
 * The quantity string is prefixed with "0x" and is obtained by calling `numToHex` function.
 *
 * @param {number | bigint | BN} value - The value to convert to a quantity string.
 * @returns {string} - The quantity string representation of the value.
 * @throws {Error} - If an error occurs during the conversion.
 */
export declare const toQuantity: (value: number | bigint | BN) => string;
/**
 * encodeToString
 *
 * Converts a Uint8Array to a hexadecimal string representation.
 *
 * @param {Uint8Array} data - The Uint8Array to encode as a hexadecimal string.
 * @returns {string} - The hexadecimal string representation of the Uint8Array.
 */
export declare const encodeToString: (data: Uint8Array) => string;
/**
 * hexToBytes
 *
 * Converts a hexadecimal string to a Uint8Array.
 *
 * @param {string} str - The hexadecimal string to convert to a Uint8Array.
 * @returns {Uint8Array} - The Uint8Array representation of the hexadecimal string.
 * @throws {Error} - If the input string is not a valid hexadecimal string.
 */
export declare const hexToBytes: (str: string) => Uint8Array;
/**
 * hexToBN
 *
 * Converts a hexadecimal string to a bigint or number.
 * If the resulting value is too large to fit in a number, it is returned as a BigInt.
 * Otherwise, it is returned as a number.
 *
 * @param {string} hex - The hexadecimal string to convert.
 * @returns {bigint | number} - The resulting value as a bigint or number.
 */
export declare const hexToBN: (hex: string) => bigint | number;
/**
 * bytesToHex
 *
 * Converts a Uint8Array to a hexadecimal string representation.
 *
 * @param {Uint8Array} data - The Uint8Array to convert to a hexadecimal string.
 * @returns {string} - The hexadecimal string representation of the Uint8Array.
 */
export declare const bytesToHex: (data: Uint8Array) => string;
/**
 * trimHexPrefix
 *
 * Removes the '0x' prefix from a hexadecimal string if present.
 *
 * @param {string} hex - The input string.
 * @returns {string} - The trimmed hexadecimal string.
 */
export declare const trimHexPrefix: (hex: string) => string;
