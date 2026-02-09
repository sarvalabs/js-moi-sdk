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
    static deriveKeys(key: Uint8Array, curve?: CURVE): {
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
     * Private key associated with the wallet.
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
     * Public key associated with the wallet.
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
     * Retrieves the public key associated with the wallet.
     *
     * @returns {string} A promise that resolves to the public key
     */
    getPublicKey(): Hex;
    /**
     * Retrieves the identifier for the wallet.
     *
     * @returns {Identifier} A promise that resolves to the wallet's identifier.
     */
    getIdentifier(): Promise<Identifier>;
    /**
     * Retrieves the key id.
     *
     * @returns {number} A promise that resolves to the key index.
     */
    getKeyId(): Promise<number>;
    /**
     * Updates the key id.
     */
    setKeyId(keyId: number, publicKey: string, privateKey: string): void;
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
     * Address associated with the wallet.
     *
     * @readonly
     */
    /**
     * Connects the wallet to the given provider.
     *
     * @param {AbstractProvider} provider - The provider to connect.
     */
    connect(provider: AbstractProvider): void;
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
    sign(message: Uint8Array, sigAlgo: SigType): Promise<string>;
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
    signInteraction(ixObject: InteractionObject, sigAlgo: SigType): Promise<InteractionRequest>;
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