/// <reference types="node" />
import { Wallet } from "moi-wallet";
import { SigType } from "../types";
import Signature from "./signature";
export default class ECDSA_S256 implements SigType {
    prefix: number;
    sigName: string;
    constructor();
    sign(message: Buffer, vault: Wallet): Signature;
    verify(message: Buffer, signature: Signature, publicKey: Buffer): Boolean;
}
