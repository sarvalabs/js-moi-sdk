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
exports.Wallet = void 0;
const bip39 = __importStar(require("bip39"));
const elliptic_1 = __importDefault(require("elliptic"));
const moi_hdnode_1 = require("moi-hdnode");
const crypto_1 = require("crypto");
const moi_signer_1 = require("moi-signer");
const moi_utils_1 = require("moi-utils");
const SigningKeyErrors = __importStar(require("./errors"));
const serializer_1 = require("./serializer");
const SECP256K1 = "secp256k1";
const privateMapGet = (receiver, privateMap) => {
    if (!privateMap.has(receiver)) {
        SigningKeyErrors.ErrPrivateGet();
    }
    const descriptor = privateMap.get(receiver);
    if (descriptor.get) {
        return descriptor.get.call(receiver);
    }
    return descriptor.value;
};
const privateMapSet = (receiver, privateMap, value) => {
    if (!privateMap.has(receiver)) {
        SigningKeyErrors.ErrPrivateSet();
    }
    const descriptor = privateMap.get(receiver);
    if (descriptor.set) {
        descriptor.set.call(receiver, value);
    }
    else {
        descriptor.value = value;
    }
    return value;
};
const __vault = new WeakMap();
class Wallet extends moi_signer_1.Signer {
    constructor(provider) {
        super(provider);
        __vault.set(this, {
            value: void 0
        });
    }
    load(key, mnemonic, curve) {
        try {
            let privKey, pubKey;
            if (!key) {
                moi_utils_1.ErrorUtils.throwError("Key is required, cannot be undefined", moi_utils_1.ErrorCode.INVALID_ARGUMENT);
            }
            const ecPrivKey = new elliptic_1.default.ec(SECP256K1);
            const keyInBytes = (0, moi_utils_1.hexToUint8)(key);
            const keyPair = ecPrivKey.keyFromPrivate(keyInBytes);
            privKey = keyPair.getPrivate("hex");
            pubKey = keyPair.getPublic(true, "hex");
            privateMapSet(this, __vault, {
                _key: privKey,
                _mnemonic: mnemonic,
                _public: pubKey,
                _curve: curve
            });
        }
        catch (err) {
            moi_utils_1.ErrorUtils.throwError("Failed to load wallet", moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    async createRandom() {
        try {
            const _random16Bytes = (0, crypto_1.randomBytes)(16);
            var mnemonic = bip39.entropyToMnemonic(_random16Bytes, undefined);
            await this.fromMnemonic(mnemonic, undefined);
        }
        catch (err) {
            moi_utils_1.ErrorUtils.throwError("Failed to create random mnemonic", moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    async fromMnemonic(mnemonic, path, wordlist) {
        mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, wordlist), wordlist);
        try {
            const seed = await bip39.mnemonicToSeed(mnemonic, undefined);
            const hdNode = new moi_hdnode_1.HDNode();
            hdNode.fromSeed(seed, path);
            this.load(hdNode.privateKey(), mnemonic, SECP256K1);
        }
        catch (err) {
            moi_utils_1.ErrorUtils.throwError("Failed to load wallet from mnemonic", moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    privateKey() { return privateMapGet(this, __vault)._key; }
    mnemonic() { return privateMapGet(this, __vault)._mnemonic; }
    publicKey() { return privateMapGet(this, __vault)._public; }
    curve() { return privateMapGet(this, __vault)._curve; }
    // Signer methods
    getAddress() {
        return this.publicKey();
    }
    connect(provider) {
        return new Wallet(provider);
    }
    sign(message, sigAlgo) {
        if (sigAlgo) {
            const privateKey = this.privateKey();
            if (!privateKey) {
                moi_utils_1.ErrorUtils.throwError("Private key not found. The wallet has not been loaded or initialized.", moi_utils_1.ErrorCode.NOT_INITIALIZED);
            }
            switch (sigAlgo.sigName) {
                case "ECDSA_S256": {
                    const _sig = this.signingAlgorithms["ecdsa_secp256k1"];
                    const sigBytes = _sig.sign(Buffer.from(message), privateKey);
                    return sigBytes.serialize().toString('hex');
                }
                default: {
                    moi_utils_1.ErrorUtils.throwError("Unsupported signature type", moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
                }
            }
        }
        moi_utils_1.ErrorUtils.throwError("Signature type cannot be undefiend", moi_utils_1.ErrorCode.INVALID_ARGUMENT);
    }
    signInteraction(ixObject, sigAlgo) {
        try {
            const ixData = (0, serializer_1.serializeIxObject)(ixObject);
            const signature = this.sign(ixData, sigAlgo);
            return {
                ix_args: (0, moi_utils_1.bytesToHex)(ixData),
                signature: signature
            };
        }
        catch (err) {
            moi_utils_1.ErrorUtils.throwError("Failed to sign interaction", moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
}
exports.Wallet = Wallet;
