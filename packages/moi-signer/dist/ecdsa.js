"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const signature_1 = __importDefault(require("./signature"));
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const blake2b_1 = __importDefault(require("blake2b"));
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
            _signingKey = Buffer.from(signingKey, 'hex');
        }
        else {
            _signingKey = signingKey;
        }
        // Hashing raw message with blake2b to get 32 bytes digest 
        const messageHash = (0, blake2b_1.default)(256 / 8).update(message).digest();
        const keyPair = bitcoinjs_lib_1.ECPair.fromPrivateKey(_signingKey, { network: bitcoinjs_lib_1.networks.bitcoin });
        let signature = bitcoinjs_lib_1.script.signature.encode(keyPair.sign(messageHash), bitcoinjs_lib_1.Transaction.SIGHASH_ALL);
        // Removing last byte, since it's always 0x01 because of SIGHASH_ALL hashType
        signature = signature.slice(0, signature.length - 1);
        const prefixArray = new Uint8Array(2);
        prefixArray[0] = this.prefix;
        prefixArray[1] = signature.length;
        const sig = new signature_1.default(Buffer.from(prefixArray), signature, Buffer.from([keyPair.publicKey[0]]), this.sigName);
        return sig;
    }
    verify(message, signature, publicKey) {
        let verificationKey = Buffer.concat([signature.Extra(), publicKey]);
        let rawSignature = signature.Digest();
        // Appending the byte that was removed at the time of signing      
        let sigComps = bitcoinjs_lib_1.script.signature.decode(Buffer.concat([rawSignature, Buffer.from([0x01])]));
        // Hashing raw message with blake2b to get 32 bytes digest 
        const messageHash = (0, blake2b_1.default)(256 / 8).update(message).digest();
        const parsedPubkey = bitcoinjs_lib_1.ECPair.fromPublicKey(verificationKey, { network: bitcoinjs_lib_1.networks.bitcoin });
        return parsedPubkey.verify(messageHash, sigComps.signature);
    }
}
exports.default = ECDSA_S256;
