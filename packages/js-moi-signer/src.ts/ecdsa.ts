import { blake2b } from "@noble/hashes/blake2b";
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import * as nobleECC from '@noble/secp256k1';
import { hexToBytes } from "@zenz-solutions/js-moi-utils";
import { Buffer } from "buffer";

import { SigType } from "../types";
import Signature from "./signature";
import { JoinSignature, SigDigest, bip66Decode, bip66Encode, fromDER, toDER } from "./utils";

/**
 * Setting the `hmacSha256Sync` with custom hashing logic 
 * @param key 
 * @param msgs 
 */
nobleECC.utils.hmacSha256Sync = (key, ...msgs) => hmac(sha256, key, nobleECC.utils.concatBytes(...msgs));

/**
 * ECDSA_S256
 *
 * Represents the ECDSA_S256 signature type.
 */
export default class ECDSA_S256 implements SigType {
    prefix: number;
    sigName: string;

    constructor() {
        this.prefix = 1;
        this.sigName = "ECDSA_S256";
    }

    /**
     * sign
     *
     * Signs a message using the ECDSA_S256 signature algorithm.
     *
     * @param message - The message to be signed, as a Buffer.
     * @param signingKey - The private key used for signing, either as 
     * a hexadecimal string or a Buffer.
     * @returns A Signature instance with ECDSA_S256 prefix and parity byte as extra data
     */
     public sign(message: Buffer, signingKey: Buffer | string): Signature {
        let _signingKey: Uint8Array
        if(typeof signingKey === "string") {
            _signingKey = hexToBytes(signingKey)
        }else {
            _signingKey = signingKey
        }
        
        const messageHash = blake2b(message, {
            dkLen: 1 << 5, // Hashing raw message with blake2b to get 32 bytes digest
        });
        
        const sigParts = nobleECC.signSync(messageHash, _signingKey, { der: false }); 
        
        const digest: SigDigest = {
            _r: toDER(sigParts.slice(0, 32)),
            _s: toDER(sigParts.slice(32, 64))
        }

        const signature = bip66Encode(digest);
        
        const prefixArray = new Uint8Array(2);
        prefixArray[0] = this.prefix;
        prefixArray[1] = signature.length;

        const pubKey = nobleECC.getPublicKey(_signingKey, true);

        const parityByte = new Uint8Array([pubKey[0]]);
        const sig = new Signature(prefixArray, signature, parityByte, this.sigName);

        return sig;
    }

    /**
     * verify
     * 
     * Verifies the ECDSA signature with the given secp256k1 publicKey
     * 
     * @param message the message being signed
     * @param signature the Signature instance with parity byte 
     * as extra data to determine the public key's X & Y co-ordinates 
     * having same or different sign
     * @param publicKey the compressed public key
     * @returns boolean, to determine whether verification is success/failure
     */
    verify(message: Uint8Array, signature: Signature, publicKey: Uint8Array): boolean {  
        let verificationKey = new Uint8Array(signature.Extra().length + publicKey.length);
        verificationKey.set(signature.Extra());
        verificationKey.set(publicKey, signature.Extra().length);

        let derSignature = signature.Digest();

        const messageHash = blake2b(message, {
            dkLen: 1 << 5, // Hashing raw message with blake2b to get 32 bytes digest
        });

        const _digest = bip66Decode(derSignature)
        const sigDigest: SigDigest = {
            _r: fromDER(_digest._r),
            _s: fromDER(_digest._s)
        }

        return nobleECC.verify(JoinSignature(sigDigest), messageHash, verificationKey, { strict: true })
    }
}