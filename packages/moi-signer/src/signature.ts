import { hexToBytes } from "moi-utils";

export default class Signature {
    private prefix: Uint8Array;
    private digest: Uint8Array;
    private extraData: Uint8Array;
    private name: String

    constructor(prefix?: Uint8Array, digest?: Uint8Array, extraData?: Uint8Array, signatureName?: String) {
        this.prefix = prefix;
        this.digest = digest;
        this.extraData = extraData;
        this.name = signatureName
    }
    
    public UnMarshall(signature: Uint8Array | String) {
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

    public SigByte(): number {
        return this.prefix[0].valueOf();
    }

    public Name(): String {
        return this.name;
    }

    public Extra(): Uint8Array {
        return this.extraData;
    }

    public Serialize(): Uint8Array {
        if (this.name === "") {
          throw new Error("Signature is not initialized");
        }
      
        const finalSigBytesWithoutExtra = new Uint8Array([...this.prefix, ...this.digest]);
        const finalSigBytes = new Uint8Array([...finalSigBytesWithoutExtra, ...this.extraData]);
        
        return finalSigBytes;
    }

    private getSignatureName(sigIndex: number): String {
        switch(sigIndex) {
            case 1: return "ECDSA_S256"
            default: return ""
        }
    }
}