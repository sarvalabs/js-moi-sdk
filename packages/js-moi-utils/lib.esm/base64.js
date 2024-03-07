import { Buffer } from "buffer";
/**
 * encodeBase64
 *
 * Encodes a Uint8Array into a base64 string.
 *
 * @param {Uint8Array} uint8Array - The Uint8Array to encode.
 * @returns {string} The base64 encoded string.
 */
export const encodeBase64 = (uint8Array) => {
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
    }
    return Buffer.from(binaryString, 'binary').toString('base64');
};
/**
 * Decodes a base64 string into a Uint8Array.
 *
 * @param {string} base64String - The base64 string to decode.
 * @returns {Uint8Array} The decoded Uint8Array.
 */
export const decodeBase64 = (base64String) => {
    const binaryString = Buffer.from(base64String, 'base64').toString('binary');
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
    return uint8Array;
};
//# sourceMappingURL=base64.js.map