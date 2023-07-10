import HDKey from "hdkey";
import { ErrorCode, ErrorUtils } from "moi-utils";

/**
 * HDNode Class
 * 
 * This class represents a Hierarchical Deterministic (HD) Node used in 
 cryptographic key generation and derivation.
 */
export class HDNode {
  private node: HDKey;

  constructor(node: HDKey) {
    this.node = node
  }

  /**
   * fromSeed
   *
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
   * fromExtendedKey
   * 
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
   * derivePath
   * 
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
   * deriveChild
   *
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
   * publicKey
   *
   * Retrieves the public key associated with the HDNode.
   *
   * @returns {Buffer} The public key.
   * @throws {Error} If the HDNode is not initialized.
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
    return this.node._privateKey;
  }
}
