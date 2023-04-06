"use strict";
/*
    This module/directory is responsible for
    handling wallet
*/
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
const bip39 = __importStar(require("bip39"));
const elliptic_1 = __importDefault(require("elliptic"));
const bip32_1 = require("bip32");
const crypto_1 = require("crypto");
const ecc = __importStar(require("tiny-secp256k1"));
const schnorrkel = __importStar(require("@parity/schnorrkel-js"));
/* Internal imports */
const moi_constants_1 = require("moi-constants");
const moi_utils_1 = require("moi-utils");
const Types = __importStar(require("../types/index"));
const SigningKeyErrors = __importStar(require("./errors"));
const bip32 = (0, bip32_1.BIP32Factory)(ecc);
function _privateMapGet(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        SigningKeyErrors.ErrPrivateGet();
    }
    var descriptor = privateMap.get(receiver);
    if (descriptor.get) {
        return descriptor.get.call(receiver);
    }
    return descriptor.value;
}
function _privateMapSet(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        SigningKeyErrors.ErrPrivateSet();
    }
    var descriptor = privateMap.get(receiver);
    if (descriptor.set) {
        descriptor.set.call(receiver, value);
    }
    else {
        descriptor.value = value;
    }
    return value;
}
let __vault = new WeakMap();
class Wallet {
    constructor() {
        __vault.set(this, {
            value: void 0
        });
    }
    load(key, mnemonic, curve) {
        let privKey, pubKey;
        if (!key) {
            throw new Error("key cannot be undefined");
        }
        switch (curve) {
            case Types.SR25519: {
                const uint8Key = (0, moi_utils_1.bytesToUint8)(key);
                let kp = schnorrkel.keypair_from_seed(uint8Key);
                privKey = (0, moi_utils_1.uint8ToHex)(kp.slice(0, 64));
                pubKey = (0, moi_utils_1.uint8ToHex)(kp.slice(64, 96));
                break;
            }
            case Types.SECP256K1: {
                const ecPrivKey = new elliptic_1.default.ec(Types.SECP256K1);
                let keyInBytes = (0, moi_utils_1.hexToUint8)(key);
                const keyPair = ecPrivKey.keyFromPrivate(keyInBytes);
                privKey = keyPair.getPrivate("hex");
                pubKey = keyPair.getPublic(true, "hex");
                break;
            }
            default: {
                throw new Error("un-supported curve");
            }
        }
        _privateMapSet(this, __vault, {
            _key: privKey,
            _mnemonic: mnemonic,
            _public: pubKey,
            _curve: curve
        });
    }
    async createRandom() {
        try {
            const _random16Bytes = (0, crypto_1.randomBytes)(16);
            var mnemonic = bip39.entropyToMnemonic(_random16Bytes, undefined);
            await this.fromMnemonic(mnemonic, undefined);
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async fromMnemonic(mnemonic, wordlist) {
        mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, wordlist), wordlist);
        try {
            const seed = await bip39.mnemonicToSeed(mnemonic, undefined);
            const masterHdNode = bip32.fromSeed(seed, undefined);
            const derviedExtendedKey = masterHdNode.derivePath(moi_constants_1.MOI_DERIVATION_PATH);
            this.load(derviedExtendedKey.privateKey, mnemonic, Types.SR25519);
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    privateKey() { return _privateMapGet(this, __vault)._key; }
    mnemonic() { return _privateMapGet(this, __vault)._mnemonic; }
    publicKey() { return _privateMapGet(this, __vault)._public; }
    curve() { return _privateMapGet(this, __vault)._curve; }
}
exports.default = Wallet;
