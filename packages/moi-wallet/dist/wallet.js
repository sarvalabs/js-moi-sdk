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
exports.Wallet = exports.CURVE = void 0;
const bip39 = __importStar(require("bip39"));
const elliptic_1 = __importDefault(require("elliptic"));
const moi_hdnode_1 = require("moi-hdnode");
const crypto_1 = require("crypto");
const moi_signer_1 = require("moi-signer");
const moi_utils_1 = require("moi-utils");
const SigningKeyErrors = __importStar(require("./errors"));
const serializer_1 = require("./serializer");
var CURVE;
(function (CURVE) {
    CURVE["SECP256K1"] = "secp256k1";
})(CURVE || (exports.CURVE = CURVE = {}));
/**
 * privateMapGet
 *
 * Retrieves the value associated with the receiver from a private map.
 * Throws an error if the receiver is not found in the map.
 *
 * @param receiver - The receiver object.
 * @param privateMap - The private map containing the receiver and its associated value.
 * @returns The value associated with the receiver.
 * @throws Error if the receiver is not found in the private map.
 */
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
/**
 * privateMapSet
 *
 * Sets the value associated with the receiver in a private map.
 * Throws an error if the receiver is not found in the map.
 *
 * @param receiver - The receiver object.
 * @param privateMap - The private map containing the receiver and its associated value.
 * @param value - The value to set.
 * @returns The updated value.
 * @throws Error if the receiver is not found in the private map.
 */
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
/**
 * Wallet
 *
 * A class representing a wallet that can sign interactions and manage keys.
 */
class Wallet extends moi_signer_1.Signer {
    constructor(provider) {
        super(provider);
        __vault.set(this, {
            value: void 0
        });
    }
    /**
     * load
     *
     * Initializes the wallet with a private key, mnemonic, and curve.
     *
     * @param key - The private key as a Buffer.
     * @param curve - The elliptic curve algorithm used for key generation.
     * @param mnemonic - The mnemonic associated with the wallet. (optional)
     * @throws Error if the key is undefined or if an error occurs during the
     * initialization process.
     */
    load(key, curve, mnemonic) {
        try {
            let privKey, pubKey;
            if (!key) {
                moi_utils_1.ErrorUtils.throwError("Key is required, cannot be undefined", moi_utils_1.ErrorCode.INVALID_ARGUMENT);
            }
            if (curve !== CURVE.SECP256K1) {
                moi_utils_1.ErrorUtils.throwError(`Unsupported curve: ${curve}`, moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
            }
            const ecPrivKey = new elliptic_1.default.ec(curve);
            const keyInBytes = (0, moi_utils_1.bufferToUint8)(key);
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
    /**
     * isInitialized
     *
     * Checks if the wallet is initialized.
     *
     * @returns true if the wallet is initialized, false otherwise.
     */
    isInitialized() {
        if (privateMapGet(this, __vault)) {
            return true;
        }
        return false;
    }
    /**
     * createRandom
     *
     * Generates a random mnemonic and initializes the wallet from it.
     *
     * @throws Error if there is an error generating the random mnemonic.
     */
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
    /**
     * fromMnemonic
     *
     * Intializes the wallet from a provided mnemonic.
     *
     * @param mnemonic - The mnemonic associated with the wallet.
     * @param path - The derivation path for the HDNode. (optional)
     * @param wordlist - The wordlist for the mnemonic. (optional)
     * @throws Error if there is an error loading the wallet from the mnemonic.
     */
    async fromMnemonic(mnemonic, path, wordlist) {
        mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, wordlist), wordlist);
        try {
            const seed = await bip39.mnemonicToSeed(mnemonic, undefined);
            const hdNode = new moi_hdnode_1.HDNode();
            hdNode.fromSeed(seed, path);
            this.load(hdNode.privateKey(), CURVE.SECP256K1, mnemonic);
        }
        catch (err) {
            moi_utils_1.ErrorUtils.throwError("Failed to load wallet from mnemonic", moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    /**
     * privateKey
     *
     * Retrieves the private key associated with the wallet.
     *
     * @returns The private key as a string.
     * @throws Error if the wallet is not loaded or initialized.
     */
    privateKey() {
        if (this.isInitialized()) {
            return privateMapGet(this, __vault)._key;
        }
        moi_utils_1.ErrorUtils.throwError("Private key not found. The wallet has not been loaded or initialized.", moi_utils_1.ErrorCode.NOT_INITIALIZED);
    }
    /**
     * mnemonic
     *
     * Retrieves the mnemonic associated with the wallet.
     *
     * @returns The mnemonic as a string.
     * @throws Error if the wallet is not loaded or initialized.
     */
    mnemonic() {
        if (this.isInitialized()) {
            return privateMapGet(this, __vault)._mnemonic;
        }
        moi_utils_1.ErrorUtils.throwError("Mnemonic not found. The wallet has not been loaded or initialized.", moi_utils_1.ErrorCode.NOT_INITIALIZED);
    }
    /**
     * publicKey
     *
     * Retrieves the public key associated with the wallet.
     *
     * @returns The public key as a string.
     * @throws Error if the wallet is not loaded or initialized.
     */
    publicKey() {
        if (this.isInitialized()) {
            return privateMapGet(this, __vault)._public;
        }
        moi_utils_1.ErrorUtils.throwError("Public key not found. The wallet has not been loaded or initialized.", moi_utils_1.ErrorCode.NOT_INITIALIZED);
    }
    /**
     * curve
     *
     * Retrieves the curve used by the wallet.
     *
     * @returns The curve as a string.
     * @throws Error if the wallet is not loaded or initialized.
     */
    curve() {
        if (this.isInitialized()) {
            return privateMapGet(this, __vault)._curve;
        }
        moi_utils_1.ErrorUtils.throwError("Curve not found. The wallet has not been loaded or initialized.", moi_utils_1.ErrorCode.NOT_INITIALIZED);
    }
    /**
     * getAddress
     *
     * Retrieves the address associated with the wallet.
     *
     * @returns The address as a string.
     */
    getAddress() {
        const publicKey = this.publicKey();
        return "0x" + publicKey.slice(2);
    }
    /**
     * connect
     *
     * Connects the wallet to a provider and returns a new instance of the wallet.
     *
     * @param provider - The provider to connect.
     * @returns A new instance of the wallet connected to the specified provider.
     */
    connect(provider) {
        return new Wallet(provider);
    }
    /**
     * sign
     *
     * Signs a message using the wallet's private key and the specified signature algorithm.
     *
     * @param message - The message to sign as a Uint8Array.
     * @param sigAlgo - The signature algorithm to use.
     * @returns The signature as a string.
     * @throws Error if the signature type is unsupported or undefined, or if there is an error during signing.
     */
    sign(message, sigAlgo) {
        if (sigAlgo) {
            switch (sigAlgo.sigName) {
                case "ECDSA_S256": {
                    const privateKey = this.privateKey();
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
    /**
     * signInteraction
     *
     * Signs an interaction object using the wallet's private key and the specified signature algorithm.
     * The interaction object is serialized into POLO bytes before signing.
     *
     * @param ixObject - The interaction object to sign.
     * @param sigAlgo - The signature algorithm to use.
     * @returns The signed interaction request containing the serialized
     * interaction object and the signature.
     * @throws Error if there is an error during signing or serialization.
     */
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
