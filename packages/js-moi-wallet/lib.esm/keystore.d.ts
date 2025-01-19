import { Keystore } from "../types/keystore";
/**
 * Encrypts the input data using AES in CTR mode with XOR.
 *
 * @param key - The encryption key as a Uint8Array.
 * @param input - The input data to be encrypted as a Uint8Array.
 * @param iv - The initialization vector as a Uint8Array.
 * @returns The encrypted data as a Uint8Array.
 */
export declare const aesCTRWithXOR: (key: Uint8Array, input: Uint8Array, iv: Uint8Array) => Uint8Array;
/**
 * Derives the key for a keystore based on the provided password and
 * KDF parameters.
 *
 * @param {Keystore} keystore - Keystore object.
 * @param {string} password - Password for key derivation.
 * @returns {Buffer} Derived key.
 * @throws {Error} If the KDF is unsupported.
 */
export declare const getKDFKeyForKeystore: (keystore: Keystore, password: string) => Uint8Array;
export declare const encryptKeystoreData: (data: Uint8Array, password: string) => Keystore;
/**
 * Decrypts the keystore data using the provided password.
 *
 * @param {Keystore} keystore - Keystore object to decrypt.
 * @param {string} password - Password for decryption.
 * @returns {Buffer} Decrypted data.
 * @throws {Error} If the cipher is not supported or the password is incorrect.
 */
export declare const decryptKeystoreData: (keystore: Keystore, password: string) => Buffer;
//# sourceMappingURL=keystore.d.ts.map