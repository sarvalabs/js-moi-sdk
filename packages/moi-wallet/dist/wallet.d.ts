/// <reference types="node" />
import { Signer, SigType, InteractionObject } from "moi-signer";
import { AbstractProvider, InteractionRequest } from "moi-providers";
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
    load(key: Buffer, curve: string, mnemonic?: string): void;
    /**
     * isInitialized
     *
     * Checks if the wallet is initialized.
     *
     * @returns true if the wallet is initialized, false otherwise.
     */
    isInitialized(): boolean;
    /**
     * createRandom
     *
     * Generates a random mnemonic and initializes the wallet from it.
     *
     * @throws Error if there is an error generating the random mnemonic.
     */
    createRandom(): Promise<void>;
    /**
     * generateKeystore
     *
     * Generates a keystore file from the wallet's private key, encrypted with a password.
     *
     * @param password Used for encrypting the keystore data.
     * @returns The generated keystore object.
     * @throws Error if the wallet is not initialized or loaded, or if there is an error generating the keystore.
     */
    generateKeystore(password: string): Keystore;
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
    fromMnemonic(mnemonic: string, path?: string, wordlist?: string[]): Promise<void>;
    /**
     * fromKeystore
     *
     * Initializes the wallet by decrypting and loading the private key from a keystore file.
     *
     * @param keystore The keystore object as a JSON string.
     * @param password The password used for decrypting the keystore.
     * @throws Error if there is an error parsing the keystore, decrypting the keystore data, or loading the private key.
     */
    fromKeystore(keystore: string, password: string): void;
    /**
     * privateKey
     *
     * Retrieves the private key associated with the wallet.
     *
     * @returns The private key as a string.
     * @throws Error if the wallet is not loaded or initialized.
     */
    privateKey(): any;
    /**
     * mnemonic
     *
     * Retrieves the mnemonic associated with the wallet.
     *
     * @returns The mnemonic as a string.
     * @throws Error if the wallet is not loaded or initialized.
     */
    mnemonic(): any;
    /**
     * publicKey
     *
     * Retrieves the public key associated with the wallet.
     *
     * @returns The public key as a string.
     * @throws Error if the wallet is not loaded or initialized.
     */
    publicKey(): any;
    /**
     * curve
     *
     * Retrieves the curve used by the wallet.
     *
     * @returns The curve as a string.
     * @throws Error if the wallet is not loaded or initialized.
     */
    curve(): any;
    /**
     * getAddress
     *
     * Retrieves the address associated with the wallet.
     *
     * @returns The address as a string.
     */
    getAddress(): string;
    /**
     * connect
     *
     * Connects the wallet to a provider and returns a new instance of the wallet.
     *
     * @param provider - The provider to connect.
     * @returns A new instance of the wallet connected to the specified provider.
     */
    connect(provider: AbstractProvider): Signer;
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
    sign(message: Uint8Array, sigAlgo: SigType): string;
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
    signInteraction(ixObject: InteractionObject, sigAlgo: SigType): InteractionRequest;
}
