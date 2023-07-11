import * as bip39 from "moi-bip39";
import elliptic from "elliptic";
import { HDNode } from "moi-hdnode";
import { randomBytes } from "crypto";
import { MOI_DERIVATION_PATH } from "moi-constants";
import { Signer, SigType, InteractionObject } from "moi-signer";
import { AbstractProvider, InteractionRequest } from "moi-providers";
import { ErrorCode, ErrorUtils, bytesToHex, bufferToUint8 } from "moi-utils";
import { Buffer } from "buffer";

import { Keystore } from "../types/keystore";
import * as SigningKeyErrors from "./errors";
import { serializeIxObject } from "./serializer";
import { decryptKeystoreData, encryptKeystoreData } from "./keystore";

export enum CURVE {
    SECP256K1 = "secp256k1"
}

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
        SigningKeyErrors.ErrPrivateGet()
    }
    const descriptor = privateMap.get(receiver);
    if (descriptor.get) {
        return descriptor.get.call(receiver);
    }
    return descriptor.value;
}

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
        SigningKeyErrors.ErrPrivateSet()
    }
    const descriptor = privateMap.get(receiver);
    if (descriptor.set) {
        descriptor.set.call(receiver, value);
    } else {
        descriptor.value = value;
    }
    return value;
}

const __vault = new WeakMap();

/**
 * Wallet
 *
 * A class representing a wallet that can sign interactions and manage keys.
 */
export class Wallet extends Signer {
    constructor(provider?: AbstractProvider) {
        super(provider)
        __vault.set(this, {
            value: void 0
        })
    }

    /**
     * Initializes the wallet with a private key, mnemonic, and curve.
     *
     * @param {Buffer} key - The private key as a Buffer.
     * @param {string} curve - The elliptic curve algorithm used for key generation.
     * @param {string} mnemonic - The mnemonic associated with the wallet. (optional)
     * @throws {Error} if the key is undefined or if an error occurs during the 
     * initialization process.
     */
    public load(key: Buffer, curve: string, mnemonic?: string) {
        try {
            let privKey: string, pubKey: string;
            if(!key) {
                ErrorUtils.throwError(
                    "Key is required, cannot be undefined", 
                    ErrorCode.INVALID_ARGUMENT
                );
            }

            if(curve !== CURVE.SECP256K1) {
                ErrorUtils.throwError(
                    `Unsupported curve: ${curve}`, 
                    ErrorCode.UNSUPPORTED_OPERATION
                );
            }

            const ecPrivKey = new elliptic.ec(curve);
            const keyInBytes = bufferToUint8(key)
            const keyPair = ecPrivKey.keyFromPrivate(keyInBytes)
            privKey = keyPair.getPrivate("hex")
            pubKey = keyPair.getPublic(true, "hex")
            
            privateMapSet(this, __vault, {
                _key: privKey,
                _mnemonic: mnemonic,
                _public: pubKey,
                _curve: curve
            });
        } catch(err) {
            ErrorUtils.throwError(
                "Failed to load wallet",
                ErrorCode.UNKNOWN_ERROR,
                { originalError: err }
            );
        }
    }

    /**
     * Checks if the wallet is initialized.
     *
     * @returns {boolean} true if the wallet is initialized, false otherwise.
     */
    public isInitialized(): boolean {
        if(privateMapGet(this, __vault)) {
            return true
        }

        return false;
    }

    /**
     * Generates a random mnemonic and initializes the wallet from it.
     *
     * @throws {Error} if there is an error generating the random mnemonic.
     */
    public async createRandom() {
        try {
            const _random16Bytes = randomBytes(16)
            var mnemonic = bip39.entropyToMnemonic(_random16Bytes, undefined);
            await this.fromMnemonic(mnemonic);
        } catch(err) {
            ErrorUtils.throwError(
                "Failed to create random mnemonic",
                ErrorCode.UNKNOWN_ERROR,
                { originalError: err }
            )
        }
    }

    /**
     * Generates a keystore file from the wallet's private key, encrypted with a password.
     *
     * @param {string} password Used for encrypting the keystore data.
     * @returns {Keystore} The generated keystore object.
     * @throws {Error} if the wallet is not initialized or loaded, or if there 
     * is an error generating the keystore.
     */
    public generateKeystore(password: string): Keystore {
        if(!this.isInitialized()) {
            ErrorUtils.throwError(
                "Keystore not found. The wallet has not been loaded or initialized.",
                ErrorCode.NOT_INITIALIZED
            );
        }

        try {
            const data = Buffer.from(this.privateKey(), "hex");
            return encryptKeystoreData(data, password)
        } catch(err) {
            ErrorUtils.throwError(
                "Failed to generate keystore",
                ErrorCode.UNKNOWN_ERROR,
                { originalError: err }
            );
        }
    }
    
