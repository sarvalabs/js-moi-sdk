"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinSignature = exports.bip66Decode = exports.bip66Encode = exports.fromDER = exports.toDER = void 0;
const ZERO = new Uint8Array([0]);
const ErrRIsZero = "digest._r length cannot be zero";
const ErrSIsZero = "digest._s length cannot be zero";
const ErrRIsLong = "invalid digest._r length, should be 33 or 32";
const ErrSIsLong = "invalid digest._s length, should be 33 or 32";
const ErrSIsNegative = "digest._s value cannot be negative";
const ErrRIsNegative = "digest._r value cannot be negative";
const ErrRIsExcessPad = "digest._r value excessively padded";
const ErrSIsExcessPad = "digest._s value excessively padded";
const ErrDERExpected2 = "Expected DER integer (2)";
function toDER(x) {
    let i = 0;
    while (x[i] === 0)
        ++i;
    if (i === x.length)
        return ZERO;
    x = x.slice(i);
    if (x[0] & 0x80) {
        const result = new Uint8Array(1 + x.length);
        result.set(ZERO, 0);
        result.set(x, 1);
        return result;
    }
    return x;
}
exports.toDER = toDER;
function fromDER(x) {
    if (x[0] === 0x00)
        x = x.subarray(1);
    const uint8Array = new Uint8Array(32);
    const bstart = Math.max(0, 32 - x.length);
    uint8Array.set(x, bstart);
    return uint8Array;
}
exports.fromDER = fromDER;
// Reference https://github.com/bitcoin/bips/blob/master/bip-0066.mediawiki
// Format: 0x30 [total-length] 0x02 [R-length] [R] 0x02 [S-length] [S]
function bip66Encode(rAndS) {
    let r = rAndS._r;
    let s = rAndS._s;
    let lenR = r.length;
    let lenS = s.length;
    if (lenR === 0)
        throw new Error(ErrRIsZero);
    if (lenS === 0)
        throw new Error(ErrSIsZero);
    if (lenR > 33)
        throw new Error(ErrRIsLong);
    if (lenS > 33)
        throw new Error(ErrSIsLong);
    if (r[0] & 0x80)
        throw new Error(ErrRIsNegative);
    if (s[0] & 0x80)
        throw new Error(ErrSIsNegative);
    if (lenR > 1 && (r[0] === 0x00) && !(r[1] & 0x80))
        throw new Error(ErrRIsExcessPad);
    if (lenS > 1 && (s[0] === 0x00) && !(s[1] & 0x80))
        throw new Error(ErrSIsExcessPad);
    let signature = new Uint8Array(6 + lenR + lenS);
    signature[0] = 0x30;
    signature[1] = signature.length - 2;
    signature[2] = 0x02;
    signature[3] = lenR;
    signature.set(r, 4);
    signature[4 + lenR] = 0x02;
    signature[5 + lenR] = lenS;
    signature.set(s, 6 + lenR);
    return signature;
}
exports.bip66Encode = bip66Encode;
function bip66Decode(buffer) {
    if (buffer.length < 8)
        throw new Error('DER sequence length is too short');
    if (buffer.length > 72)
        throw new Error('DER sequence length is too long');
    if (buffer[0] !== 0x30)
        throw new Error('Expected DER sequence');
    if (buffer[1] !== buffer.length - 2)
        throw new Error('DER sequence length is invalid');
    if (buffer[2] !== 0x02)
        throw new Error('Expected DER integer');
    let lenR = buffer[3];
    if (lenR === 0)
        throw new Error(ErrRIsZero);
    if (5 + lenR >= buffer.length)
        throw new Error(ErrSIsLong);
    if (buffer[4 + lenR] !== 0x02)
        throw new Error(ErrDERExpected2);
    let lenS = buffer[5 + lenR];
    if (lenS === 0)
        throw new Error(ErrSIsZero);
    if (6 + lenR + lenS !== buffer.length)
        throw new Error(ErrSIsLong);
    if (buffer[4] & 0x80)
        throw new Error(ErrRIsNegative);
    if (lenR > 1 && (buffer[4] === 0x00) && !(buffer[5] & 0x80))
        throw new Error(ErrRIsExcessPad);
    if (buffer[lenR + 6] & 0x80)
        throw new Error(ErrSIsNegative);
    if (lenS > 1 && (buffer[lenR + 6] === 0x00) && !(buffer[lenR + 7] & 0x80))
        throw new Error(ErrSIsExcessPad);
    const digest = {
        _r: buffer.slice(4, 4 + lenR),
        _s: buffer.slice(6 + lenR)
    };
    return digest;
}
exports.bip66Decode = bip66Decode;
function JoinSignature(digest) {
    const joinedArray = new Uint8Array(64);
    joinedArray.set(digest._r, 0);
    joinedArray.set(digest._s, 32);
    return joinedArray;
}
exports.JoinSignature = JoinSignature;
//# sourceMappingURL=utils.js.map