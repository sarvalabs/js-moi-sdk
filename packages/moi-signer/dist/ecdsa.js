import elliptic from "elliptic";
const secp256k1Curve = new elliptic.ec('secp256k1');
export function Sign(message, vault) {
    let prvKey = secp256k1Curve.keyFromPrivate(vault.privateKey());
    return prvKey.sign(message).toDER("hex");
}
export function Verify(message, signature, pub) {
    let pubKey = secp256k1Curve.keyFromPublic(pub);
    return pubKey.verify(message, signature);
}
