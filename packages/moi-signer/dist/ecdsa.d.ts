/// <reference types="node" />
import Wallet from "moi-wallet";
export declare function Sign(message: Buffer, vault: Wallet): string;
export declare function Verify(message: Buffer, signature: string, pub: Buffer): boolean;
