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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = exports.CURVE = void 0;
const utils_1 = require("@noble/hashes/utils");
const buffer_1 = require("buffer");
const elliptic_1 = __importDefault(require("elliptic"));
const bip39 = __importStar(require("js-moi-bip39"));
const js_moi_constants_1 = require("js-moi-constants");
const js_moi_hdnode_1 = require("js-moi-hdnode");
const js_moi_signer_1 = require("js-moi-signer");
const js_moi_utils_1 = require("js-moi-utils");
const SigningKeyErrors = __importStar(require("./errors"));
const serializer_1 = require("./serializer");
const js_moi_identifiers_1 = require("js-moi-identifiers");
var CURVE;
(function (CURVE) {
    CURVE["SECP256K1"] = "secp256k1";
})(CURVE || (exports.CURVE = CURVE = {}));
const DEFAULT_KEY_ID = 0;
const DEFAULT_SUB_ACCOUNT_ID = 0;
/**
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
 * A class representing a wallet that can sign interactions.
 *
 * The Wallet implements the Signer API and can be used anywhere a [Signer](https://js-moi-sdk.docs.moi.technology/signer)
 * is expected and has all the required properties.
 *
 * A wallet is always initialized for a specific participant. Additional keys belonging
 * to the same participant can be registered via `addKey`. All registered keys will
 * contribute signatures when `signInteraction` is called, enabling multisig interactions.
 *
 * @example
 * // creating a wallet from mnemonic
 * const wallet = await Wallet.fromMnemonic("hollow appear story text start mask salt social child ...");
 *
 * @example
 * // creating a wallet from keystore
 * const keystore = { ... }
 * const wallet = Wallet.fromKeystore(keystore, "password");
 *
 * @example
 * // Connecting a wallet to a provider
 * const wallet = await Wallet.fromMnemonic("hollow appear story text start mask salt social child ...");
 * const provider = new VoyagerProvider("babylon");
 *
 * wallet.connect(provider);
 *
 * @docs https://js-moi-sdk.docs.moi.technology/hierarchical-deterministic-wallet
 */
