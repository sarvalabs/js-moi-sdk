import { randomBytes } from "@noble/hashes/utils";
import { Buffer } from "buffer";
import elliptic from "elliptic";
import * as bip39 from "js-moi-bip39";
import { MOI_DERIVATION_PATH } from "js-moi-constants";
import { HDNode } from "js-moi-hdnode";
import { Signer } from "js-moi-signer";
import { CustomError, ErrorCode, ErrorUtils, bufferToUint8, bytesToHex, hexToBytes } from "js-moi-utils";
import * as SigningKeyErrors from "./errors";
import { decryptKeystoreData, encryptKeystoreData } from "./keystore";
import { serializeIxObject, serializeIxSignatures } from "./serializer";
import { createParticipantId, ParticipantTagV0 } from "js-moi-identifiers";
export var CURVE;
(function (CURVE) {
    CURVE["SECP256K1"] = "secp256k1";
})(CURVE || (CURVE = {}));
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
export class Wallet extends Signer {
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
                ErrorUtils.throwError("Key is required, cannot be undefined", ErrorCode.INVALID_ARGUMENT);
            }
            if (curve !== CURVE.SECP256K1) {
                ErrorUtils.throwError(`Unsupported curve: ${curve}`, ErrorCode.UNSUPPORTED_OPERATION);
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
            ErrorUtils.throwError("Failed to load wallet", ErrorCode.UNKNOWN_ERROR, { originalError: error });
        }
    }
    static deriveKeys(key, curve = CURVE.SECP256K1) {
        const ecPrivKey = new elliptic.ec(curve);
        const keyBuffer = Buffer.isBuffer(key) ? key : Buffer.from(key, "hex");
        const keyInBytes = bufferToUint8(keyBuffer);
        const keyPair = ecPrivKey.keyFromPrivate(keyInBytes);
        return { privKey: keyPair.getPrivate("hex"), pubKey: keyPair.getPublic(true, "hex") };
    }
    static async deriveAccountKey(mnemonic, path, wordlist) {
        mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, wordlist), wordlist);
        const seed = await bip39.mnemonicToSeed(mnemonic, undefined);
        const masterNode = HDNode.fromSeed(seed);
        const childNode = masterNode.derivePath(path ? path : MOI_DERIVATION_PATH);
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
            return keys.get(this.key_index).privateKey;
        }
        ErrorUtils.throwError("Private key not found. The wallet has not been loaded or initialized.", ErrorCode.NOT_INITIALIZED);
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
        ErrorUtils.throwError("Mnemonic not found. The wallet has not been loaded or initialized.", ErrorCode.NOT_INITIALIZED);
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
            return keys.get(this.key_index).publicKey;
        }
        ErrorUtils.throwError("Public key not found. The wallet has not been loaded or initialized.", ErrorCode.NOT_INITIALIZED);
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
        ErrorUtils.throwError("Curve not found. The wallet has not been loaded or initialized.", ErrorCode.NOT_INITIALIZED);
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
        const fingerprint = hexToBytes(publickey).slice(1, 25);
        return createParticipantId({ fingerprint, variant: this.sub_account_index, tag: ParticipantTagV0 });
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
            ErrorUtils.throwError(`Key ${keyId} is not registered`, ErrorCode.INVALID_ARGUMENT);
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
            ErrorUtils.throwError("Cannot remove the sender key", ErrorCode.INVALID_ARGUMENT);
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
            ErrorUtils.throwError("Signature type cannot be undefined", ErrorCode.INVALID_ARGUMENT);
        }
        switch (sigAlgo.sigName) {
            case "ECDSA_S256": {
                const keys = privateMapGet(this, __vault)._keys;
                const _sigAlgo = this.signingAlgorithms["ecdsa_secp256k1"];
                const sig = _sigAlgo.sign(Buffer.from(message), keys.get(keyId).privateKey);
                const sigBytes = sig.serialize();
                return bytesToHex(sigBytes);
            }
            default: {
                ErrorUtils.throwError("Unsupported signature type", ErrorCode.UNSUPPORTED_OPERATION);
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
            const ixData = serializeIxObject(ixObject);
            const participantId = ixObject.sender.id;
            const sigAlgo = this.signingAlgorithms["ecdsa_secp256k1"];
            const keys = privateMapGet(this, __vault)._keys;
            if (!keys.has(ixObject.sender.key_id)) {
                ErrorUtils.throwError(`Sender key ${ixObject.sender.key_id} is not registered`, ErrorCode.INVALID_ARGUMENT);
            }
            const signatures = await Promise.all(Array.from(keys.keys()).map(async (keyId) => {
                const signature = await this.sign(Buffer.from(ixData), keyId, sigAlgo);
                return {
                    id: participantId,
                    key_id: keyId,
                    signature: signature,
                };
            }));
            const rawSign = serializeIxSignatures(signatures);
            return {
                ix_args: bytesToHex(ixData),
                signatures: bytesToHex(rawSign),
            };
        }
        catch (err) {
            ErrorUtils.throwError("Failed to sign interaction", ErrorCode.UNKNOWN_ERROR, { originalError: err });
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
            const masterNode = HDNode.fromSeed(seed);
            const childNode = masterNode.derivePath(path ? path : MOI_DERIVATION_PATH);
            const wallet = new Wallet(childNode, CURVE.SECP256K1);
            privateMapSet(wallet, __vault, {
                ...privateMapGet(wallet, __vault),
                _mnemonic: mnemonic,
            });
            return wallet;
        }
        catch (error) {
            ErrorUtils.throwError("Failed to load wallet from mnemonic", ErrorCode.UNKNOWN_ERROR, {
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
            const masterNode = HDNode.fromSeed(seed);
            const childNode = masterNode.derivePath(path ? path : MOI_DERIVATION_PATH);
            const wallet = new Wallet(childNode, CURVE.SECP256K1);
            privateMapSet(wallet, __vault, {
                ...privateMapGet(wallet, __vault),
                _mnemonic: mnemonic,
            });
            return wallet;
        }
        catch (error) {
            ErrorUtils.throwError("Failed to load wallet from mnemonic", ErrorCode.UNKNOWN_ERROR, {
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
            const _random16Bytes = Buffer.from(randomBytes(16));
            var mnemonic = bip39.entropyToMnemonic(_random16Bytes, undefined);
            return await Wallet.fromMnemonic(mnemonic);
        }
        catch (err) {
            ErrorUtils.throwError("Failed to create random mnemonic", ErrorCode.UNKNOWN_ERROR, { originalError: err });
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
            const _random16Bytes = Buffer.from(randomBytes(16));
            var mnemonic = bip39.entropyToMnemonic(_random16Bytes, undefined);
            return Wallet.fromMnemonicSync(mnemonic);
        }
        catch (err) {
            ErrorUtils.throwError("Failed to create random mnemonic", ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    /**
     * Exports the wallet's primary key as an encrypted keystore object.
     *
     * The primary key is the key that defines the participant's on-chain identity (the key
     * from which the `Identifier` is derived). It is always the key passed at construction
     * time, regardless of which key is currently set as the sender via `setKeyId`.
     *
     * The returned keystore includes the participant `Identifier` in plaintext under the
     * `id` field, mirroring the address field in the EIP-55 / Web3 Secret Storage format,
     * so the wallet can be identified without decrypting.
     *
     * Note: Only the primary key is persisted. Additional keys registered via `addKey`
     * must be re-added after restoring with `fromKeystore`.
     *
     * @param {string} password - Password used to encrypt the keystore.
     * @returns {Keystore} The encrypted keystore containing the participant id and cipher data.
     * @throws {Error} if the wallet is not initialized or encryption fails.
     *
     * @example
     * const wallet = await Wallet.fromMnemonic("hollow appear story text start mask salt ...");
     * const keystore = wallet.generateKeystore("my-password");
     * fs.writeFileSync("wallet.json", JSON.stringify(keystore));
     */
    generateKeystore(password) {
        if (!this.isInitialized()) {
            ErrorUtils.throwError("The wallet has not been loaded or initialized.", ErrorCode.NOT_INITIALIZED);
        }
        try {
            const vault = privateMapGet(this, __vault);
            const keys = vault._keys;
            const pkey = vault._pkey;
            // Always encrypt the primary key — the one that defines the participant identity
            const primaryEntry = Array.from(keys.values()).find(e => e.publicKey === pkey);
            if (!primaryEntry) {
                ErrorUtils.throwError("Primary key not found in wallet", ErrorCode.NOT_INITIALIZED);
            }
            // Compute participant identifier from the primary public key (same logic as getIdentifier)
            const fingerprint = hexToBytes(pkey).slice(1, 25);
            const id = createParticipantId({ fingerprint, variant: this.sub_account_index, tag: ParticipantTagV0 });
            const keystore = encryptKeystoreData(Buffer.from(primaryEntry.privateKey, "hex"), password);
            return { ...keystore, id: id.toHex() };
        }
        catch (err) {
            ErrorUtils.throwError("Failed to generate keystore", ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    /**
     * Restores a wallet from an encrypted keystore produced by `generateKeystore`.
     *
     * After decryption the participant `Identifier` derived from the key is verified
     * against the `id` field stored in the keystore (if present). This mirrors the
     * address-verification step in the EIP-55 / Web3 Secret Storage format and ensures
     * the password was correct and the keystore has not been tampered with.
     *
     * Keystores that pre-date the `id` field (or that originate from external tools)
     * are accepted without verification — the `id` check is skipped when the field
     * is absent.
     *
     * Note: HD derivation data (mnemonic, derivation path) is not stored in the keystore.
     * Additional multi-sig keys registered via `addKey` must be re-added after loading.
     *
     * @param {string | Keystore} keystore - The keystore as a JSON string or parsed object.
     * @param {string} password - Password used to decrypt the keystore.
     * @param {WalletOption} options - Optional configuration (subAccountId, provider).
     *   `subAccountId` must match the value used when the keystore was generated, or
     *   verification of the stored `id` will fail.
     * @returns {Wallet} A `Wallet` instance initialized with the decrypted primary key.
     * @throws {Error} if decryption fails, the password is incorrect, or the participant
     *   id derived from the decrypted key does not match the `id` stored in the keystore.
     *
     * @example
     * const wallet = Wallet.fromKeystore(fs.readFileSync("wallet.json", "utf8"), "my-password");
     */
    static fromKeystore(keystore, password, options) {
        try {
            const ks = typeof keystore === "string" ? JSON.parse(keystore) : keystore;
            const privKeyBuffer = decryptKeystoreData(ks, password);
            // Verify the decrypted key produces the same participant identifier stored in the keystore
            if (ks.id != null) {
                const { pubKey } = Wallet.deriveKeys(privKeyBuffer, CURVE.SECP256K1);
                const fingerprint = hexToBytes(pubKey).slice(1, 25);
                const subAccountId = options?.subAccountId ?? DEFAULT_SUB_ACCOUNT_ID;
                const derivedId = createParticipantId({ fingerprint, variant: subAccountId, tag: ParticipantTagV0 });
                if (derivedId.toHex() !== ks.id) {
                    ErrorUtils.throwError("Keystore participant id does not match the decrypted key", ErrorCode.INVALID_ARGUMENT);
                }
            }
            const hdNode = HDNode.fromPrivateKey(privKeyBuffer);
            return new Wallet(hdNode, CURVE.SECP256K1, options);
        }
        catch (err) {
            if (err instanceof CustomError) {
                throw err;
            }
            ErrorUtils.throwError("Failed to load wallet from keystore", ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
}
//# sourceMappingURL=wallet.js.map