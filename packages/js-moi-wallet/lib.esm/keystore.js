import { scrypt } from "@noble/hashes/scrypt";
import { keccak_256 } from "@noble/hashes/sha3";
import { CTR } from "aes-js";
import { ErrorCode, ErrorUtils, randomBytes } from "js-moi-utils";
/**
 * Encrypts the input data using AES in CTR mode with XOR.
 *
 * @param key - The encryption key as a Uint8Array.
 * @param input - The input data to be encrypted as a Uint8Array.
 * @param iv - The initialization vector as a Uint8Array.
 * @returns The encrypted data as a Uint8Array.
 */
export const aesCTRWithXOR = (key, input, iv) => {
    return new CTR(key, iv).encrypt(input);
};
/**
 * Derives the key for a keystore based on the provided password and
 * KDF parameters.
 *
 * @param {Keystore} keystore - Keystore object.
 * @param {string} password - Password for key derivation.
 * @returns {Buffer} Derived key.
 * @throws {Error} If the KDF is unsupported.
 */
export const getKDFKeyForKeystore = (keystore, password) => {
    const pwBuf = Buffer.from(password);
    const salt = Buffer.from(keystore.kdfparams.salt, "hex");
    const dkLen = keystore.kdfparams.dklen;
    if (keystore.kdf === "scrypt") {
        const n = keystore.kdfparams.n;
        const r = keystore.kdfparams.r;
        const p = keystore.kdfparams.p;
        return scrypt(pwBuf, salt, { N: n, r, p, dkLen });
    }
    ErrorUtils.throwError(`Unsupported KDF: ${keystore.kdf}`, ErrorCode.INVALID_ARGUMENT);
};
export const encryptKeystoreData = (data, password) => {
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
        cipher: "aes-128-ctr",
        ciphertext: Buffer.from(cipherText).toString("hex"),
        cipherparams: {
            IV: Buffer.from(iv).toString("hex"),
        },
        kdf: "scrypt",
        kdfparams: {
            n: 4096,
            r: 8,
            p: 1,
            dklen: 32,
            salt: Buffer.from(salt).toString("hex"),
        },
        mac: Buffer.from(mac).toString("hex"),
    };
};
/**
 * Decrypts the keystore data using the provided password.
 *
 * @param {Keystore} keystore - Keystore object to decrypt.
 * @param {string} password - Password for decryption.
 * @returns {Buffer} Decrypted data.
 * @throws {Error} If the cipher is not supported or the password is incorrect.
 */
export const decryptKeystoreData = (keystore, password) => {
    if (keystore.cipher !== "aes-128-ctr") {
        ErrorUtils.throwError(`Cipher not supported: ${keystore.cipher}`, ErrorCode.UNSUPPORTED_OPERATION);
    }
    const mac = Buffer.from(keystore.mac, "hex");
    const iv = Buffer.from(keystore.cipherparams.IV, "hex");
    const cipherText = Buffer.from(keystore.ciphertext, "hex");
    const derivedKey = getKDFKeyForKeystore(keystore, password);
    const hash = keccak_256(Buffer.concat([derivedKey.slice(16, 32), cipherText]));
    const calculatedMAC = Buffer.from(hash);
    if (!calculatedMAC.equals(mac)) {
        ErrorUtils.throwError("Could not decrypt key with the given password", ErrorCode.INVALID_ARGUMENT);
    }
    return Buffer.from(aesCTRWithXOR(derivedKey.slice(0, 16), cipherText, iv));
};
//# sourceMappingURL=keystore.js.map