"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigintToHex = exports.toHex = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const toHex = (hexValue) => {
    if (!/^[0-9A-Fa-f]{6}$/.test(hexValue)) {
        throw new Error('Invalid hex value');
    }
    return hexValue;
};
exports.toHex = toHex;
const bigintToHex = (value) => {
    if (!bn_js_1.default.isBN(value)) {
        value = new bn_js_1.default(value);
    }
    if (value.lt(new bn_js_1.default(0))) {
        throw new Error('Input must be a positive BN value');
    }
    const bigNum = new bn_js_1.default(value.toString()); // Convert bigint to bn.js BN instance
    return bigNum.toString(16).toUpperCase();
};
exports.bigintToHex = bigintToHex;
