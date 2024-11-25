import { randomBytes } from "@noble/hashes/utils";
import * as bip39 from "@zenz-solutions/js-moi-bip39";
import { MOI_DERIVATION_PATH } from "@zenz-solutions/js-moi-constants";
import { HDNode } from "@zenz-solutions/js-moi-hdnode";
import { Signer } from "@zenz-solutions/js-moi-signer";
import { ErrorCode, ErrorUtils, bufferToUint8, bytesToHex } from "@zenz-solutions/js-moi-utils";
import { Buffer } from "buffer";
import elliptic from "elliptic";
import * as SigningKeyErrors from "./errors";
import { decryptKeystoreData, encryptKeystoreData } from "./keystore";
import { serializeIxObject } from "./serializer";
export var CURVE;
(function (CURVE) {
    CURVE["SECP256K1"] = "secp256k1";
})(CURVE || (CURVE = {}));
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
    constructor(key, curve) {
        try {
            super();
            __vault.set(this, {
                value: void 0,
            });
            let privKey, pubKey;
            if (!key) {
                ErrorUtils.throwError("Key is required, cannot be undefined", ErrorCode.INVALID_ARGUMENT);
            }
            if (curve !== CURVE.SECP256K1) {
                ErrorUtils.throwError(`Unsupported curve: ${curve}`, ErrorCode.UNSUPPORTED_OPERATION);
            }
            const ecPrivKey = new elliptic.ec(curve);
            const keyBuffer = key instanceof Buffer ? key : Buffer.from(key, "hex");
            const keyInBytes = bufferToUint8(keyBuffer);
            const keyPair = ecPrivKey.keyFromPrivate(keyInBytes);
            privKey = keyPair.getPrivate("hex");
            pubKey = keyPair.getPublic(true, "hex");
            privateMapSet(this, __vault, {
                _key: privKey,
                _public: pubKey,
                _curve: curve,
            });
        }
        catch (error) {
            ErrorUtils.throwError("Failed to load wallet", ErrorCode.UNKNOWN_ERROR, { originalError: error });
        }
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
     * Generates a keystore file from the wallet's private key, encrypted with a password.
     *
     * @param {string} password Used for encrypting the keystore data.
     * @returns {Keystore} The generated keystore object.
     * @throws {Error} if the wallet is not initialized or loaded, or if there
     * is an error generating the keystore.
     */
    generateKeystore(password) {
        if (!this.isInitialized()) {
            ErrorUtils.throwError("Keystore not found. The wallet has not been loaded or initialized.", ErrorCode.NOT_INITIALIZED);
        }
        try {
            const data = Buffer.from(this.privateKey, "hex");
            return encryptKeystoreData(data, password);
        }
        catch (err) {
            ErrorUtils.throwError("Failed to generate keystore", ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    /**
     * Private key associated with the wallet.
     *
     * @throws {Error} if the wallet is not loaded or initialized.
     * @readonly
     */
    get privateKey() {
        if (this.isInitialized()) {
            return privateMapGet(this, __vault)._key;
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
     * Public key associated with the wallet.
     *
     * @throws {Error} if the wallet is not loaded or initialized.
     * @readonly
     */
    get publicKey() {
        if (this.isInitialized()) {
            return privateMapGet(this, __vault)._public;
        }
        ErrorUtils.throwError("Public key not found. The wallet has not been loaded or initialized.", ErrorCode.NOT_INITIALIZED);
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
     * Retrieves the address associated with the wallet.
     *
     * @returns {string} The address as a string.
     */
    getAddress() {
        return "0x" + this.publicKey.slice(2);
    }
    /**
     * Address associated with the wallet.
     *
     * @readonly
     */
    get address() {
        return this.getAddress();
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
     * Signs a message using the wallet's private key and the specified
     * signature algorithm.
     *
     * @param {Uint8Array} message - The message to sign as a Uint8Array.
     * @param {SigType} sigAlgo - The signature algorithm to use.
     * @returns {string} The signature as a string.
     * @throws {Error} if the signature type is unsupported or undefined, or if
     * there is an error during signing.
     */
    sign(message, sigAlgo) {
        if (sigAlgo == null) {
            ErrorUtils.throwError("Signature type cannot be undefined", ErrorCode.INVALID_ARGUMENT);
        }
        switch (sigAlgo.sigName) {
            case "ECDSA_S256": {
                const _sigAlgo = this.signingAlgorithms["ecdsa_secp256k1"];
                const sig = _sigAlgo.sign(Buffer.from(message), this.privateKey);
                const sigBytes = sig.serialize();
                return bytesToHex(sigBytes);
            }
            default: {
                ErrorUtils.throwError("Unsupported signature type", ErrorCode.UNSUPPORTED_OPERATION);
            }
        }
    }
    /**
     * Signs an interaction object using the wallet's private key and the
     * specified signature algorithm. The interaction object is serialized
     * into POLO bytes before signing.
     *
     * @param {InteractionObject} ixObject - The interaction object to sign.
     * @param {SigType} sigAlgo - The signature algorithm to use.
     * @returns {InteractionRequest} The signed interaction request containing
     * the serialized interaction object and the signature.
     * @throws {Error} if there is an error during signing or serialization.
     */
    signInteraction(ixObject, sigAlgo) {
        try {
            const ixData = serializeIxObject(ixObject);
            const signature = this.sign(ixData, sigAlgo);
            return {
                ix_args: bytesToHex(ixData),
                signature: signature,
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
            const wallet = new Wallet(childNode.privateKey(), CURVE.SECP256K1);
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
            const wallet = new Wallet(childNode.privateKey(), CURVE.SECP256K1);
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
     * Initializes the wallet from a provided keystore.
     *
     * @param {string} keystore - The keystore to initialize the wallet with.
     * @param {string} password - The password used to decrypt the keystore.
     *
     * @returns {Wallet} a instance of `Wallet`.
     * @throws {Error} if there is an error during initialization.
     */
    static fromKeystore(keystore, password) {
        try {
            const privateKey = decryptKeystoreData(JSON.parse(keystore), password);
            return new Wallet(privateKey, CURVE.SECP256K1);
        }
        catch (err) {
            ErrorUtils.throwError("Failed to load wallet from keystore", ErrorCode.UNKNOWN_ERROR, {
                originalError: err,
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
}
//# sourceMappingURL=wallet.js.map