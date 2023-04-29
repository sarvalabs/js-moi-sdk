/// <reference types="node" />
import Wallet from "moi-wallet";
export default class Signer {
    private signingVault;
    private sigAlgorithm;
    constructor(vault: Wallet, sigAlgo?: string);
    sign(message: Buffer): String;
    verify(message: Buffer, signature: string): boolean;
}
