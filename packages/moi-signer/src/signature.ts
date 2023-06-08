export default class Signature {
    private prefix: Buffer;
    private digest: Buffer;
    private extraData: Buffer;
    private name: String

    constructor(prefix?: Buffer, digest?: Buffer, extraData?: Buffer, signatureName?: String) {
        this.prefix = prefix;
        this.digest = digest;
        this.extraData = extraData;
        this.name = signatureName
    }
    
    public UnMarshall(signature: Buffer | String) {
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

    public Digest(): Buffer {
        return this.digest;
    }

    public SigByte(): number {
        return this.prefix[0].valueOf();
    }

    public Name(): String {
        return this.name;
    }

    public Extra(): Buffer {
        return this.extraData;
    }

    public Serialize(): Buffer {
        if(this.name == "") {
            throw new Error("signature is not intialized");
        }
        const finalSigBytesWithoutExtra = Buffer.concat([Buffer.from(this.prefix), this.digest]);
        const finalSigBytes = Buffer.concat([finalSigBytesWithoutExtra, this.extraData]);
        return finalSigBytes;
    }

    private getSignatureName(sigIndex: number): String {
        switch(sigIndex) {
            case 1: return "ECDSA_S256"
            default: return ""
        }
    }
}