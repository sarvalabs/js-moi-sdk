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
const blake2b_1 = require("@noble/hashes/blake2b");
const hmac_1 = require("@noble/hashes/hmac");
const sha256_1 = require("@noble/hashes/sha256");
const nobleECC = __importStar(require("@noble/secp256k1"));
const js_moi_utils_1 = require("@zenz-solutions/js-moi-utils");
const signature_1 = __importDefault(require("./signature"));
const utils_1 = require("./utils");
/**
 * Setting the `hmacSha256Sync` with custom hashing logic
 * @param key
 * @param msgs
 */
nobleECC.utils.hmacSha256Sync = (key, ...msgs) => (0, hmac_1.hmac)(sha256_1.sha256, key, nobleECC.utils.concatBytes(...msgs));
/**
 * ECDSA_S256
 *
 * Represents the ECDSA_S256 signature type.
 */
class ECDSA_S256 {
    prefix;
    sigName;
    constructor() {
        this.prefix = 1;
        this.sigName = "ECDSA_S256";
    }
    /**
     * sign
     *
     * Signs a message using the ECDSA_S256 signature algorithm.
     *
     * @param message - The message to be signed, as a Buffer.
     * @param signingKey - The private key used for signing, either as
     * a hexadecimal string or a Buffer.
     * @returns A Signature instance with ECDSA_S256 prefix and parity byte as extra data
     */
    sign(message, signingKey) {
        let _signingKey;
        if (typeof signingKey === "string") {
            _signingKey = (0, js_moi_utils_1.hexToBytes)(signingKey);
        }
        else {
            _signingKey = signingKey;
        }
        const messageHash = (0, blake2b_1.blake2b)(message, {
            dkLen: 1 << 5, // Hashing raw message with blake2b to get 32 bytes digest
        });
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
    /**
     * verify
     *
     * Verifies the ECDSA signature with the given secp256k1 publicKey
     *
     * @param message the message being signed
     * @param signature the Signature instance with parity byte
     * as extra data to determine the public key's X & Y co-ordinates
     * having same or different sign
     * @param publicKey the compressed public key
     * @returns boolean, to determine whether verification is success/failure
     */
    verify(message, signature, publicKey) {
        let verificationKey = new Uint8Array(signature.Extra().length + publicKey.length);
        verificationKey.set(signature.Extra());
        verificationKey.set(publicKey, signature.Extra().length);
        let derSignature = signature.Digest();
        const messageHash = (0, blake2b_1.blake2b)(message, {
            dkLen: 1 << 5, // Hashing raw message with blake2b to get 32 bytes digest
        });
        const _digest = (0, utils_1.bip66Decode)(derSignature);
        const sigDigest = {
            _r: (0, utils_1.fromDER)(_digest._r),
            _s: (0, utils_1.fromDER)(_digest._s)
        };
        return nobleECC.verify((0, utils_1.JoinSignature)(sigDigest), messageHash, verificationKey, { strict: true });
    }
}
exports.default = ECDSA_S256;
//# sourceMappingURL=ecdsa.js.map