    /**
     * Intializes the wallet from a provided mnemonic.
     *
     * @param {string} mnemonic - The mnemonic associated with the wallet.
     * @param {string} path - The derivation path for the HDNode. (optional)
     * @param {string[]} wordlist - The wordlist for the mnemonic. (optional)
     * @throws {Error} if there is an error loading the wallet from the mnemonic.
     */
    public async fromMnemonic(mnemonic: string, path?: string, wordlist?: string[]) {
        mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, wordlist), wordlist);
        try {
            const seed = await bip39.mnemonicToSeed(mnemonic, undefined);
            const masterNode = HDNode.fromSeed(seed);
            const childNode = masterNode.derivePath(path ? path : MOI_DERIVATION_PATH)
            this.load(childNode.privateKey(), CURVE.SECP256K1, mnemonic)
        } catch(err) {
            ErrorUtils.throwError(
                "Failed to load wallet from mnemonic",
                ErrorCode.UNKNOWN_ERROR,
                { originalError: err }
            )
        }
    }

    /**
     * Initializes the wallet by decrypting and loading the private key from 
     * a keystore file.
     *
     * @param {string} keystore The keystore object as a JSON string.
     * @param {string} password The password used for decrypting the keystore.
     * @throws {Error} if there is an error parsing the keystore, decrypting 
     * the keystore data, or loading the private key.
     */
    public fromKeystore(keystore: string, password: string) {
        try {
            const keystoreJson = JSON.parse(keystore);
            const privateKey = decryptKeystoreData(keystoreJson, password);
            this.load(privateKey, CURVE.SECP256K1)
        } catch(err) {
            ErrorUtils.throwError(
                "Failed to load wallet from keystore",
                ErrorCode.UNKNOWN_ERROR,
                { originalError: err }
            )
        }
    }

    /**
     * Retrieves the private key associated with the wallet.
     *
     * @returns {string} The private key as a string.
     * @throws {Error} if the wallet is not loaded or initialized.
     */
    public privateKey(): string { 
        if(this.isInitialized()) {
            return privateMapGet(this, __vault)._key
        }
     
        ErrorUtils.throwError(
            "Private key not found. The wallet has not been loaded or initialized.",
            ErrorCode.NOT_INITIALIZED
        )
    }

    /**
     * Retrieves the mnemonic associated with the wallet.
     *
     * @returns {string} The mnemonic as a string.
     * @throws {Error} if the wallet is not loaded or initialized.
     */
    public mnemonic(): string { 
        if(this.isInitialized()) {
            return privateMapGet(this, __vault)._mnemonic
        }

        ErrorUtils.throwError(
            "Mnemonic not found. The wallet has not been loaded or initialized.",
            ErrorCode.NOT_INITIALIZED
        )
    }

    /**
     * Retrieves the public key associated with the wallet.
     *
     * @returns {string} The public key as a string.
     * @throws {Error} if the wallet is not loaded or initialized.
     */
    public publicKey(): string { 
        if(this.isInitialized()) {
            return privateMapGet(this, __vault)._public
        }

        ErrorUtils.throwError(
            "Public key not found. The wallet has not been loaded or initialized.",
            ErrorCode.NOT_INITIALIZED
        )        
    }

    /**
     * Retrieves the curve used by the wallet.
     *
     * @returns {string} The curve as a string.
     * @throws {Error} if the wallet is not loaded or initialized.
     */
    public curve(): string { 
        if(this.isInitialized()) {
            return privateMapGet(this, __vault)._curve
        }

        ErrorUtils.throwError(
            "Curve not found. The wallet has not been loaded or initialized.",
            ErrorCode.NOT_INITIALIZED
        ) 
    }

    /**
     * Retrieves the address associated with the wallet.
     *
     * @returns {string} The address as a string.
     */
    public getAddress(): string {
        const publicKey = this.publicKey();

        return "0x" + publicKey.slice(2,);
    }

    /**
     * Connects the wallet to the given provider.
     *
     * @param {AbstractProvider} provider - The provider to connect.
     */
    public connect(provider: AbstractProvider): void {
        this.provider = provider
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
    public sign(message: Uint8Array, sigAlgo: SigType): string {
        if(sigAlgo) {
            switch(sigAlgo.sigName) {
                case "ECDSA_S256": {
                    const privateKey = this.privateKey();
                    const _sigAlgo = this.signingAlgorithms["ecdsa_secp256k1"];
                    const sig = _sigAlgo.sign(Buffer.from(message), privateKey);
                    const sigBytes = sig.serialize();
                    return bytesToHex(sigBytes);
                }
                default: {
                    ErrorUtils.throwError(
                        "Unsupported signature type",
                        ErrorCode.UNSUPPORTED_OPERATION
                    )
                }
            }
        }

        ErrorUtils.throwError(
            "Signature type cannot be undefiend",
            ErrorCode.INVALID_ARGUMENT
        )
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
    public signInteraction(ixObject: InteractionObject, sigAlgo: SigType): InteractionRequest {
        try {
            const ixData = serializeIxObject(ixObject);
            const signature = this.sign(ixData, sigAlgo);
            return {
                ix_args: bytesToHex(ixData),
                signature: signature
            }
        } catch(err) {
            ErrorUtils.throwError(
                "Failed to sign interaction",
                ErrorCode.UNKNOWN_ERROR,
                { originalError: err }
            )
        }
    }
}
