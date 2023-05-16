import { Wallet } from "moi-wallet";
import { SigType } from "../types";
import { ECPair, script, Transaction, networks } from "bitcoinjs-lib";
import Blake2b from "blake2b";

export default class ECDSA_S256 implements SigType {
    prefix: number;
    sigName: string;
    constructor() {
        this.prefix = 1;
        this.sigName = "ECDSA_S256";
    }

    sign(message: Buffer, vault: Wallet): String {
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
                     
        // Removing last byte, since it's always 0x01 because of SIGHASH_ALL instruction
        signature = signature.slice(0, signature.length - 1);
        
        const prefixArray = new Uint8Array(2);
        prefixArray[0] = this.prefix;
        prefixArray[1] = signature.length;

        const finalSigBytes = Buffer.concat([Buffer.from(prefixArray), signature]);
        return finalSigBytes.toString('hex');
    }
    verify(): Boolean {
        // yet to implement
        return true
    }
}
