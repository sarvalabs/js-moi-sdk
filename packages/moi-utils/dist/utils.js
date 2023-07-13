"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unmarshal = exports.marshal = exports.hexToUint8 = exports.bytesToUint8 = exports.uint8ToHex = exports.hexToBytes = exports.bytesToHex = void 0;
const hexToUint8_1 = __importDefault(require("./hexToUint8"));
const bytesToHex = (data) => {
    return Buffer.from(data).toString('hex');
};
exports.bytesToHex = bytesToHex;
const hexToBytes = (str) => {
    const hex = str.trim();
    if (hex.length % 2 !== 0) {
        throw new Error('Invalid hex string');
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
};
exports.hexToBytes = hexToBytes;
function uint8ToHex(arr) {
    let hexString = "";
    for (let byte of arr) {
        let _byte = byte.toString(16).padStart(2, "0");
        hexString += _byte;
    }
    return hexString;
}
exports.uint8ToHex = uint8ToHex;
function bytesToUint8(target) {
    return new Uint8Array(target);
}
exports.bytesToUint8 = bytesToUint8;
function hexToUint8(hexString) {
    return (0, hexToUint8_1.default)(hexString);
}
exports.hexToUint8 = hexToUint8;
function marshal(data) {
    const jsonString = JSON.stringify(data);
    return new TextEncoder().encode(jsonString);
}
exports.marshal = marshal;
function unmarshal(bytes) {
    try {
        const jsonString = new TextDecoder().decode(bytes);
        return JSON.parse(jsonString);
    }
    catch (error) {
        throw new Error('Error deserializing data:', error);
    }
}
exports.unmarshal = unmarshal;
