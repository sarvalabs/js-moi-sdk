import { Wallet } from "moi-wallet";
import Signature from "../src/signature";
export interface SigType {
    prefix: number;
    sigName: String;
    sign(message: Buffer, vault: Wallet): Signature
    verify(message: Buffer, signature: Signature, publicKey: Buffer): Boolean
}
