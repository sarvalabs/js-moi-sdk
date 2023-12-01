import { ErrorCode, ErrorUtils, hexToBytes } from "js-moi-utils";

export default class Signature {
    private prefix: Uint8Array;
    private digest: Uint8Array;
    private extraData: Uint8Array;
    private name: string

    constructor(prefix?: Uint8Array, digest?: Uint8Array, extraData?: Uint8Array, signatureName?: string) {
        this.prefix = prefix;
        this.digest = digest;
        this.extraData = extraData;
        this.name = signatureName
    }
    
    public unmarshall(signature: Uint8Array | String) {
        let sig: Uint8Array;
        if (typeof signature === "string") {
            sig = hexToBytes(signature)
        } else {
            sig = signature as Uint8Array
        }

        const sigLen = sig[1];
        this.prefix = sig.subarray(0, 2);
        this.digest = sig.subarray(2, 2 + sigLen);
        this.extraData = sig.subarray(2 + sigLen);
        this.name = this.getSignatureName(sig[0]);
    }
    

    public Digest(): Uint8Array {
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

    public Extra(): Uint8Array {
        return this.extraData;
    }

    public serialize(): Uint8Array {
        if (this.name === "") {
          ErrorUtils.throwError("Signature is not initialized", ErrorCode.NOT_INITIALIZED);
        }
      
        const finalSigBytesWithoutExtra = new Uint8Array([...this.prefix, ...this.digest]);
        const finalSigBytes = new Uint8Array([...finalSigBytesWithoutExtra, ...this.extraData]);
        
        return finalSigBytes;
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