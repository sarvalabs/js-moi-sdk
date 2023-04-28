import Wallet from "moi-wallet";
import elliptic from "elliptic";

const secp256k1Curve = new elliptic.ec('secp256k1');

export const sign = (message: Buffer, vault: Wallet): string => {
    let prvKey = secp256k1Curve.keyFromPrivate(vault.privateKey())
    return prvKey.sign(message).toDER("hex");
}


export const verify = (message: Buffer, signature: string, pub: Buffer): boolean => {
    let pubKey = secp256k1Curve.keyFromPublic(pub);
    return pubKey.verify(message, signature)
}
