/*
    This module/directory is responsible for handling 
    cryptographic activity like signing, encryption/Decryption, verification etc
*/
import * as ecdsa from "./ecdsa"
import {Wallet} from "moi-wallet"

export class Signer {
    private signingVault: Wallet

    constructor(vault: Wallet) {
        this.signingVault = vault
    }

    public sign(message: Buffer): String {
        return ecdsa.sign(message, this.signingVault)
    }

    public verify(message: Buffer, signature: string): boolean {
        return ecdsa.verify(message, signature, this.signingVault.publicKey())
    }
}
