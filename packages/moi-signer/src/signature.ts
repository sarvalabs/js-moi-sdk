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

    public unmarshall(signature: Buffer | string): void {
        const sig = typeof signature === "string" ? Buffer.from(signature, 'hex') : Buffer.from(signature);

        const sigLen = sig[1];
        if (typeof sigLen === "undefined") {
            throw new Error("Invalid signature length.");
        }

        const sigIndex = sig[0];
        if (typeof sigIndex !== "number") {
            throw new Error("Invalid signature index.");
        }

        this.prefix = sig.subarray(0, 2);
        this.digest = sig.subarray(2, 2 + sigLen);
        this.extraData = sig.subarray(2 + sigLen);
        this.name = this.getSignatureName(sigIndex);
    }

    public getDigest(): Buffer {
        return this.digest;
    }

    public getSigByte(): number {
        if (typeof this.prefix[0] !== "number") {
            throw new Error("Invalid signature byte.");
        }
        return this.prefix[0];
    }

    public getName(): string {
        return this.name;
    }

    public getExtra(): Buffer {
        return this.extraData;
    }

    public serialize(): Buffer {
        if (this.name === "") {
            throw new Error("Signature is not initialized.");
        }

        const finalSigBytesWithoutExtra = Buffer.concat([this.prefix, this.digest]);
        return Buffer.concat([finalSigBytesWithoutExtra, this.extraData]);
    }

    private getSignatureName(sigIndex: number): string {
        switch (sigIndex) {
            case 1: return "ECDSA_S256";
            default: return "";
        }
    }
}
