import Blake2b from "blake2b";
import * as nobleECC from '@noble/secp256k1';
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import { Wallet } from "moi-wallet";
import { hexToBytes } from "moi-utils";

import { toDER, bip66Encode } from "./utils";
import { SigType } from "../types";
import Signature from "./signature";

nobleECC.utils.hmacSha256Sync = (key, ...msgs) => hmac(sha256, key, nobleECC.utils.concatBytes(...msgs));

export default class ECDSA_S256 implements SigType {
    prefix: number;
    sigName: string;

    constructor() {
        this.prefix = 1;
        this.sigName = "ECDSA_S256";
    }

    sign(message: Uint8Array, vault: Wallet): Signature {
        let signingKey = vault.privateKey();
        let _signingKey: Uint8Array
        if(typeof signingKey === "string") {
            _signingKey = hexToBytes(signingKey)
        }else {
            _signingKey = signingKey
        }
        
        // Hashing raw message with blake2b to get 32 bytes digest 
        const messageHash = Blake2b(256 / 8).update(message).digest();
        
        const sigParts = nobleECC.signSync(messageHash, _signingKey, { der: false }); 
        
        const _r = toDER(sigParts.slice(0, 32))
        const _s = toDER(sigParts.slice(32, 64))
        const signature = bip66Encode(_r, _s);
        console.log(signature);
        
        const prefixArray = new Uint8Array(2);
        prefixArray[0] = this.prefix;
        prefixArray[1] = signature.length;

        const pubKey = nobleECC.getPublicKey(_signingKey, true);

        const parityByte = new Uint8Array([pubKey[0]]);
        const sig = new Signature(prefixArray, signature, parityByte, this.sigName);
        console.log(sig);

        return sig;
    }

    verify(message: Uint8Array, signature: Signature, publicKey: Uint8Array): Boolean {  
        // yet to implement
        return true;
    }
}
