import crypto from "crypto";
import keccak from "keccak";
import { ErrorCode, ErrorUtils } from "moi-utils";
import { Keystore } from "../types/keystore";

/**
 * Encrypts input data using AES-128-CTR mode with XOR encryption.
 * 
 * @param {Buffer} key - Encryption key.
 * @param {Buffer} input - Input data to encrypt.
 * @param {Buffer} iv - Initialization vector.
 * @returns {Buffer} Encrypted data.
 */
export const aesCTRWithXOR = (key: Buffer, input: Buffer, iv: Buffer): Buffer => {
    const aesBlock = crypto.createCipheriv('aes-128-ctr', key, iv);
    const output = aesBlock.update(input);
    return Buffer.concat([output, aesBlock.final()]);
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
      return crypto.scryptSync(pwBuf, salt, dkLen, { N: n, r, p });
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
export const encryptKeystoreData = (data: Buffer, password: string): Keystore => {
    const salt = crypto.randomBytes(32);
  
    const derivedKey = crypto.scryptSync(password, salt, 32, {
      N: 4096,
      r: 8,
      p: 1,
    });
  
    const encryptKey = derivedKey.slice(0, 16);
    const iv = crypto.randomBytes(16);
    const cipherText = aesCTRWithXOR(encryptKey, data, iv);
    const mac = new keccak('keccak256')
    .update(Buffer.concat([derivedKey.slice(16, 32), cipherText]))
    .digest();

    return {
        cipher: 'aes-128-ctr',
        ciphertext: cipherText.toString('hex'),
        cipherparams: {
            IV: iv.toString('hex'),
        },
        kdf: 'scrypt',
        kdfparams: {
            n: 4096,
            r: 8,
            p: 1,
            dklen: 32,
            salt: salt.toString('hex'),
        },
        mac: mac.toString('hex'),
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
    const hash = new keccak('keccak256');
    hash.update(Buffer.concat([derivedKey.slice(16, 32), cipherText]));
    const calculatedMAC = Buffer.from(hash.digest());
    
    if (!calculatedMAC.equals(mac)) {
        ErrorUtils.throwError(
            "Could not decrypt key with the given password",

        );
    }
    
    return aesCTRWithXOR(derivedKey.slice(0, 16), cipherText, iv);
}
