import elliptic from "elliptic";
import * as bip39 from "js-moi-bip39";
import { MOI_DERIVATION_PATH } from "js-moi-constants";
import { HDNode } from "js-moi-hdnode";
import { AbstractProvider, InteractionObject, InteractionRequest } from "js-moi-providers";
import { SigType, Signer } from "js-moi-signer";
import { ErrorCode, ErrorUtils, Hex, bytesToHex, encodeToString, hexToBytes, randomBytes } from "js-moi-utils";

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


            privateMapSet(this, __vault, {
                _key: privKey,
                _node: hdNode,
                _pkey: pubKey,
                _public: pubKey,
                _curve: curve,
            });

            this.key_index = options?.keyId ?? DEFAULT_KEY_ID;
            this.sub_account_index = options?.subAccountId ?? DEFAULT_SUB_ACCOUNT_ID;
        } catch (error) {
            ErrorUtils.throwError("Failed to load wallet", ErrorCode.UNKNOWN_ERROR, { originalError: error });
        }
    }

    public static deriveKeys(key: Uint8Array, curve = CURVE.SECP256K1): { privKey: string; pubKey: string } {
        const ecPrivKey = new elliptic.ec(curve);
        const keyPair = ecPrivKey.keyFromPrivate(key);

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
     * Private key associated with the wallet.
     *
     * @throws {Error} if the wallet is not loaded or initialized.
     * @readonly
     */
    public get privateKey(): string {
        if (this.isInitialized()) {
            return privateMapGet(this, __vault)._key;
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
     * Public key associated with the wallet.
     * 
     * @throws {Error} if the wallet is not loaded or initialized.
     * @readonly
     */
    public get publicKey(): string {
        if (this.isInitialized()) {
            return privateMapGet(this, __vault)._public;
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
     * Retrieves the public key associated with the wallet.
     *
     * @returns {string} A promise that resolves to the public key
     */
    public getPublicKey(): Hex {
        return privateMapGet(this, __vault)._public;
    }

    /**
     * Retrieves the identifier for the wallet.
     *
     * @returns {Identifier} A promise that resolves to the wallet's identifier.
     */
    public async getIdentifier(): Promise<Identifier> {
        const publickey = privateMapGet(this, __vault)._pkey;
        const fingerprint = hexToBytes(publickey).slice(1, 25);

        return createParticipantId({ fingerprint, variant: this.sub_account_index, tag: ParticipantTagV0 });
    }

    /**
     * Retrieves the key id.
     *
     * @returns {number} A promise that resolves to the key index.
     */
    public async getKeyId(): Promise<number> {
        return this.key_index;
    }

    /**
     * Updates the key id.
     */
    public setKeyId(keyId: number, publicKey: string, privateKey: string) {
        const valut = privateMapGet(this, __vault)
        valut._public = publicKey
        valut._key = privateKey;
        this.key_index = keyId;
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
     * Address associated with the wallet.
     * 
     * @readonly
     */
    // public get address(): string {
    //     return this.getAddress();
    // }

    /**
     * Connects the wallet to the given provider.
     *
     * @param {AbstractProvider} provider - The provider to connect.
     */
    public connect(provider: AbstractProvider): void {
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
    public async sign(message: Uint8Array, sigAlgo: SigType): Promise<string> {
        if (sigAlgo == null) {
            ErrorUtils.throwError("Signature type cannot be undefined", ErrorCode.INVALID_ARGUMENT);
        }

        switch (sigAlgo.sigName) {
            case "ECDSA_S256": {
                const _sigAlgo = this.signingAlgorithms["ecdsa_secp256k1"];
                const sig = _sigAlgo.sign(message, this.privateKey);
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
    public async signInteraction(ixObject: InteractionObject, sigAlgo: SigType): Promise<InteractionRequest> {
        try {
            const ixData = serializeIxObject(ixObject);
            const signatures = [
                {
                    id: ixObject.sender.id,
                    key_id: ixObject.sender.key_id,
                    signature: await this.sign(ixData, sigAlgo) as Hex,
                }
            ];

            const rawSign = serializeIxSignatures(signatures)

            return {
                ix_args: encodeToString(ixData),
                signatures: encodeToString(rawSign),
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
            const mnemonic = bip39.entropyToMnemonic(randomBytes(16))
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
            const mnemonic = bip39.entropyToMnemonic(randomBytes(16));
            return Wallet.fromMnemonicSync(mnemonic);
        } catch (err) {
            ErrorUtils.throwError("Failed to create random mnemonic", ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
}
