/// <reference types="node" />
import { Wallet } from "moi-wallet";
import { SigType } from "../types";
export default class ECDSA_S256 implements SigType {
    prefix: number;
    sigName: string;
    constructor();
    sign(message: Buffer, vault: Wallet): String;
    verify(message: Buffer, signature: Buffer, publicKey: Buffer): Boolean;
}
