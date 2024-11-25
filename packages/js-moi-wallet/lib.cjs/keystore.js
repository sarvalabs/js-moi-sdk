"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptKeystoreData = exports.encryptKeystoreData = exports.getKDFKeyForKeystore = exports.aesCTRWithXOR = void 0;
const scrypt_1 = require("@noble/hashes/scrypt");
const sha3_1 = require("@noble/hashes/sha3");
const utils_1 = require("@noble/hashes/utils");
const js_moi_utils_1 = require("@zenz-solutions/js-moi-utils");
const aes_js_1 = require("aes-js");
const buffer_1 = require("buffer");
/**
 * Encrypts input data using AES-128-CTR mode with XOR encryption.
 *
 * @param {Buffer} key - Encryption key.
 * @param {Buffer} input - Input data to encrypt.
 * @param {Buffer} iv - Initialization vector.
 * @returns {Buffer} Encrypted data.
 */
const aesCTRWithXOR = (key, input, iv) => {
    return new aes_js_1.CTR(key, iv).encrypt(input);
};
exports.aesCTRWithXOR = aesCTRWithXOR;
/**
 * Derives the key for a keystore based on the provided password and
 * KDF parameters.
 *
 * @param {Keystore} keystore - Keystore object.
 * @param {string} password - Password for key derivation.
 * @returns {Buffer} Derived key.
 * @throws {Error} If the KDF is unsupported.
 */
const getKDFKeyForKeystore = (keystore, password) => {
    const pwBuf = buffer_1.Buffer.from(password);
    const salt = buffer_1.Buffer.from(keystore.kdfparams.salt, 'hex');
    const dkLen = keystore.kdfparams.dklen;
    if (keystore.kdf === 'scrypt') {
        const n = keystore.kdfparams.n;
        const r = keystore.kdfparams.r;
        const p = keystore.kdfparams.p;
        return buffer_1.Buffer.from((0, scrypt_1.scrypt)(pwBuf, salt, { N: n, r, p, dkLen }));
    }
    js_moi_utils_1.ErrorUtils.throwError(`Unsupported KDF: ${keystore.kdf}`, js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
};
exports.getKDFKeyForKeystore = getKDFKeyForKeystore;
/**
 * Encrypts the input data using AES-128-CTR mode with XOR encryption and
 * creates a keystore object.
 *
 * @param {Buffer} data - Data to be encrypted.
 * @param {string} password - Password for encryption.
 * @returns {Keystore} Encrypted keystore object.
 */
const encryptKeystoreData = (data, password) => {
    const salt = (0, utils_1.randomBytes)(32);
    const derivedKey = (0, scrypt_1.scrypt)(password, salt, {
        N: 4096,
        r: 8,
        p: 1,
        dkLen: 32,
    });
    const encryptKey = derivedKey.slice(0, 16);
    const iv = (0, utils_1.randomBytes)(16);
    const cipherText = (0, exports.aesCTRWithXOR)(encryptKey, data, iv);
    const mac = (0, sha3_1.keccak_256)(buffer_1.Buffer.concat([derivedKey.slice(16, 32), cipherText]));
    return {
        cipher: 'aes-128-ctr',
        ciphertext: (0, js_moi_utils_1.bytesToHex)(cipherText),
        cipherparams: {
            IV: (0, js_moi_utils_1.bytesToHex)(iv),
        },
        kdf: 'scrypt',
        kdfparams: {
            n: 4096,
            r: 8,
            p: 1,
            dklen: 32,
            salt: (0, js_moi_utils_1.bytesToHex)(salt),
        },
        mac: (0, js_moi_utils_1.bytesToHex)(mac),
    };
};
exports.encryptKeystoreData = encryptKeystoreData;
/**
 * Decrypts the keystore data using the provided password.
 *
 * @param {Keystore} keystore - Keystore object to decrypt.
 * @param {string} password - Password for decryption.
 * @returns {Buffer} Decrypted data.
 * @throws {Error} If the cipher is not supported or the password is incorrect.
 */
const decryptKeystoreData = (keystore, password) => {
    if (keystore.cipher !== 'aes-128-ctr') {
        js_moi_utils_1.ErrorUtils.throwError(`Cipher not supported: ${keystore.cipher}`, js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
    }
    const mac = buffer_1.Buffer.from(keystore.mac, 'hex');
    const iv = buffer_1.Buffer.from(keystore.cipherparams.IV, 'hex');
    const cipherText = buffer_1.Buffer.from(keystore.ciphertext, 'hex');
    const derivedKey = (0, exports.getKDFKeyForKeystore)(keystore, password);
    const hash = (0, sha3_1.keccak_256)(buffer_1.Buffer.concat([derivedKey.slice(16, 32), cipherText]));
    const calculatedMAC = buffer_1.Buffer.from(hash);
    if (!calculatedMAC.equals(mac)) {
        js_moi_utils_1.ErrorUtils.throwError("Could not decrypt key with the given password");
    }
    return buffer_1.Buffer.from((0, exports.aesCTRWithXOR)(derivedKey.slice(0, 16), cipherText, iv));
};
exports.decryptKeystoreData = decryptKeystoreData;
//# sourceMappingURL=keystore.js.map