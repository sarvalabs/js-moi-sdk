"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptKeystoreData = exports.encryptKeystoreData = exports.getKDFKeyForKeystore = exports.aesCTRWithXOR = void 0;
const crypto_1 = __importDefault(require("crypto"));
const keccak_1 = __importDefault(require("keccak"));
const buffer_1 = require("buffer");
const moi_utils_1 = require("moi-utils");
/**
 * Encrypts input data using AES-128-CTR mode with XOR encryption.
 * @param key - Encryption key.
 * @param input - Input data to encrypt.
 * @param iv - Initialization vector.
 * @returns Encrypted data.
 */
const aesCTRWithXOR = (key, input, iv) => {
    const aesBlock = crypto_1.default.createCipheriv('aes-128-ctr', key, iv);
    const output = aesBlock.update(input);
    return buffer_1.Buffer.concat([output, aesBlock.final()]);
};
exports.aesCTRWithXOR = aesCTRWithXOR;
/**
 * Derives the key for a keystore based on the provided password and KDF parameters.
 * @param keystore - Keystore object.
 * @param password - Password for key derivation.
 * @returns Derived key.
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
        return crypto_1.default.scryptSync(pwBuf, salt, dkLen, { N: n, r, p });
    }
    moi_utils_1.ErrorUtils.throwError(`Unsupported KDF: ${keystore.kdf}`, moi_utils_1.ErrorCode.INVALID_ARGUMENT);
};
exports.getKDFKeyForKeystore = getKDFKeyForKeystore;
/**
 * Encrypts the input data using AES-128-CTR mode with XOR encryption and
 * creates a keystore object.
 * @param data - Data to be encrypted.
 * @param password - Password for encryption.
 * @returns Encrypted keystore object.
 */
const encryptKeystoreData = (data, password) => {
    const salt = crypto_1.default.randomBytes(32);
    const derivedKey = crypto_1.default.scryptSync(password, salt, 32, {
        N: 4096,
        r: 8,
        p: 1,
    });
    const encryptKey = derivedKey.slice(0, 16);
    const iv = crypto_1.default.randomBytes(16);
    const cipherText = (0, exports.aesCTRWithXOR)(encryptKey, data, iv);
    const mac = new keccak_1.default('keccak256')
        .update(buffer_1.Buffer.concat([derivedKey.slice(16, 32), cipherText]))
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
};
exports.encryptKeystoreData = encryptKeystoreData;
/**
 * Decrypts the keystore data using the provided password.
 * @param keystore - Keystore object to decrypt.
 * @param password - Password for decryption.
 * @returns Decrypted data.
 * @throws {Error} If the cipher is not supported or the password is incorrect.
 */
const decryptKeystoreData = (keystore, password) => {
    if (keystore.cipher !== 'aes-128-ctr') {
        moi_utils_1.ErrorUtils.throwError(`Cipher not supported: ${keystore.cipher}`, moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
    }
    const mac = buffer_1.Buffer.from(keystore.mac, 'hex');
    const iv = buffer_1.Buffer.from(keystore.cipherparams.IV, 'hex');
    const cipherText = buffer_1.Buffer.from(keystore.ciphertext, 'hex');
    const derivedKey = (0, exports.getKDFKeyForKeystore)(keystore, password);
    const hash = new keccak_1.default('keccak256');
    hash.update(buffer_1.Buffer.concat([derivedKey.slice(16, 32), cipherText]));
    const calculatedMAC = buffer_1.Buffer.from(hash.digest());
    if (!calculatedMAC.equals(mac)) {
        moi_utils_1.ErrorUtils.throwError("Could not decrypt key with the given password");
    }
    return (0, exports.aesCTRWithXOR)(derivedKey.slice(0, 16), cipherText, iv);
};
exports.decryptKeystoreData = decryptKeystoreData;
