import { randomBytes } from "@noble/hashes/utils";
import { Buffer } from "buffer";
import elliptic from "elliptic";
import * as bip39 from "js-moi-bip39";
import { MOI_DERIVATION_PATH } from "js-moi-constants";
import { HDNode } from "js-moi-hdnode";
import { AbstractProvider, InteractionObject, InteractionRequest } from "js-moi-providers";
import { SigType, Signer } from "js-moi-signer";
import { ErrorCode, ErrorUtils, Hex, bufferToUint8, bytesToHex, hexToBytes } from "js-moi-utils";

import * as SigningKeyErrors from "./errors";
import { serializeIxObject, serializeIxSignatures } from "./serializer";
import { type WalletOption } from "../types/wallet";
import { Identifier, createParticipantId, ParticipantTagV0 } from "js-moi-identifiers";

export enum CURVE {
    SECP256K1 = "secp256k1",
}

const DEFAULT_KEY_ID = 0;
const DEFAULT_SUB_ACCOUNT_ID = 0

/**
 * Retrieves the value associated with the receiver from a private map.
 * Throws an error if the receiver is not found in the map.
 *
 * @param receiver - The receiver object.
 * @param privateMap - The private map containing the receiver and its associated value.
 * @returns The value associated with the receiver.
 * @throws Error if the receiver is not found in the private map.
 */
