/// <reference types="node" />
export default class Signature {
    private prefix;
    private digest;
    private extraData;
    private name;
    constructor(prefix?: Uint8Array, digest?: Uint8Array, extraData?: Uint8Array, signatureName?: String);
    UnMarshall(signature: Buffer | String): void;
    Digest(): Uint8Array;
    SigByte(): number;
    Name(): String;
    Extra(): Uint8Array;
    Serialize(): Uint8Array;
    private getSignatureName;
}
