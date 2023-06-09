export default class Signature {
    private prefix: Buffer;
    private digest: Buffer;
    private extraData: Buffer;
    private name: string

    constructor(prefix?: Buffer, digest?: Buffer, extraData?: Buffer, signatureName?: string) {
        this.prefix = prefix;
        this.digest = digest;
        this.extraData = extraData;
        this.name = signatureName
    }
    
    public unmarshall(signature: Buffer | string) {
        let sig: Buffer;
        if(typeof signature === "string") {
            sig = Buffer.from(signature, 'hex')
        }else {
            sig = Buffer.from(signature)
        }

        const sigLen = sig[1].valueOf();
        this.prefix = sig.subarray(0,2);
        this.digest = sig.subarray(2, 2+sigLen);
        this.extraData = sig.subarray(2+sigLen)
        this.name = this.getSignatureName(sig[0].valueOf())
    }

    public getDigest(): Buffer {
        return this.digest;
    }

    public getSigByte(): number {
        return this.prefix[0].valueOf();
    }

    public getName(): string {
        return this.name;
    }

    public getExtra(): Buffer {
        return this.extraData;
    }

    public serialize(): Buffer {
        if(this.name == "") {
            throw new Error("signature is not intialized");
        }
        const finalSigBytesWithoutExtra = Buffer.concat([Buffer.from(this.prefix), this.digest]);
        const finalSigBytes = Buffer.concat([finalSigBytesWithoutExtra, this.extraData]);
        return finalSigBytes;
    }

    private getSignatureName(sigIndex: number): string {
        switch(sigIndex) {
            case 1: return "ECDSA_S256"
            default: return ""
        }
    }
}