"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeBase64 = exports.encodeBase64 = void 0;
const encodeBase64 = (uint8Array) => {
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
    }
    return Buffer.from(binaryString, 'binary').toString('base64');
};
exports.encodeBase64 = encodeBase64;
const decodeBase64 = (base64String) => {
    const binaryString = Buffer.from(base64String, 'base64').toString('binary');
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
    return uint8Array;
};
exports.decodeBase64 = decodeBase64;
