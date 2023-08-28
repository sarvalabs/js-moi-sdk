/// <reference types="node" />
import { Buffer } from "buffer";
import { Signer, SigType } from "js-moi-signer";
import { AbstractProvider, InteractionRequest, InteractionObject } from "js-moi-providers";
import { Keystore } from "../types/keystore";
export declare enum CURVE {
    SECP256K1 = "secp256k1"
}
/**
 * Wallet
 *
 * A class representing a wallet that can sign interactions and manage keys.
 */
export declare class Wallet extends Signer {
    constructor(provider?: AbstractProvider);
    /**
     * Initializes the wallet with a private key, mnemonic, and curve.
     *
     * @param {Buffer} key - The private key as a Buffer.
     * @param {string} curve - The elliptic curve algorithm used for key generation.
     * @param {string} mnemonic - The mnemonic associated with the wallet. (optional)
     * @throws {Error} if the key is undefined or if an error occurs during the
     * initialization process.
     */
    load(key: Buffer, curve: string, mnemonic?: string): void;
    /**
     * Checks if the wallet is initialized.
     *
     * @returns {boolean} true if the wallet is initialized, false otherwise.
     */
    isInitialized(): boolean;
    /**
     * Generates a random mnemonic and initializes the wallet from it.
     *
     * @throws {Error} if there is an error generating the random mnemonic.
     */
    createRandom(): Promise<void>;
    /**
     * Generates a keystore file from the wallet's private key, encrypted with a password.
     *
     * @param {string} password Used for encrypting the keystore data.
     * @returns {Keystore} The generated keystore object.
     * @throws {Error} if the wallet is not initialized or loaded, or if there
     * is an error generating the keystore.
     */
    generateKeystore(password: string): Keystore;
    /**
     * Intializes the wallet from a provided mnemonic.
     *
     * @param {string} mnemonic - The mnemonic associated with the wallet.
     * @param {string} path - The derivation path for the HDNode. (optional)
     * @param {string[]} wordlist - The wordlist for the mnemonic. (optional)
     * @throws {Error} if there is an error loading the wallet from the mnemonic.
     */
    fromMnemonic(mnemonic: string, path?: string, wordlist?: string[]): Promise<void>;
    /**
     * Initializes the wallet by decrypting and loading the private key from
     * a keystore file.
     *
     * @param {string} keystore The keystore object as a JSON string.
     * @param {string} password The password used for decrypting the keystore.
     * @throws {Error} if there is an error parsing the keystore, decrypting
     * the keystore data, or loading the private key.
     */
    fromKeystore(keystore: string, password: string): void;
    /**
     * Retrieves the private key associated with the wallet.
     *
     * @returns {string} The private key as a string.
     * @throws {Error} if the wallet is not loaded or initialized.
     */
    privateKey(): string;
    /**
     * Retrieves the mnemonic associated with the wallet.
     *
     * @returns {string} The mnemonic as a string.
     * @throws {Error} if the wallet is not loaded or initialized.
     */
    mnemonic(): string;
    /**
     * Retrieves the public key associated with the wallet.
     *
     * @returns {string} The public key as a string.
     * @throws {Error} if the wallet is not loaded or initialized.
     */
    publicKey(): string;
    /**
     * Retrieves the curve used by the wallet.
     *
     * @returns {string} The curve as a string.
     * @throws {Error} if the wallet is not loaded or initialized.
     */
    curve(): string;
    /**
     * Retrieves the address associated with the wallet.
     *
     * @returns {string} The address as a string.
     */
    getAddress(): string;
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
    sign(message: Uint8Array, sigAlgo: SigType): string;
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
    signInteraction(ixObject: InteractionObject, sigAlgo: SigType): InteractionRequest;
}
