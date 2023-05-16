import { Wallet } from "moi-wallet";
export interface SigType {
    prefix: number;
    sigName: String;
    sign(message: Buffer, vault: Wallet): String
    verify(message: Buffer, signature: Buffer, publicKey: Buffer): Boolean
}
