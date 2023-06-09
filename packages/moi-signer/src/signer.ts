/*
    This module/directory is responsible for handling 
    cryptographic activity like signing and verification 
    using different Curves and Algorithms
*/
import { BaseProvider, Options, InteractionResponse, InteractionRequest } from "moi-providers";
import ECDSA_S256 from "./ecdsa"
import { SigType, InteractionObject } from "../types";
import Signature from "./signature";

export abstract class Signer {
    // private signingVault: Wallet
    public provider?: BaseProvider;
    public signingAlgorithms: any

    constructor(provider?: BaseProvider) {
        this.provider = provider;
        // this.signingVault = vault
        this.signingAlgorithms = {
            "ecdsa_secp256k1" : new ECDSA_S256()
        }
    }

    abstract getAddress(): string;
    abstract connect(provider: BaseProvider): Signer;
    abstract sign(message: Uint8Array, sigAlgo: SigType): string;
    abstract signInteraction(ixObject: InteractionObject, sigAlgo: SigType): InteractionRequest;

    public getProvider() {
        if(this.provider) {
            return this.provider;
        }

        throw new Error("Provider is not initialized!");
    }

    public async getNonce(options?: Options): Promise<number | bigint> {
        try {
            const provider = this.getProvider();
            return provider.getInteractionCount(this.getAddress(), options)
        } catch(err) {
            throw err;
        }
    }

    public async sendInteraction(ixObject: InteractionObject): Promise<InteractionResponse> {
        try {
            const provider = this.getProvider();
            const sigAlgo = this.signingAlgorithms["ecdsa_secp256k1"]
            const ixRequest = this.signInteraction(ixObject, sigAlgo)
            return await provider.sendInteraction(ixRequest);
        } catch(err) {
            throw new Error("Failed to send interaction", err);
        }
    }

    public verify(message: Buffer, signature: string|Buffer, publicKey: string|Buffer): boolean {
        let verificationKey: Buffer;

        if(typeof publicKey === "string") {
            verificationKey = Buffer.from(publicKey, 'hex');
        } else {
            verificationKey = Buffer.from(publicKey)
        }
        
        const sig = new Signature();
        sig.UnMarshall(signature);

        switch(sig.SigByte()) {
            case 1: {
                const _sig = this.signingAlgorithms["ecdsa_secp256k1"];

                return _sig.verify(message, sig, verificationKey);
            }
            default: {
                throw new Error("invalid signature")
            }
        }
    }
}
