import { Buffer } from "buffer";
import { HDNode } from "js-moi-hdnode";
import { AbstractProvider, InteractionObject, InteractionRequest } from "js-moi-providers";
import { SigType, Signer } from "js-moi-signer";
import { Hex } from "js-moi-utils";
import { type WalletOption } from "../types/wallet";
import { Identifier } from "js-moi-identifiers";
export declare enum CURVE {
    SECP256K1 = "secp256k1"
}
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
export declare class Wallet extends Signer {
    private key_index;
    private sub_account_index;
    constructor(hdNode: HDNode, curve: string, options?: WalletOption);
    static deriveKeys(key: Buffer, curve?: CURVE): {
        privKey: string;
        pubKey: string;
    };
    static deriveAccountKey(mnemonic: string, path?: string, wordlist?: string[]): Promise<{
        privKey: string;
        pubKey: string;
    }>;
    /**
     * Checks if the wallet is initialized.
     *
     * @returns {boolean} true if the wallet is initialized, false otherwise.
     */
    isInitialized(): boolean;
    /**
     * Private key of the sender key (key at `key_index`).
     *
     * @throws {Error} if the wallet is not loaded or initialized.
     * @readonly
     */
    get privateKey(): string;
    /**
     * Retrieves the mnemonic associated with the wallet.
     *
     * @throws {Error} if the wallet is not loaded or initialized.
     * @readonly
     */
    get mnemonic(): string;
    /**
     * Public key of the sender key (key at `key_index`).
     *
     * @throws {Error} if the wallet is not loaded or initialized.
     * @readonly
     */
    get publicKey(): string;
    /**
     * Identifier associated with the wallet.
     * .
     * @readonly
     */
    get identifier(): Promise<Identifier>;
    /**
     * Key id associated with the wallet.
     * .
     * @readonly
     */
    get keyId(): Promise<number>;
    /**
     * sub account id associated with the wallet.
     * .
     * @readonly
     */
    get subAccountId(): number;
    /**
     * Curve associated with the wallet.
     *
     * @readonly
     */
    get curve(): string;
    /**
     * Retrieves the public key of the sender key (key at `key_index`).
     *
     * @returns {string} The public key as a hex string.
     */
    getPublicKey(): Hex;
    /**
     * Retrieves the identifier for the wallet.
     * The identifier is always derived from the primary key (set at initialization).
     *
     * @returns {Identifier} A promise that resolves to the wallet's identifier.
     */
    getIdentifier(): Promise<Identifier>;
    /**
     * Retrieves the sender key id.
     *
     * @returns {number} A promise that resolves to the key index.
     */
    getKeyId(): Promise<number>;
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
    addKey(keyId: number, publicKey: string, privateKey: string): Wallet;
    /**
     * Updates the sender key. The key must already be registered via `addKey`.
     * The sender key is used as `sender.key_id` in interactions and must always
     * be present in the signatures.
     *
     * @param {number} keyId - The key ID to set as the sender key.
     * @throws {Error} if the key is not registered on this wallet.
     */
    setKeyId(keyId: number): void;
    /**
     * Returns the list of key IDs currently registered on this wallet.
     *
     * @returns {number[]} Array of registered key IDs.
     */
    getKeys(): number[];
    /**
     * Removes a key from the wallet.
     *
     * @param {number} keyId - The key ID to remove.
     * @returns {Wallet} The current wallet instance for chaining.
     * @throws {Error} if attempting to remove the sender key (`key_index`), as it is required for signing.
     */
    removeKey(keyId: number): Wallet;
    /**
     * Retrieves the sub account id.
     *
     * @returns {number} A promise that resolves to the sub account index.
     */
    getSubAccountId(): number;
    /**
     * Updates the sub account id.
     */
    setSubAccountId(id: number): void;
    /**
     * Connects the wallet to the given provider.
     *
     * @param {AbstractProvider} provider - The provider to connect.
     */
    connect(provider: AbstractProvider): void;
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
    sign(message: Uint8Array, keyId: number, sigAlgo: SigType): Promise<string>;
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
    signInteraction(ixObject: InteractionObject, _sigAlgo: SigType): Promise<InteractionRequest>;
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
    static fromMnemonic(mnemonic: string, path?: string, wordlist?: string[]): Promise<Wallet>;
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
    static fromMnemonicSync(mnemonic: string, path?: string, wordlist?: string[]): Wallet;
    /**
     * Generates a random mnemonic and initializes the wallet from it.
     *
     * @returns {Promise<Wallet>} a promise that resolves to a `Wallet` instance.
     *
     * @throws {Error} if there is an error generating the random mnemonic.
     */
    static createRandom(): Promise<Wallet>;
    /**
     * Generates a random mnemonic and initializes the wallet from it.
     *
     * @returns {Wallet} a instance of `Wallet`.
     *
     * @throws {Error} if there is an error generating the random mnemonic.
     */
    static createRandomSync(): Wallet;
}
//# sourceMappingURL=wallet.d.ts.map