"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Signature {
    prefix;
    digest;
    extraData;
    name;
    constructor(prefix = Buffer.alloc(0), digest = Buffer.alloc(0), extraData = Buffer.alloc(0), signatureName = "") {
        this.prefix = prefix;
        this.digest = digest;
        this.extraData = extraData;
        this.name = signatureName;
    }
    unmarshall(signature) {
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
    getDigest() {
        return this.digest;
    }
    getSigByte() {
        if (typeof this.prefix[0] !== "number") {
            throw new Error("Invalid signature byte.");
        }
        return this.prefix[0];
    }
    getName() {
        return this.name;
    }
    getExtra() {
        return this.extraData;
    }
    serialize() {
        if (this.name === "") {
            throw new Error("Signature is not initialized.");
        }
        const finalSigBytesWithoutExtra = Buffer.concat([this.prefix, this.digest]);
        return Buffer.concat([finalSigBytesWithoutExtra, this.extraData]);
    }
    getSignatureName(sigIndex) {
        switch (sigIndex) {
            case 1: return "ECDSA_S256";
            default: return "";
        }
    }
}
exports.default = Signature;
