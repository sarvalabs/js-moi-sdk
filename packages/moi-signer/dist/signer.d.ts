/// <reference types="node" />
import { SigType } from "../types";
import { Wallet } from "moi-wallet";
export declare class Signer {
    private signingVault;
    signingAlgorithms: any;
    constructor(vault?: Wallet);
    sign(message: Buffer, sigAlgo: SigType): String;
    verify(message: Buffer, signature: string, publicKey: string | Buffer): boolean;
}
