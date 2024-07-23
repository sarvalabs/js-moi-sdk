/// <reference types="node" />
import type { Buffer } from "buffer";
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
export declare const isInteger: (value: number) => boolean;
/**
 * Checks if the given value is a valid byte array.
 *
 * @param {any} value - The value to check.
 * @returns {boolean} - Returns true if the value is a valid byte array, otherwise false.
 */
export declare const isBytes: (value: any) => value is Bytes;
/**
 * Calculates the length of the data represented by a hexadecimal string.
 *
 * @param {string} data - The hexadecimal string.
 * @returns {number | null} - The length of the data, or null if the input is
 * not a valid hexadecimal string.
 */
export declare const hexDataLength: (data: string) => number;
/**
 * Checks if the given value is a valid hexadecimal string.
 *
 * @param {any} value - The value to check.
 * @param {number} length - Optional. The expected length of the hexadecimal string.
 * @returns {boolean} Returns true if the value is a valid hexadecimal string, otherwise false.
 */
export declare const isHexString: (value: any, length?: number) => boolean;
/**
 * Converts a Buffer to a Uint8Array.
 *
 * @param {Buffer} target - The Buffer to convert.
 * @returns {Uint8Array} The Uint8Array representation of the Buffer.
 */
export declare const bufferToUint8: (target: Buffer) => Uint8Array;
//# sourceMappingURL=bytes.d.ts.map