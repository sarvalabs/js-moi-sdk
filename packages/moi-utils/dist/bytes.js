"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bytesToUint8 = exports.isHexString = exports.hexDataLength = exports.isBytes = exports.isInteger = void 0;
const isInteger = (value) => {
    return (typeof (value) === "number" && value == value && (value % 1) === 0);
};
exports.isInteger = isInteger;
const isBytes = (value) => {
    if (value == null) {
        return false;
    }
    if (value.constructor === Uint8Array) {
        return true;
    }
    if (typeof (value) === "string") {
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
const hexDataLength = (data) => {
    if (!(0, exports.isHexString)(data) || (data.length % 2)) {
        return null;
    }
    return (data.length - 2) / 2;
};
exports.hexDataLength = hexDataLength;
const isHexString = (value, length) => {
    if (typeof (value) !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
        return false;
    }
    if (length && value.length !== 2 + 2 * length) {
        return false;
    }
    return true;
};
exports.isHexString = isHexString;
const bytesToUint8 = (target) => {
    return new Uint8Array(target);
};
exports.bytesToUint8 = bytesToUint8;
