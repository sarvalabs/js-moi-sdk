import Wallet from "moi-wallet";
export declare const sign: (message: Buffer, vault: Wallet) => string;
export declare const verify: (message: Buffer, signature: string, pubKey: Buffer) => boolean;
