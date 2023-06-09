/// <reference types="node" />
export default class Signature {
    private prefix;
    private digest;
    private extraData;
    private name;
    constructor(prefix?: Buffer, digest?: Buffer, extraData?: Buffer, signatureName?: string);
    unmarshall(signature: Buffer | string): void;
    getDigest(): Buffer;
    getSigByte(): number;
    getName(): string;
    getExtra(): Buffer;
    serialize(): Buffer;
    private getSignatureName;
}
