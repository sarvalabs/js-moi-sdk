import * as schnorrkel from "@parity/schnorrkel-js";
import { bytesToUint8, uint8ToHex } from "moi-utils";
import Wallet from "moi-wallet";

export const sign = (message: Buffer, vault: Wallet): string => {
    let _priv = vault.privateKey();
    let _pub = vault.privateKey();

    const kp = _priv.concat(_pub);
    let sigDigest = schnorrkel.sign(kp, bytesToUint8(message))
    return uint8ToHex(sigDigest)
}

export const verify = (message: Buffer, signature: string, pubKey: Buffer): boolean => {
    const sigInUint8Array = Uint8Array.from(Buffer.from(signature, 'hex'));
    return schnorrkel.verify(sigInUint8Array, message, pubKey);
}