class Wallet extends js_moi_signer_1.Signer {
    key_index;
    sub_account_index;
    constructor(hdNode, curve, options) {
        try {
            super(options?.provider);
            __vault.set(this, {
                value: void 0,
            });
            const key = hdNode.privateKey();
            if (!key) {
                js_moi_utils_1.ErrorUtils.throwError("Key is required, cannot be undefined", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
            }
            if (curve !== CURVE.SECP256K1) {
                js_moi_utils_1.ErrorUtils.throwError(`Unsupported curve: ${curve}`, js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
            }
            const { privKey, pubKey } = Wallet.deriveKeys(key, curve);
            const keyId = options?.keyId ?? DEFAULT_KEY_ID;
            const keys = new Map();
            keys.set(keyId, { privateKey: privKey, publicKey: pubKey });
            privateMapSet(this, __vault, {
                _pkey: pubKey,
                _node: hdNode,
                _curve: curve,
                _keys: keys,
            });
            this.key_index = keyId;
            this.sub_account_index = options?.subAccountId ?? DEFAULT_SUB_ACCOUNT_ID;
        }
        catch (error) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to load wallet", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: error });
        }
    }
    static deriveKeys(key, curve = CURVE.SECP256K1) {
        const ecPrivKey = new elliptic_1.default.ec(curve);
        const keyBuffer = buffer_1.Buffer.isBuffer(key) ? key : buffer_1.Buffer.from(key, "hex");
        const keyInBytes = (0, js_moi_utils_1.bufferToUint8)(keyBuffer);
        const keyPair = ecPrivKey.keyFromPrivate(keyInBytes);
        return { privKey: keyPair.getPrivate("hex"), pubKey: keyPair.getPublic(true, "hex") };
    }
    static async deriveAccountKey(mnemonic, path, wordlist) {
        mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, wordlist), wordlist);
        const seed = await bip39.mnemonicToSeed(mnemonic, undefined);
        const masterNode = js_moi_hdnode_1.HDNode.fromSeed(seed);
        const childNode = masterNode.derivePath(path ? path : js_moi_constants_1.MOI_DERIVATION_PATH);
        return Wallet.deriveKeys(childNode.privateKey());
    }
    /**
     * Checks if the wallet is initialized.
     *
     * @returns {boolean} true if the wallet is initialized, false otherwise.
     */
    isInitialized() {
        if (privateMapGet(this, __vault)) {
            return true;
        }
        return false;
    }
    /**
     * Private key of the sender key (key at `key_index`).
     *
     * @throws {Error} if the wallet is not loaded or initialized.
     * @readonly
     */
    get privateKey() {
        if (this.isInitialized()) {
            const keys = privateMapGet(this, __vault)._keys;
            return keys.get(this.key_index)?.privateKey;
        }
        js_moi_utils_1.ErrorUtils.throwError("Private key not found. The wallet has not been loaded or initialized.", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
    }
    /**
     * Retrieves the mnemonic associated with the wallet.
     *
     * @throws {Error} if the wallet is not loaded or initialized.
     * @readonly
     */
    get mnemonic() {
        if (this.isInitialized()) {
            return privateMapGet(this, __vault)._mnemonic;
        }
        js_moi_utils_1.ErrorUtils.throwError("Mnemonic not found. The wallet has not been loaded or initialized.", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
    }
    /**
     * Public key of the sender key (key at `key_index`).
     *
     * @throws {Error} if the wallet is not loaded or initialized.
     * @readonly
     */
    get publicKey() {
        if (this.isInitialized()) {
            const keys = privateMapGet(this, __vault)._keys;
            return keys.get(this.key_index)?.publicKey;
        }
        js_moi_utils_1.ErrorUtils.throwError("Public key not found. The wallet has not been loaded or initialized.", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
    }
    /**
     * Identifier associated with the wallet.
     * .
     * @readonly
     */
    get identifier() {
        return this.getIdentifier();
    }
    /**
     * Key id associated with the wallet.
     * .
     * @readonly
     */
    get keyId() {
        return this.getKeyId();
    }
    /**
     * sub account id associated with the wallet.
     * .
     * @readonly
     */
    get subAccountId() {
        return this.getSubAccountId();
    }
    /**
     * Curve associated with the wallet.
     *
     * @readonly
     */
    get curve() {
        if (this.isInitialized()) {
            return privateMapGet(this, __vault)._curve;
        }
        js_moi_utils_1.ErrorUtils.throwError("Curve not found. The wallet has not been loaded or initialized.", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
    }
    /**
     * Retrieves the public key of the sender key (key at `key_index`).
     *
     * @returns {string} The public key as a hex string.
     */
    getPublicKey() {
        const keys = privateMapGet(this, __vault)._keys;
        return keys.get(this.key_index)?.publicKey;
    }
    /**
     * Retrieves the identifier for the wallet.
     * The identifier is always derived from the primary key (set at initialization).
     *
     * @returns {Identifier} A promise that resolves to the wallet's identifier.
     */
    async getIdentifier() {
        const publickey = privateMapGet(this, __vault)._pkey;
        const fingerprint = (0, js_moi_utils_1.hexToBytes)(publickey).slice(1, 25);
        return (0, js_moi_identifiers_1.createParticipantId)({ fingerprint, variant: this.sub_account_index, tag: js_moi_identifiers_1.ParticipantTagV0 });
    }
    /**
     * Retrieves the sender key id.
     *
     * @returns {number} A promise that resolves to the key index.
     */
    async getKeyId() {
        return this.key_index;
    }
    /**
     * Adds a key to the wallet. All keys registered on this wallet belong to the
     * same participant and will each contribute a signature when `signInteraction`
     * is called, satisfying multisig threshold requirements.
     *
     * @param {number} keyId - The key's position in the participant's key list.
     * @param {string} publicKey - The public key as a hex string.
     * @param {string} privateKey - The private key as a hex string.
     * @returns {Wallet} The current wallet instance for chaining.
     */
    addKey(keyId, publicKey, privateKey) {
        const keys = privateMapGet(this, __vault)._keys;
        keys.set(keyId, { privateKey, publicKey });
        return this;
    }
    /**
     * Updates the sender key. The key must already be registered via `addKey`.
     * The sender key is used as `sender.key_id` in interactions and must always
     * be present in the signatures.
     *
     * @param {number} keyId - The key ID to set as the sender key.
     * @throws {Error} if the key is not registered on this wallet.
     */
    setKeyId(keyId) {
        const keys = privateMapGet(this, __vault)._keys;
        if (!keys.has(keyId)) {
            js_moi_utils_1.ErrorUtils.throwError(`Key ${keyId} is not registered`, js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        this.key_index = keyId;
    }
    /**
     * Returns the list of keys currently registered on this wallet.
     *
     * @returns {{ key_id: number; public_key: string }[]} Array of registered keys with their IDs and public keys.
     */
    getKeys() {
        const keys = privateMapGet(this, __vault)._keys;
        return Array.from(keys.entries()).map(([key_id, entry]) => ({
            key_id,
            public_key: entry.publicKey,
        }));
    }
    /**
     * Removes a key from the wallet.
     *
     * @param {number} keyId - The key ID to remove.
     * @returns {Wallet} The current wallet instance for chaining.
     * @throws {Error} if attempting to remove the sender key (`key_index`), as it is required for signing.
     */
    removeKey(keyId) {
        if (keyId === this.key_index) {
            js_moi_utils_1.ErrorUtils.throwError("Cannot remove the sender key", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        const keys = privateMapGet(this, __vault)._keys;
        keys.delete(keyId);
        return this;
    }
    /**
     * Retrieves the sub account id.
     *
     * @returns {number} A promise that resolves to the sub account index.
     */
    getSubAccountId() {
        return this.sub_account_index;
    }
    /**
     * Updates the sub account id.
     */
    setSubAccountId(id) {
        this.sub_account_index = id;
    }
    /**
     * Connects the wallet to the given provider.
     *
     * @param {AbstractProvider} provider - The provider to connect.
     */
    connect(provider) {
        this.provider = provider;
    }
    /**
     * Signs a message using the sender key's private key and the specified
     * signature algorithm.
     *
     * @param {Uint8Array} message - The message to sign as a Uint8Array.
     * @param {SigType} sigAlgo - The signature algorithm to use.
     * @returns {string} The signature as a string.
     * @throws {Error} if the signature type is unsupported or undefined, or if
     * there is an error during signing.
     */
    async sign(message, keyId, sigAlgo) {
        if (sigAlgo == null) {
            js_moi_utils_1.ErrorUtils.throwError("Signature type cannot be undefined", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        switch (sigAlgo.sigName) {
            case "ECDSA_S256": {
                const keys = privateMapGet(this, __vault)._keys;
                const _sigAlgo = this.signingAlgorithms["ecdsa_secp256k1"];
                const sig = _sigAlgo.sign(buffer_1.Buffer.from(message), keys.get(keyId).privateKey);
                const sigBytes = sig.serialize();
                return (0, js_moi_utils_1.bytesToHex)(sigBytes);
            }
            default: {
                js_moi_utils_1.ErrorUtils.throwError("Unsupported signature type", js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
            }
        }
    }
    /**
     * Signs an interaction object using all registered keys on this wallet.
     * Each key produces its own signature entry, enabling multisig interactions.
     * The interaction object is serialized into POLO bytes before signing.
     *
     * @param {InteractionObject} ixObject - The interaction object to sign.
     * @returns {InteractionRequest} The signed interaction request containing
     * the serialized interaction object and all signatures.
     * @throws {Error} if there is an error during signing or serialization.
     */
    async signInteraction(ixObject, _sigAlgo) {
        try {
            const ixData = (0, serializer_1.serializeIxObject)(ixObject);
            const participantId = ixObject.sender.id;
            const sigAlgo = this.signingAlgorithms["ecdsa_secp256k1"];
            const keys = privateMapGet(this, __vault)._keys;
            if (!keys.has(ixObject.sender.key_id)) {
                js_moi_utils_1.ErrorUtils.throwError(`Sender key ${ixObject.sender.key_id} is not registered`, js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
            }
            const signatures = await Promise.all(Array.from(keys.keys()).map(async (keyId) => {
                const signature = await this.sign(buffer_1.Buffer.from(ixData), keyId, sigAlgo);
                return {
                    id: participantId,
                    key_id: keyId,
                    signature: signature,
                };
            }));
            const rawSign = (0, serializer_1.serializeIxSignatures)(signatures);
            return {
                ix_args: (0, js_moi_utils_1.bytesToHex)(ixData),
                signatures: (0, js_moi_utils_1.bytesToHex)(rawSign),
            };
        }
        catch (err) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to sign interaction", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    /**
     * Initializes the wallet from a provided mnemonic.
     *
     * @param {string} mnemonic - The mnemonic to initialize the wallet with.
     * @param {string | undefined} path - The derivation path to use for key generation. (optional)
     * @param {string[] | undefined} wordlist - The wordlist to use for mnemonic generation. (optional)
     *
     * @returns {Promise<Wallet>} a promise that resolves to a `Wallet` instance.
     * @throws {Error} if there is an error during initialization.
     *
     * @example
     * // Initializing a wallet from mnemonic
     * const mnemonic = "hollow appear story text start mask salt social child ..."
     * const wallet = await Wallet.fromMnemonic(mnemonic);
     *
     * @example
     * // Initializing a wallet from mnemonic with custom path
     * const mnemonic = "hollow appear story text start mask salt social child ...";
     * const path = "m/44'/60'/0'/0/0";
     * const wallet = await Wallet.fromMnemonic(mnemonic, path);
     */
    static async fromMnemonic(mnemonic, path, wordlist) {
        try {
            mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, wordlist), wordlist);
            const seed = await bip39.mnemonicToSeed(mnemonic, undefined);
            const masterNode = js_moi_hdnode_1.HDNode.fromSeed(seed);
            const childNode = masterNode.derivePath(path ? path : js_moi_constants_1.MOI_DERIVATION_PATH);
            const wallet = new Wallet(childNode, CURVE.SECP256K1);
            privateMapSet(wallet, __vault, {
                ...privateMapGet(wallet, __vault),
                _mnemonic: mnemonic,
            });
            return wallet;
        }
        catch (error) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to load wallet from mnemonic", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, {
                originalError: error,
            });
        }
    }
    /**
     * Initializes the wallet from a provided mnemonic synchronously.
     *
     * @param {string} mnemonic - The mnemonic to initialize the wallet with.
     * @param {string | undefined} path - The derivation path to use for key generation. (optional)
     * @param {string[] | undefined} wordlist - The wordlist to use for mnemonic generation. (optional)
     *
     * @returns {Promise<Wallet>} a promise that resolves to a `Wallet` instance.
     * @throws {Error} if there is an error during initialization.
     *
     * @example
     * // Initializing a wallet from mnemonic
     * const mnemonic = "hollow appear story text start mask salt social child ..."
     * const wallet = Wallet.fromMnemonicSync();
     *
     * @example
     * // Initializing a wallet from mnemonic with custom path
     * const mnemonic = "hollow appear story text start mask salt social child ...";
     * const path = "m/44'/60'/0'/0/0";
     * const wallet = Wallet.fromMnemonicSync(mnemonic, path);
     */
    static fromMnemonicSync(mnemonic, path, wordlist) {
        try {
            mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, wordlist), wordlist);
            const seed = bip39.mnemonicToSeedSync(mnemonic, undefined);
            const masterNode = js_moi_hdnode_1.HDNode.fromSeed(seed);
            const childNode = masterNode.derivePath(path ? path : js_moi_constants_1.MOI_DERIVATION_PATH);
            const wallet = new Wallet(childNode, CURVE.SECP256K1);
            privateMapSet(wallet, __vault, {
                ...privateMapGet(wallet, __vault),
                _mnemonic: mnemonic,
            });
            return wallet;
        }
        catch (error) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to load wallet from mnemonic", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, {
                originalError: error,
            });
        }
    }
    /**
     * Generates a random mnemonic and initializes the wallet from it.
     *
     * @returns {Promise<Wallet>} a promise that resolves to a `Wallet` instance.
     *
     * @throws {Error} if there is an error generating the random mnemonic.
     */
    static async createRandom() {
        try {
            const _random16Bytes = buffer_1.Buffer.from((0, utils_1.randomBytes)(16));
            var mnemonic = bip39.entropyToMnemonic(_random16Bytes, undefined);
            return await Wallet.fromMnemonic(mnemonic);
        }
        catch (err) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to create random mnemonic", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    /**
     * Generates a random mnemonic and initializes the wallet from it.
     *
     * @returns {Wallet} a instance of `Wallet`.
     *
     * @throws {Error} if there is an error generating the random mnemonic.
     */
    static createRandomSync() {
        try {
            const _random16Bytes = buffer_1.Buffer.from((0, utils_1.randomBytes)(16));
            var mnemonic = bip39.entropyToMnemonic(_random16Bytes, undefined);
            return Wallet.fromMnemonicSync(mnemonic);
        }
        catch (err) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to create random mnemonic", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
}
exports.Wallet = Wallet;
//# sourceMappingURL=wallet.js.map