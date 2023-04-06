/// <reference types="node" />
import * as Types from "../types/index";
import Wallet from "moi-wallet";
export default class Signer implements Types.Mudra {
    signingVault: Wallet;
    sigAlgorithm: string;
    constructor(vault: Wallet, sigAlgo?: string);
    Sign(message: Buffer): String;
    Verify(message: Buffer, signature: string): boolean;
}
