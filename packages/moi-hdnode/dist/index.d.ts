/// <reference types="node" />
export declare class HDNode {
    private node;
    constructor();
    mnemonicToSeed(mnemonic: string, wordlist?: undefined): Promise<Buffer>;
    fromSeed(seed: Buffer): void;
    fromExtendedKey(extendedKey: string): void;
    derivePath(path: string): any;
    publicKey(): any;
    privateKey(): any;
}
