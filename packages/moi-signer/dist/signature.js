"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Signature {
    prefix;
    digest;
    extraData;
    name;
    constructor(prefix, digest, extraData, signatureName) {
        this.prefix = prefix;
        this.digest = digest;
        this.extraData = extraData;
        this.name = signatureName;
    }
    UnMarshall(signature) {
        let sig;
        if (typeof signature === "string") {
            sig = Buffer.from(signature, 'hex');
        }
        else {
            sig = Buffer.from(signature);
        }
        const sigLen = sig[1].valueOf();
        this.prefix = sig.subarray(0, 2);
        this.digest = sig.subarray(2, 2 + sigLen);
        this.extraData = sig.subarray(2 + sigLen);
        this.name = this.getSignatureName(sig[0].valueOf());
    }
    Digest() {
        return this.digest;
    }
    SigByte() {
        return this.prefix[0].valueOf();
    }
    Name() {
        return this.name;
    }
    Extra() {
        return this.extraData;
    }
    Serialize() {
        if (this.name == "") {
            throw new Error("signature is not intialized");
        }
        const finalSigBytesWithoutExtra = Buffer.concat([Buffer.from(this.prefix), this.digest]);
        const finalSigBytes = Buffer.concat([finalSigBytesWithoutExtra, this.extraData]);
        return finalSigBytes;
    }
    getSignatureName(sigIndex) {
        switch (sigIndex) {
            case 1: return "ECDSA_S256";
            default: return "";
        }
    }
}
exports.default = Signature;
