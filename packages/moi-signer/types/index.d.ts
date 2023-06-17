import { Wallet } from "moi-wallet";
import Signature from "../src/signature";
export interface SigType {
    prefix: number;
    sigName: String;
    sign(message: Uint8Array, vault: Wallet): Signature
    verify(message: Uint8Array, signature: Signature, publicKey: Uint8Array): Boolean
}
