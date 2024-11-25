import { scrypt } from "@noble/hashes/scrypt";
import { keccak_256 } from "@noble/hashes/sha3";
import { randomBytes } from "@noble/hashes/utils";
import { ErrorCode, ErrorUtils, bytesToHex } from "@zenz-solutions/js-moi-utils";
import { CTR } from "aes-js";
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
export const aesCTRWithXOR = (key: Uint8Array, input: Uint8Array, iv: Uint8Array): Uint8Array => {
    return new CTR(key, iv).encrypt(input);
}

/**
 * Derives the key for a keystore based on the provided password and 
 * KDF parameters.
 * 
 * @param {Keystore} keystore - Keystore object.
 * @param {string} password - Password for key derivation.
 * @returns {Buffer} Derived key.
 * @throws {Error} If the KDF is unsupported.
 */
export const getKDFKeyForKeystore = (keystore: Keystore, password: string): Buffer => {
    const pwBuf = Buffer.from(password);
    const salt = Buffer.from(keystore.kdfparams.salt, 'hex');
    const dkLen = keystore.kdfparams.dklen;
  
    if (keystore.kdf === 'scrypt') {
      const n = keystore.kdfparams.n;
      const r = keystore.kdfparams.r;
      const p = keystore.kdfparams.p;
      return Buffer.from(scrypt(pwBuf, salt, { N: n, r, p, dkLen }));
    }
  
    ErrorUtils.throwError(
        `Unsupported KDF: ${keystore.kdf}`,
        ErrorCode.INVALID_ARGUMENT
    );
}

/**
 * Encrypts the input data using AES-128-CTR mode with XOR encryption and 
 * creates a keystore object.
 * 
 * @param {Buffer} data - Data to be encrypted.
 * @param {string} password - Password for encryption.
 * @returns {Keystore} Encrypted keystore object.
 */
export const encryptKeystoreData = (data: Buffer | Uint8Array, password: string): Keystore => {
    const salt = randomBytes(32);
  
    const derivedKey = scrypt(password, salt, {
      N: 4096,
      r: 8,
      p: 1,
      dkLen: 32,
    });
  
    const encryptKey = derivedKey.slice(0, 16);
    const iv = randomBytes(16);
    const cipherText = aesCTRWithXOR(encryptKey, data, iv);
    const mac = keccak_256(Buffer.concat([derivedKey.slice(16, 32), cipherText]));

    return {
        cipher: 'aes-128-ctr',
        ciphertext: bytesToHex(cipherText),
        cipherparams: {
            IV: bytesToHex(iv),
        },
        kdf: 'scrypt',
        kdfparams: {
            n: 4096,
            r: 8,
            p: 1,
            dklen: 32,
            salt: bytesToHex(salt),
        },
        mac: bytesToHex(mac),
    };
}

/**
 * Decrypts the keystore data using the provided password.
 * 
 * @param {Keystore} keystore - Keystore object to decrypt.
 * @param {string} password - Password for decryption.
 * @returns {Buffer} Decrypted data.
 * @throws {Error} If the cipher is not supported or the password is incorrect.
 */
export const decryptKeystoreData = (keystore: Keystore, password: string): Buffer => {
    if (keystore.cipher !== 'aes-128-ctr') {
        ErrorUtils.throwError(
            `Cipher not supported: ${keystore.cipher}`,
            ErrorCode.UNSUPPORTED_OPERATION
        );
    }
    
    const mac = Buffer.from(keystore.mac, 'hex');
    const iv = Buffer.from(keystore.cipherparams.IV, 'hex');
    const cipherText = Buffer.from(keystore.ciphertext, 'hex');
    const derivedKey = getKDFKeyForKeystore(keystore, password);
    const hash = keccak_256(Buffer.concat([derivedKey.slice(16, 32), cipherText]));
    const calculatedMAC = Buffer.from(hash);
    
    if (!calculatedMAC.equals(mac)) {
        ErrorUtils.throwError(
            "Could not decrypt key with the given password",

        );
    }
    
    return Buffer.from(aesCTRWithXOR(derivedKey.slice(0, 16), cipherText, iv));
}
