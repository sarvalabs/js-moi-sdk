"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Verify = exports.Sign = void 0;
const elliptic_1 = __importDefault(require("elliptic"));
const secp256k1Curve = new elliptic_1.default.ec('secp256k1');
function Sign(message, vault) {
    let prvKey = secp256k1Curve.keyFromPrivate(vault.privateKey());
    return prvKey.sign(message).toDER("hex");
}
exports.Sign = Sign;
function Verify(message, signature, pub) {
    let pubKey = secp256k1Curve.keyFromPublic(pub);
    return pubKey.verify(message, signature);
}
exports.Verify = Verify;
