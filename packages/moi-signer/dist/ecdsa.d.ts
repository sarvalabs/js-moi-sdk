import { Wallet } from "moi-wallet";
import { SigType } from "../types";
import Signature from "./signature";
export default class ECDSA_S256 implements SigType {
    prefix: number;
    sigName: string;
    constructor();
    sign(message: Uint8Array, vault: Wallet): Signature;
    verify(message: Uint8Array, signature: Signature, publicKey: Uint8Array): Boolean;
}
