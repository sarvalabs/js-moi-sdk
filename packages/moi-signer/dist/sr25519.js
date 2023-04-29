"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.sign = void 0;
const schnorrkel = __importStar(require("@parity/schnorrkel-js"));
const moi_utils_1 = require("moi-utils");
const sign = (message, vault) => {
    let _priv = vault.privateKey();
    let _pub = vault.privateKey();
    const kp = _priv.concat(_pub);
    let sigDigest = schnorrkel.sign(kp, (0, moi_utils_1.bytesToUint8)(message));
    return (0, moi_utils_1.uint8ToHex)(sigDigest);
};
exports.sign = sign;
const verify = (message, signature, pubKey) => {
    const sigInUint8Array = Uint8Array.from(Buffer.from(signature, 'hex'));
    return schnorrkel.verify(sigInUint8Array, message, pubKey);
};
exports.verify = verify;
