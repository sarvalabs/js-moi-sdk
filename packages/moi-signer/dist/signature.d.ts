/// <reference types="node" />
/**
 * Signature
 *
 * Represents a signature object, storing its components and providing methods for
 * manipulation and serialization.
 */
export default class Signature {
    private prefix;
    private digest;
    private extraData;
    private name;
    constructor(prefix?: Buffer, digest?: Buffer, extraData?: Buffer, signatureName?: string);
    /**
     * unmarshall
     *
     * Unmarshalls a serialized signature into its individual components.
     *
     * @param signature - The serialized signature to be unmarshalled, as a
     * Buffer or hexadecimal string.
     * @throws Error if the signature length or index is invalid.
     */
    unmarshall(signature: Buffer | string): void;
    /**
     * getDigest
     *
     * Retrieves the digest bytes of the signature.
     *
     * @returns The digest bytes of the signature as a Buffer.
     */
    getDigest(): Buffer;
    /**
     * getSigByte
     *
     * Retrieves the signature byte of the signature prefix.
     *
     * @returns The signature byte as a number.
     * @throws Error if the signature byte is invalid.
     */
    getSigByte(): number;
    /**
     * getName
     *
     * Retrieves the name of the signature algorithm.
     *
     * @returns The name of the signature algorithm as a string.
     */
    getName(): string;
    /**
     * getExtra
     *
     * Retrieves the additional data associated with the signature.
     *
     * @returns The extra data as a Buffer.
     */
    getExtra(): Buffer;
    /**
     * serialize
     *
     * Serializes the signature into a Buffer.
     *
     * @returns The serialized signature as a Buffer.
     * @throws Error if the signature is not initialized.
     */
    serialize(): Buffer;
    /**
     * getSignatureName
     *
     * Retrieves the name of the signature algorithm based on the given signature index.
     *
     * @param sigIndex - The signature index used to determine the signature algorithm name.
     * @returns The name of the signature algorithm as a string.
     */
    private getSignatureName;
}
