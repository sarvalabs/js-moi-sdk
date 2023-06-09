/// <reference types="node" />
export default class Signature {
    private prefix;
    private digest;
    private extraData;
    private name;
    constructor(prefix?: Buffer, digest?: Buffer, extraData?: Buffer, signatureName?: String);
    UnMarshall(signature: Buffer | String): void;
    Digest(): Buffer;
    SigByte(): number;
    Name(): String;
    Extra(): Buffer;
    Serialize(): Buffer;
    private getSignatureName;
}
