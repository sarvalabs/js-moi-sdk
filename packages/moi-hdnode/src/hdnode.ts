import HDKey from "hdkey";
import * as bip39 from 'bip39';
import { MOI_DERIVATION_PATH } from "moi-constants";
import { ErrorCode, ErrorUtils } from "moi-utils";

/**
 * HDNode Class
 * 
 * This class represents a Hierarchical Deterministic (HD) Node used in 
 cryptographic key generation and derivation.
 */
export class HDNode {
  private node: HDKey;

  constructor() {}

  /**
   * mnemonicToSeed
   *
   * Converts a mnemonic phrase to a seed buffer using BIP39.
   *
   * @param {string} mnemonic - The mnemonic phrase.
   * @param {string[]} wordlist - The wordlist to use for the mnemonic. (optional)
   * @returns {Promise<Buffer>} The seed buffer.
   * @throws {Error} If an error occurs during the conversion process.
   */
  public async mnemonicToSeed(mnemonic: string, wordlist?: string[]): Promise<Buffer> {
    try {
      // Convert the mnemonic phrase to entropy
      const entropy = bip39.mnemonicToEntropy(mnemonic, wordlist);
      // Convert entropy to a normalized mnemonic phrase
      const normalizedMnemonic = bip39.entropyToMnemonic(entropy, wordlist);
      // Generate the seed buffer from the normalized mnemonic phrase
      return await bip39.mnemonicToSeed(normalizedMnemonic);
    } catch(err) {
      ErrorUtils.throwError(
        "Failed to convert mnemonic to seed", 
        ErrorCode.UNKNOWN_ERROR, 
        { originalError: err }
      );
    }
  }

  /**
   * fromSeed
   *
   * Generates an HDNode from a seed buffer.
   *
   * @param {Buffer} seed - The seed buffer.
   * @param {string} path - The derivation path for the HDNode. (optional)
   * @throws {Error} If an error occurs during the HDNode generation.
   */
  public fromSeed(seed: Buffer, path?: string): void {
    try {
      // Generate the master HDNode from the seed buffer
      const masterHdNode = HDKey.fromMasterSeed(seed, undefined);
      // Derive the child HDNode using the specified path or default path
      this.node = masterHdNode.derive(path ? path : MOI_DERIVATION_PATH);
    } catch (err) {
      ErrorUtils.throwError(
        "Failed to generate HDNode from seed", 
        ErrorCode.UNKNOWN_ERROR, 
        { originalError: err }
      );
    }
  }

  /**
   * fromExtendedKey
   * 
   * Generates an HDNode from an extended key.
   * 
   * @param {string} extendedKey - The extended key.
   * @throws {Error} If an error occurs during the HDNode generation.
   */
  public fromExtendedKey(extendedKey: string): void {
    try {
      const hdNode = HDKey.fromExtendedKey(extendedKey, undefined);
      this.node = hdNode.derive(MOI_DERIVATION_PATH);
    } catch (err) {
      ErrorUtils.throwError(
        "Failed to generate HDNode from extended key", 
        ErrorCode.UNKNOWN_ERROR, 
        { originalError: err }
      );
    }
  }

  /**
   * derivePath
   * 
   * Derives a child HDNode from the current HDNode using the specified path.
   * 
   * @param {string} path - The derivation path for the child HDNode.
   * @returns {HDKey} The derived child HDNode.
   * @throws {Error} If the HDNode is not initialized.
   */
  public derivePath(path: string): HDKey {
    if (!this.node) {
      ErrorUtils.throwError("HDNode not initialized", ErrorCode.NOT_INITIALIZED);
    }
    return this.node.derive(path);
  }

  /**
   * publicKey
   * 
   * Retrieves the public key associated with the HDNode.
   * 
   * @returns {Buffer} The public key.
   */
  public publicKey(): Buffer {
    if (!this.node) {
      ErrorUtils.throwError("HDNode not initialized", ErrorCode.NOT_INITIALIZED);
    }
    return this.node._publicKey;
  }

  /**
   * privateKey
   * 
   * Retrieves the private key associated with the HDNode.
   * 
   * @returns {Buffer} The private key.
   */
  public privateKey(): Buffer {
    if (!this.node) {
      ErrorUtils.throwError("HDNode not initialized", ErrorCode.NOT_INITIALIZED);
    }

    if (!this.node.privateKey) {
      ErrorUtils.throwError(
        "Private key not available in the HDNode", 
        ErrorCode.PROPERTY_NOT_DEFINED
      );
    }
    return this.node._privateKey;
  }
}
