import { HDKey } from "@scure/bip32";
import { Buffer } from "buffer";
import { ErrorCode, ErrorUtils } from "js-moi-utils";

/**
 * This class represents a Hierarchical Deterministic (HD) Node used in 
 * cryptographic key generation and derivation.
 */
export class HDNode {
  private node: HDKey;

  constructor(node: HDKey) {
    this.node = node
  }

  /**
   * Generates an HDNode from a seed buffer.
   *
   * @param {Buffer} seed - The seed buffer.
   * @throws {Error} If an error occurs during the HDNode generation.
   */
  public static fromSeed(seed: Buffer): HDNode {
    try {
      // Generate the master HDNode from the seed buffer
      const node = HDKey.fromMasterSeed(seed, undefined);
      // Derive the child HDNode using the specified path or default path
      return new HDNode(node)
    } catch (err) {
      ErrorUtils.throwError(
        "Failed to generate HDNode from seed", 
        ErrorCode.UNKNOWN_ERROR, 
        { originalError: err }
      );
    }
  }

  /**
   * Creates an HDNode from a raw private key.
   * The resulting node can sign but cannot derive child keys in a meaningful way.
   * Use this when restoring a wallet from a keystore or other raw-key source.
   *
   * @param {Buffer} privateKey - The 32-byte private key buffer.
   * @throws {Error} If an error occurs during the HDNode creation.
   */
  public static fromPrivateKey(privateKey: Buffer): HDNode {
    try {
      const node = new HDKey({
        privateKey: new Uint8Array(privateKey),
        chainCode: new Uint8Array(32),
      });
      return new HDNode(node);
    } catch (err) {
      ErrorUtils.throwError(
        "Failed to create HDNode from private key",
        ErrorCode.UNKNOWN_ERROR,
        { originalError: err }
      );
    }
  }

  /**
   * Generates an HDNode from an extended key.
   *
   * @param {string} extendedKey - The extended key.
   * @throws {Error} If an error occurs during the HDNode generation.
   */
  public static fromExtendedKey(extendedKey: string): HDNode {
    try {
      const node = HDKey.fromExtendedKey(extendedKey, undefined);
      return new HDNode(node);
    } catch (err) {
      ErrorUtils.throwError(
        "Failed to generate HDNode from extended key", 
        ErrorCode.UNKNOWN_ERROR, 
        { originalError: err }
      );
    }
  }

  /**
   * Derives a child HDNode from the current HDNode using the specified path.
   * 
   * @param {string} path - The derivation path for the child HDNode.
   * @returns {HDNode} The derived child HDNode.
   * @throws {Error} If the HDNode is not initialized.
   */
  public derivePath(path: string): HDNode {
    if (!this.node) {
      ErrorUtils.throwError("HDNode not initialized", ErrorCode.NOT_INITIALIZED);
    }
    const childNode = this.node.derive(path);
    return new HDNode(childNode);
  }

  /**
   * Derives a child HDNode from the current HDNode using the specified index.
   *
   * @param {number} index - The child index.
   * @returns {HDNode} The derived child HDNode.
   * @throws {Error} If the HDNode is not initialized.
   */
  public deriveChild(index: number): HDNode {
    if (!this.node) {
      ErrorUtils.throwError('HDNode not initialized', ErrorCode.NOT_INITIALIZED);
    }

    const childNode = this.node.deriveChild(index);
    return new HDNode(childNode);
  }

  /**
   * Returns the extended private key associated with this HDNode.
   * @returns The string representation of the extended private key.
   */
  getExtendedPrivateKey(): string {
    return this.node.privateExtendedKey;
  }

  
  /**
   * Returns the extended public key for the HDNode.
   * @returns The string representation of the extended public key.
   */
  getExtendedPublicKey(): string {
    return this.node.publicExtendedKey;
  }

  /**
   * Retrieves the public key associated with the HDNode.
   *
   * @returns {Buffer} The public key.
   * @throws {Error} If the HDNode is not initialized.
   */
  public publicKey(): Buffer {
    if (!this.node) {
      ErrorUtils.throwError("HDNode not initialized", ErrorCode.NOT_INITIALIZED);
    }
    return Buffer.from(this.node.publicKey!);
  }

  /**
   * Retrieves the private key associated with the HDNode.
   *
   * @returns {Buffer} The private key.
   * @throws {Error} If the HDNode is not initialized or private key is not available.
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
    return Buffer.from(this.node.privateKey);
  }
}
