import { Buffer } from "buffer";
import { Keystore } from "../types/keystore";
/**
 * Encrypts input data using AES-128-CTR mode with XOR encryption.
 * @param key - Encryption key.
 * @param input - Input data to encrypt.
 * @param iv - Initialization vector.
 * @returns Encrypted data.
 */
export declare const aesCTRWithXOR: (key: Buffer, input: Buffer, iv: Buffer) => Buffer;
/**
 * Derives the key for a keystore based on the provided password and KDF parameters.
 * @param keystore - Keystore object.
 * @param password - Password for key derivation.
 * @returns Derived key.
 * @throws {Error} If the KDF is unsupported.
 */
export declare const getKDFKeyForKeystore: (keystore: Keystore, password: string) => Buffer;
/**
 * Encrypts the input data using AES-128-CTR mode with XOR encryption and
 * creates a keystore object.
 * @param data - Data to be encrypted.
 * @param password - Password for encryption.
 * @returns Encrypted keystore object.
 */
export declare const encryptKeystoreData: (data: Buffer, password: string) => Keystore;
/**
 * Decrypts the keystore data using the provided password.
 * @param keystore - Keystore object to decrypt.
 * @param password - Password for decryption.
 * @returns Decrypted data.
 * @throws {Error} If the cipher is not supported or the password is incorrect.
 */
export declare const decryptKeystoreData: (keystore: Keystore, password: string) => Buffer;
