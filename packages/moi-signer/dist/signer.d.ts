/// <reference types="node" />
import { Wallet } from "moi-wallet";
export declare class Signer {
    private signingVault;
    constructor(vault: Wallet);
    sign(message: Buffer): String;
    verify(message: Buffer, signature: string): boolean;
}
