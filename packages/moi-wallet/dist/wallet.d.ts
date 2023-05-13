/// <reference types="node" />
export declare class Wallet {
    constructor();
    load(key: Buffer | undefined, mnemonic: string | undefined, curve: string): void;
    createRandom(): Promise<void>;
    fromMnemonic(mnemonic: string, wordlist: undefined): Promise<void>;
    privateKey(): any;
    mnemonic(): any;
    publicKey(): any;
    curve(): any;
}
