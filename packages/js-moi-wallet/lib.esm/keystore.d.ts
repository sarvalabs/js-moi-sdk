import { Buffer } from "buffer";
import { Keystore } from "../types/keystore";
/**
 * Encrypts input data using AES-128-CTR mode with XOR encryption.
 *
 * @param {Buffer} key - Encryption key.
 * @param {Buffer} input - Input data to encrypt.
 * @param {Buffer} iv - Initialization vector.
 * @returns {Buffer} Encrypted data.
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
export declare const getKDFKeyForKeystore: (keystore: Keystore, password: string) => Buffer;
/**
 * Encrypts the input data using AES-128-CTR mode with XOR encryption and
 * creates a keystore object.
 *
 * @param {Buffer} data - Data to be encrypted.
 * @param {string} password - Password for encryption.
 * @returns {Keystore} Encrypted keystore object.
 */
export declare const encryptKeystoreData: (data: Buffer | Uint8Array, password: string) => Keystore;
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