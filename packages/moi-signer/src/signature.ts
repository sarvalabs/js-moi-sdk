import { ErrorCode, ErrorUtils } from "moi-utils";

/**
 * Signature
 *
 * Represents a signature object, storing its components and providing methods for 
 * manipulation and serialization.
 */
export default class Signature {
    private prefix: Buffer;
    private digest: Buffer;
    private extraData: Buffer;
    private name: string;

    constructor(
        prefix: Buffer = Buffer.alloc(0),
        digest: Buffer = Buffer.alloc(0),
        extraData: Buffer = Buffer.alloc(0),
        signatureName: string = ""
    ) {
        this.prefix = prefix;
        this.digest = digest;
        this.extraData = extraData;
        this.name = signatureName;
    }

    /**
     * unmarshall
     *
     * Unmarshalls a serialized signature into its individual components.
     *
     * @param signature - The serialized signature to be unmarshalled, as a 
     * Buffer or hexadecimal string.
     * @throws Error if the signature length or index is invalid.
     */
    public unmarshall(signature: Buffer | string): void {
        const sig = typeof signature === "string" ? Buffer.from(signature, 'hex') : Buffer.from(signature);

        const sigLen = sig[1];
        if (typeof sigLen === "undefined") {
            ErrorUtils.throwError(
                "Invalid signature length",
                ErrorCode.INVALID_SIGNATURE
            );
        }

        const sigIndex = sig[0];
        if (typeof sigIndex !== "number") {
            ErrorUtils.throwError(
                "Invalid signature index.",
                ErrorCode.INVALID_SIGNATURE
            );
        }

        this.prefix = sig.subarray(0, 2);
        this.digest = sig.subarray(2, 2 + sigLen);
        this.extraData = sig.subarray(2 + sigLen);
        this.name = this.getSignatureName(sigIndex);
    }

    /**
     * getDigest
     *
     * Retrieves the digest bytes of the signature.
     *
     * @returns The digest bytes of the signature as a Buffer.
     */
    public getDigest(): Buffer {
        return this.digest;
    }

    /**
     * getSigByte
     *
     * Retrieves the signature byte of the signature prefix.
     *
     * @returns The signature byte as a number.
     * @throws Error if the signature byte is invalid.
     */
    public getSigByte(): number {
        if (typeof this.prefix[0] !== "number") {
            ErrorUtils.throwError(
                "Invalid signature byte.",
                ErrorCode.INVALID_SIGNATURE
            )
        }

        return this.prefix[0];
    }

    /**
     * getName
     *
     * Retrieves the name of the signature algorithm.
     *
     * @returns The name of the signature algorithm as a string.
     */
    public getName(): string {
        return this.name;
    }

    /**
     * getExtra
     *
     * Retrieves the additional data associated with the signature.
     *
     * @returns The extra data as a Buffer.
     */
    public getExtra(): Buffer {
        return this.extraData;
    }

    /**
     * serialize
     *
     * Serializes the signature into a Buffer.
     *
     * @returns The serialized signature as a Buffer.
     * @throws Error if the signature is not initialized.
     */
    public serialize(): Buffer {
        if (this.name === "") {
            ErrorUtils.throwError(
                "Signature is not initialized.",
                ErrorCode.NOT_INITIALIZED
            )
        }

        const finalSigBytesWithoutExtra = Buffer.concat([this.prefix, this.digest]);
        return Buffer.concat([finalSigBytesWithoutExtra, this.extraData]);
    }

    /**
     * getSignatureName
     *
     * Retrieves the name of the signature algorithm based on the given signature index.
     *
     * @param sigIndex - The signature index used to determine the signature algorithm name.
     * @returns The name of the signature algorithm as a string.
     */
    private getSignatureName(sigIndex: number): string {
        switch (sigIndex) {
            case 1: return "ECDSA_S256";
            default: return "";
        }
    }
}
