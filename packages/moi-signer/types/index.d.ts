import Wallet from "moi-wallet";

export interface Mudra {
    signingVault: Wallet
    sigAlgorithm: string
    Sign(message: Buffer): String
    Verify(message: Buffer, signature: string): boolean
}

export const ECDSA = "ecdsa"
export const SCHNORR= "schnorr"
