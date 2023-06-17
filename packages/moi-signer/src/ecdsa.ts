import { SigType } from "../types";
import Signature from "./signature";
import { ECPair, script, Transaction, networks } from "bitcoinjs-lib";
import Blake2b from "blake2b";

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
     * @returns A Signature object representing the signed message.
     */
    public sign(message: Buffer, signingKey: Buffer | string): Signature {
        let _signingKey: Buffer
        if(typeof signingKey === "string") {
            _signingKey = Buffer.from(signingKey, 'hex');
        }else {
            _signingKey = signingKey
        }
        
        // Hashing raw message with blake2b to get 32 bytes digest 
        const messageHash = Blake2b(256 / 8).update(message).digest();
        
        const keyPair = ECPair.fromPrivateKey(_signingKey, { network: networks.bitcoin });
        let signature = script.signature.encode(
          keyPair.sign(Buffer.from(messageHash)),
          Transaction.SIGHASH_ALL
        );
                     
        // Removing last byte, since it's always 0x01 because of SIGHASH_ALL hashType
        signature = signature.slice(0, signature.length - 1);
        
        const prefixArray = new Uint8Array(2);
        prefixArray[0] = this.prefix;
        prefixArray[1] = signature.length;

        const sig = new Signature(Buffer.from(prefixArray), signature, Buffer.from([keyPair.publicKey[0]]), this.sigName);
        return sig;
    }

    /**
     * verify
     *
     * Verifies the signature of a message using the ECDSA_S256 signature algorithm.
     *
     * @param message - The message to be verified, as a Buffer.
     * @param signature - The signature to be verified, as a Signature instance.
     * @param publicKey - The public key used for verification, as a Buffer.
     * @returns A boolean indicating whether the signature is valid.
     */
    public verify(message: Buffer, signature: Signature, publicKey: Buffer): boolean {  

        let verificationKey = Buffer.concat([signature.getExtra(), publicKey])

        let rawSignature = signature.getDigest();
        // Appending the byte that was removed at the time of signing      
        let sigComps = script.signature.decode(
            Buffer.concat([rawSignature, Buffer.from([0x01])])
        );

        // Hashing raw message with blake2b to get 32 bytes digest 
        const messageHash = Blake2b(256 / 8).update(message).digest();
        const parsedPubkey = ECPair.fromPublicKey(verificationKey, { network: networks.bitcoin });

        return parsedPubkey.verify(messageHash, sigComps.signature)
    }
}
