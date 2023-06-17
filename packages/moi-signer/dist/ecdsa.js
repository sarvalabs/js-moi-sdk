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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blake2b_1 = __importDefault(require("blake2b"));
const nobleECC = __importStar(require("@noble/secp256k1"));
const hmac_1 = require("@noble/hashes/hmac");
const sha256_1 = require("@noble/hashes/sha256");
const moi_utils_1 = require("moi-utils");
const utils_1 = require("./utils");
const signature_1 = __importDefault(require("./signature"));
nobleECC.utils.hmacSha256Sync = (key, ...msgs) => (0, hmac_1.hmac)(sha256_1.sha256, key, nobleECC.utils.concatBytes(...msgs));
class ECDSA_S256 {
    prefix;
    sigName;
    constructor() {
        this.prefix = 1;
        this.sigName = "ECDSA_S256";
    }
    sign(message, vault) {
        let signingKey = vault.privateKey();
        let _signingKey;
        if (typeof signingKey === "string") {
            _signingKey = (0, moi_utils_1.hexToBytes)(signingKey);
        }
        else {
            _signingKey = signingKey;
        }
        // Hashing raw message with blake2b to get 32 bytes digest 
        const messageHash = (0, blake2b_1.default)(256 / 8).update(message).digest();
        const sigParts = nobleECC.signSync(messageHash, _signingKey, { der: false });
        const digest = {
            _r: (0, utils_1.toDER)(sigParts.slice(0, 32)),
            _s: (0, utils_1.toDER)(sigParts.slice(32, 64))
        };
        const signature = (0, utils_1.bip66Encode)(digest);
        const prefixArray = new Uint8Array(2);
        prefixArray[0] = this.prefix;
        prefixArray[1] = signature.length;
        const pubKey = nobleECC.getPublicKey(_signingKey, true);
        const parityByte = new Uint8Array([pubKey[0]]);
        const sig = new signature_1.default(prefixArray, signature, parityByte, this.sigName);
        return sig;
    }
    verify(message, signature, publicKey) {
        let verificationKey = Buffer.concat([signature.Extra(), publicKey]);
        let rawSignature = signature.Digest();
        // Hashing raw message with blake2b to get 32 bytes digest 
        const messageHash = (0, blake2b_1.default)(256 / 8).update(message).digest();
        const _digest = (0, utils_1.bip66Decode)(rawSignature);
        const sigDigest = {
            _r: (0, utils_1.fromDER)(_digest._r),
            _s: (0, utils_1.fromDER)(_digest._s)
        };
        return nobleECC.verify((0, utils_1.JoinSignature)(sigDigest), messageHash, verificationKey, { strict: true });
    }
}
exports.default = ECDSA_S256;
