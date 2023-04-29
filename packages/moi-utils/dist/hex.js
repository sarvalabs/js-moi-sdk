"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uint8ToHex = exports.bytesToHex = exports.hexToBN = exports.hexToBytes = exports.encodeToString = exports.toQuantity = exports.numToHex = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const numToHex = (value) => {
    if (!bn_js_1.default.isBN(value)) {
        value = new bn_js_1.default(value);
    }
    if (value.lt(new bn_js_1.default(0))) {
        throw new Error('Input must be a positive BN value');
    }
    const bigNum = new bn_js_1.default(value.toString()); // Convert bigint to bn.js BN instance
    return bigNum.toString(16).toUpperCase();
};
exports.numToHex = numToHex;
const toQuantity = (value) => {
    try {
        return "0x" + (0, exports.numToHex)(value);
    }
    catch (err) {
        throw err;
    }
};
exports.toQuantity = toQuantity;
const encodeToString = (data) => {
    return Buffer.from(data).toString('hex');
};
exports.encodeToString = encodeToString;
const hexToBytes = (str) => {
    const hex = str.replace(/^0x/, '').trim();
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
const hexToBN = (hex) => {
    let value;
    hex = hex.replace(/^0x/, '').trim();
    if (hex.length % 2 !== 0) {
        throw new Error('Invalid hex string');
    }
    value = new bn_js_1.default(hex, 16);
    // Check if the number is too large to fit in a number
    if (value.bitLength() > 53) {
        // If so, return it as a BigInt
        return BigInt(`0x${value.toString(16)}`);
    }
    // Otherwise, return it as a number
    return value.toNumber();
};
exports.hexToBN = hexToBN;
const bytesToHex = (data) => {
    return Buffer.from(data).toString('hex');
};
exports.bytesToHex = bytesToHex;
const uint8ToHex = (arr) => {
    let hexString = "";
    for (let byte of arr) {
        let _byte = byte.toString(16).padStart(2, "0");
        hexString += _byte;
    }
    return hexString;
};
exports.uint8ToHex = uint8ToHex;
