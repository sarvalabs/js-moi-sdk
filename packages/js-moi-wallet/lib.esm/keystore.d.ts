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
export declare const getKDFKeyForKeystore: (keystore: Keystore, password: string) => Uint8Array;
/**
 * Encrypts the given data using the provided password and returns a keystore object.
 *
 * @param data - The data to be encrypted as a Uint8Array.
 * @param password - The password used for encryption.
 * @returns A Keystore object containing the encrypted data and encryption parameters.
 */
export declare const encryptKeystore: (data: Uint8Array, password: string) => Keystore;
/**
 * Decrypts a keystore using the provided password.
 *
 * @param keystore - The keystore object containing the encrypted data.
 * @param password - The password used to decrypt the keystore.
 * @returns The decrypted data as a Uint8Array.
 *
 * @throws If the cipher specified in the keystore is not supported.
 * @throws If the password is incorrect and the keystore cannot be decrypted.
 */
export declare const decryptKeystore: (keystore: Keystore, password: string) => Uint8Array;
//# sourceMappingURL=keystore.d.ts.map