const privateMapGet = (receiver: any, privateMap: any) => {
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
const privateMapSet = (receiver: any, privateMap: any, value: any) => {
    if (!privateMap.has(receiver)) {
        SigningKeyErrors.ErrPrivateSet();
    }
    const descriptor = privateMap.get(receiver);
    if (descriptor.set) {
        descriptor.set.call(receiver, value);
    } else {
        descriptor.value = value;
    }
    return value;
};

interface KeyEntry {
    privateKey: string;
    publicKey: string;
}

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
    private key_index: number;
    private sub_account_index: number;

    constructor(hdNode: HDNode, curve: string, options?: WalletOption) {
        try {
            super(options?.provider);

            __vault.set(this, {
                value: void 0,
            });

            const key = hdNode.privateKey()

            if (!key) {
                ErrorUtils.throwError("Key is required, cannot be undefined", ErrorCode.INVALID_ARGUMENT);
            }

            if (curve !== CURVE.SECP256K1) {
                ErrorUtils.throwError(`Unsupported curve: ${curve}`, ErrorCode.UNSUPPORTED_OPERATION);
            }

            const { privKey, pubKey } = Wallet.deriveKeys(key, curve)

            const keyId = options?.keyId ?? DEFAULT_KEY_ID;
            const keys = new Map<number, KeyEntry>();
            keys.set(keyId, { privateKey: privKey, publicKey: pubKey });

            privateMapSet(this, __vault, {
                _pkey: pubKey,
                _node: hdNode,
                _curve: curve,
                _keys: keys,
            });

            this.key_index = keyId;
            this.sub_account_index = options?.subAccountId ?? DEFAULT_SUB_ACCOUNT_ID;
        } catch (error) {
            ErrorUtils.throwError("Failed to load wallet", ErrorCode.UNKNOWN_ERROR, { originalError: error });
        }
    }

    public static deriveKeys(key: Buffer, curve = CURVE.SECP256K1): { privKey: string; pubKey: string } {
        const ecPrivKey = new elliptic.ec(curve);
        const keyBuffer = Buffer.isBuffer(key) ? key : Buffer.from(key, "hex");
        const keyInBytes = bufferToUint8(keyBuffer);
        const keyPair = ecPrivKey.keyFromPrivate(keyInBytes);

        return { privKey: keyPair.getPrivate("hex"), pubKey: keyPair.getPublic(true, "hex") }
    }

    public static async deriveAccountKey(mnemonic: string, path?: string, wordlist?: string[]): Promise<{ privKey: string; pubKey: string; }> {
        mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, wordlist), wordlist);
        const seed = await bip39.mnemonicToSeed(mnemonic, undefined);
        const masterNode = HDNode.fromSeed(seed);
        const childNode = masterNode.derivePath(path ? path : MOI_DERIVATION_PATH);

        return Wallet.deriveKeys(childNode.privateKey())
    }

    /**
     * Checks if the wallet is initialized.
     *
     * @returns {boolean} true if the wallet is initialized, false otherwise.
     */
    public isInitialized(): boolean {
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
    public get privateKey(): string {
        if (this.isInitialized()) {
            const keys: Map<number, KeyEntry> = privateMapGet(this, __vault)._keys;
            return keys.get(this.key_index)!.privateKey;
        }

        ErrorUtils.throwError(
            "Private key not found. The wallet has not been loaded or initialized.",
            ErrorCode.NOT_INITIALIZED
        );
    }

    /**
     * Retrieves the mnemonic associated with the wallet.
     *
     * @throws {Error} if the wallet is not loaded or initialized.
     * @readonly
     */
    public get mnemonic(): string {
        if (this.isInitialized()) {
            return privateMapGet(this, __vault)._mnemonic;
        }

        ErrorUtils.throwError(
            "Mnemonic not found. The wallet has not been loaded or initialized.",
            ErrorCode.NOT_INITIALIZED
        );
    }

    /**
     * Public key of the sender key (key at `key_index`).
     *
     * @throws {Error} if the wallet is not loaded or initialized.
     * @readonly
     */
    public get publicKey(): string {
        if (this.isInitialized()) {
            const keys: Map<number, KeyEntry> = privateMapGet(this, __vault)._keys;
            return keys.get(this.key_index)!.publicKey;
        }

        ErrorUtils.throwError(
            "Public key not found. The wallet has not been loaded or initialized.",
            ErrorCode.NOT_INITIALIZED
        );
    }

    /**
     * Identifier associated with the wallet.
     * .
     * @readonly
     */
    public get identifier(): Promise<Identifier> {
        return this.getIdentifier()
    }

    /**
     * Key id associated with the wallet.
     * .
     * @readonly
     */
    public get keyId(): Promise<number> {
        return this.getKeyId()
    }

    /**
     * sub account id associated with the wallet.
     * .
     * @readonly
     */
    public get subAccountId(): number {
        return this.getSubAccountId()
    }

    /**
     * Curve associated with the wallet.
     *
     * @readonly
     */
    public get curve(): string {
        if (this.isInitialized()) {
            return privateMapGet(this, __vault)._curve;
        }

        ErrorUtils.throwError(
            "Curve not found. The wallet has not been loaded or initialized.",
            ErrorCode.NOT_INITIALIZED
        );
    }

    /**
     * Retrieves the public key of the sender key (key at `key_index`).
     *
     * @returns {string} The public key as a hex string.
     */
    public getPublicKey(): Hex {
        const keys: Map<number, KeyEntry> = privateMapGet(this, __vault)._keys;
        return keys.get(this.key_index)?.publicKey as Hex;
    }

    /**
     * Retrieves the identifier for the wallet.
     * The identifier is always derived from the primary key (set at initialization).
     *
     * @returns {Identifier} A promise that resolves to the wallet's identifier.
     */
    public async getIdentifier(): Promise<Identifier> {
        const publickey = privateMapGet(this, __vault)._pkey;
        const fingerprint = hexToBytes(publickey).slice(1, 25);

        return createParticipantId({ fingerprint, variant: this.sub_account_index, tag: ParticipantTagV0 });
    }

    /**
     * Retrieves the sender key id.
     *
     * @returns {number} A promise that resolves to the key index.
     */
    public async getKeyId(): Promise<number> {
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
    public addKey(keyId: number, publicKey: string, privateKey: string): Wallet {
        const keys: Map<number, KeyEntry> = privateMapGet(this, __vault)._keys;
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
    public setKeyId(keyId: number): void {
        const keys: Map<number, KeyEntry> = privateMapGet(this, __vault)._keys;
        if (!keys.has(keyId)) {
            ErrorUtils.throwError(
                `Key ${keyId} is not registered`,
                ErrorCode.INVALID_ARGUMENT
            );
        }
        this.key_index = keyId;
    }

    /**
     * Returns the list of keys currently registered on this wallet.
     *
     * @returns {{ key_id: number; public_key: string }[]} Array of registered keys with their IDs and public keys.
     */
    public getKeys(): { key_id: number; public_key: string }[] {
        const keys: Map<number, KeyEntry> = privateMapGet(this, __vault)._keys;
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
    public removeKey(keyId: number): Wallet {
        if (keyId === this.key_index) {
            ErrorUtils.throwError(
                "Cannot remove the sender key",
                ErrorCode.INVALID_ARGUMENT
            );
        }
        const keys: Map<number, KeyEntry> = privateMapGet(this, __vault)._keys;
        keys.delete(keyId);
        return this;
    }

    /**
     * Retrieves the sub account id.
     *
     * @returns {number} A promise that resolves to the sub account index.
     */
    public getSubAccountId(): number {
        return this.sub_account_index;
    }

    /**
     * Updates the sub account id.
     */
    public setSubAccountId(id: number) {
        this.sub_account_index = id
    }

    /**
     * Connects the wallet to the given provider.
     *
     * @param {AbstractProvider} provider - The provider to connect.
     */
    public connect(provider: AbstractProvider): void {
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
    public async sign(message: Uint8Array, keyId: number, sigAlgo: SigType): Promise<string> {
        if (sigAlgo == null) {
            ErrorUtils.throwError("Signature type cannot be undefined", ErrorCode.INVALID_ARGUMENT);
        }

        switch (sigAlgo.sigName) {
            case "ECDSA_S256": {
                const keys: Map<number, KeyEntry> = privateMapGet(this, __vault)._keys;
                const _sigAlgo = this.signingAlgorithms["ecdsa_secp256k1"];
                const sig = _sigAlgo.sign(Buffer.from(message), keys.get(keyId)!.privateKey);
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
    public async signInteraction(ixObject: InteractionObject, _sigAlgo: SigType): Promise<InteractionRequest> {
        try {
            const ixData = serializeIxObject(ixObject);
            const participantId = ixObject.sender.id;
            const sigAlgo = this.signingAlgorithms["ecdsa_secp256k1"];
            const keys: Map<number, KeyEntry> = privateMapGet(this, __vault)._keys;

            if (!keys.has(ixObject.sender.key_id)) {
                ErrorUtils.throwError(
                    `Sender key ${ixObject.sender.key_id} is not registered`,
                    ErrorCode.INVALID_ARGUMENT
                );
            }

            const signatures = await Promise.all(
                Array.from(keys.keys()).map(async (keyId) => {
                    const signature = await this.sign(Buffer.from(ixData), keyId, sigAlgo);
                    return {
                        id: participantId,
                        key_id: keyId,
                        signature: signature as Hex,
                    };
                })
            );

            const rawSign = serializeIxSignatures(signatures)

            return {
                ix_args: bytesToHex(ixData),
                signatures: bytesToHex(rawSign),
            };
        } catch (err) {
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
    static async fromMnemonic(mnemonic: string, path?: string, wordlist?: string[]): Promise<Wallet> {
        try {
            mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, wordlist), wordlist);
            const seed = await bip39.mnemonicToSeed(mnemonic, undefined);
            const masterNode = HDNode.fromSeed(seed);
            const childNode = masterNode.derivePath(path ? path : MOI_DERIVATION_PATH);

            const wallet = new Wallet(childNode, CURVE.SECP256K1);

            privateMapSet(wallet, __vault, {
                ...privateMapGet(wallet, __vault),
                _mnemonic: mnemonic,
            })

            return wallet
        } catch (error) {
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
    public static fromMnemonicSync(mnemonic: string, path?: string, wordlist?: string[]): Wallet {
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

            return wallet
        } catch (error) {
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
    public static async createRandom(): Promise<Wallet> {
        try {
            const _random16Bytes = Buffer.from(randomBytes(16));
            var mnemonic = bip39.entropyToMnemonic(_random16Bytes, undefined);
            return await Wallet.fromMnemonic(mnemonic);
        } catch (err) {
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
    public static createRandomSync(): Wallet {
        try {
            const _random16Bytes = Buffer.from(randomBytes(16));
            var mnemonic = bip39.entropyToMnemonic(_random16Bytes, undefined);
            return Wallet.fromMnemonicSync(mnemonic);
        } catch (err) {
            ErrorUtils.throwError("Failed to create random mnemonic", ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
}
