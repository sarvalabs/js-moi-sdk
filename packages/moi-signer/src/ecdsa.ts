import { Wallet } from "moi-wallet";
import { SigType } from "../types";
import Signature from "./signature";
import { ECPair, script, Transaction, networks } from "bitcoinjs-lib";
import Blake2b from "blake2b";

export default class ECDSA_S256 implements SigType {
    prefix: number;
    sigName: string;

    constructor() {
        this.prefix = 1;
        this.sigName = "ECDSA_S256";
    }

    sign(message: Buffer, vault: Wallet): Signature {
        let signingKey = vault.privateKey();
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
          keyPair.sign(messageHash),
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

    verify(message: Buffer, signature: Signature, publicKey: Buffer): Boolean {  

        let verificationKey = Buffer.concat([signature.Extra(), publicKey])

        let rawSignature = signature.Digest();
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
