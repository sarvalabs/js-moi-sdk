"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptKeystoreData = exports.encryptKeystoreData = exports.getKDFKeyForKeystore = exports.aesCTRWithXOR = void 0;
const crypto_1 = __importDefault(require("crypto"));
const keccak_1 = __importDefault(require("keccak"));
const buffer_1 = require("buffer");
const js_moi_utils_1 = require("js-moi-utils");
/**
 * Encrypts input data using AES-128-CTR mode with XOR encryption.
 *
 * @param {Buffer} key - Encryption key.
 * @param {Buffer} input - Input data to encrypt.
 * @param {Buffer} iv - Initialization vector.
 * @returns {Buffer} Encrypted data.
 */
const aesCTRWithXOR = (key, input, iv) => {
    const aesBlock = crypto_1.default.createCipheriv('aes-128-ctr', key, iv);
    const output = aesBlock.update(input);
    return buffer_1.Buffer.concat([output, aesBlock.final()]);
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
        return crypto_1.default.scryptSync(pwBuf, salt, dkLen, { N: n, r, p });
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
    const hash = new keccak_1.default('keccak256');
    hash.update(buffer_1.Buffer.concat([derivedKey.slice(16, 32), cipherText]));
    const calculatedMAC = buffer_1.Buffer.from(hash.digest());
    if (!calculatedMAC.equals(mac)) {
        js_moi_utils_1.ErrorUtils.throwError("Could not decrypt key with the given password");
    }
    return (0, exports.aesCTRWithXOR)(derivedKey.slice(0, 16), cipherText, iv);
};
exports.decryptKeystoreData = decryptKeystoreData;
//# sourceMappingURL=keystore.js.map