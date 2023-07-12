"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeBase64 = exports.encodeBase64 = void 0;
const buffer_1 = require("buffer");
/**
 * encodeBase64
 *
 * Encodes a Uint8Array into a base64 string.
 *
 * @param {Uint8Array} uint8Array - The Uint8Array to encode.
 * @returns {string} - The base64 encoded string.
 */
const encodeBase64 = (uint8Array) => {
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
    }
    return buffer_1.Buffer.from(binaryString, 'binary').toString('base64');
};
exports.encodeBase64 = encodeBase64;
/**
 * decodeBase64
 *
 * Decodes a base64 string into a Uint8Array.
 *
 * @param {string} base64String - The base64 string to decode.
 * @returns {Uint8Array} - The decoded Uint8Array.
 */
const decodeBase64 = (base64String) => {
    const binaryString = buffer_1.Buffer.from(base64String, 'base64').toString('binary');
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
    return uint8Array;
};
exports.decodeBase64 = decodeBase64;
