/*
    This module/directory is responsible for handling 
    cryptographic activity like signing and verification 
    using different Curves and Algorithms
*/
import { AbstractProvider, Options, InteractionResponse, InteractionRequest } from "moi-providers";
import ECDSA_S256 from "./ecdsa";
import { SigType, InteractionObject, SigningAlgorithms } from "../types";
import Signature from "./signature";
import { ErrorCode, ErrorUtils, IxType, isValidAddress } from "moi-utils";


/**
 * Signer
 *
 * An abstract class representing a signer responsible for cryptographic activities like signing and verification.
 */
export abstract class Signer {
    public provider?: AbstractProvider;
    public signingAlgorithms: SigningAlgorithms;

    constructor(provider?: AbstractProvider) {
        this.provider = provider;
        this.signingAlgorithms = {
            ecdsa_secp256k1: new ECDSA_S256()
        };
    }

    abstract getAddress(): string;
    abstract connect(provider: AbstractProvider): Signer;
    abstract sign(message: Uint8Array, sigAlgo: SigType): string;
    abstract signInteraction(ixObject: InteractionObject, sigAlgo: SigType): InteractionRequest;


    /**
     * getProvider
     *
     * Retrieves the connected provider instance.
     *
     * @returns The connected provider instance.
     * @throws Error if the provider is not initialized.
     */
    public getProvider() {
        if(this.provider) {
            return this.provider;
        }

        ErrorUtils.throwError(
            "Provider is not initialized!",
            ErrorCode.NOT_INITIALIZED
        );
    }

    /**
     * getNonce
     *
     * Retrieves the nonce (interaction count) for the signer's address 
     * from the provider.
     *
     * @param options - The options for retrieving the nonce. (optional)
     * @returns A Promise that resolves to the nonce as a number or bigint.
     * @throws Error if there is an error retrieving the nonce or the provider 
     * is not initialized.
     */
    public async getNonce(options?: Options): Promise<number | bigint> {
        try {
            const provider = this.getProvider();
            const address = this.getAddress();

            if(!options) {
                return await provider.getPendingInteractionCount(address)
            }

            return await provider.getInteractionCount(address, options)
        } catch(err) {
            throw err;
        }
    }

    /**
     * checkInteraction
     *
     * Checks the validity of an interaction object by performing various checks.
     *
     * @param ixObject - The interaction object to be checked.
     * @param nonce - The nonce (interaction count) for comparison.
     * @throws Error if any of the checks fail, indicating an invalid interaction.
     */
    private checkInteraction(ixObject: InteractionObject, nonce: number | bigint): void {
        if(ixObject.type === undefined || ixObject.type === null) {
            ErrorUtils.throwError("Interaction type is missing", ErrorCode.MISSING_ARGUMENT)
        }

        if(!ixObject.sender) {
            ErrorUtils.throwError("Sender address is missing", ErrorCode.MISSING_ARGUMENT);
        }

        if(!isValidAddress(ixObject.sender)) {
            ErrorUtils.throwError("Invalid sender address", ErrorCode.INVALID_ARGUMENT);
        }

        if(ixObject.sender !== this.getAddress()) {
            ErrorUtils.throwError("Sender address mismatches with the signer", ErrorCode.UNEXPECTED_ARGUMENT);
        }

        if(ixObject.type === IxType.VALUE_TRANSFER) {
            if(!ixObject.receiver) {
                ErrorUtils.throwError("Receiver address is missing", ErrorCode.MISSING_ARGUMENT);
            }
    
            if(!isValidAddress(ixObject.receiver)) {
                ErrorUtils.throwError("Invalid receiver address", ErrorCode.INVALID_ARGUMENT);
            }
        }

        if(ixObject.fuel_price === undefined || ixObject.fuel_price === null) {
            ErrorUtils.throwError("Fuel price is missing", ErrorCode.MISSING_ARGUMENT);
        }

        if(ixObject.fuel_limit === undefined || ixObject.fuel_limit === null) {
            ErrorUtils.throwError("Fuel limit is missing", ErrorCode.MISSING_ARGUMENT);
        }

        if(ixObject.fuel_limit === 0) {
            ErrorUtils.throwError("Invalid fuel limit", ErrorCode.INTERACTION_UNDERPRICED)
        }

        if(ixObject.nonce !== undefined || ixObject.nonce !== null) {
            if(ixObject.nonce <= nonce) {
                ErrorUtils.throwError("Invalid nonce", ErrorCode.NONCE_EXPIRED);
            }
        }
    }

    /**
     * sendInteraction
     *
     * Sends an interaction object by signing it with the appropriate signature algorithm
     * and forwarding it to the connected provider.
     *
     * @param ixObject - The interaction object to send.
     * @returns A Promise that resolves to the interaction response.
     * @throws Error if there is an error sending the interaction, if the provider 
     * is not initialized, or if the interaction object fails the validity checks.
     */
    public async sendInteraction(ixObject: InteractionObject): Promise<InteractionResponse> {
        try {
            // Get the provider and nonce
            const provider = this.getProvider();
            const nonce = await this.getNonce();

            // Get the signature algorithm
            const sigAlgo = this.signingAlgorithms["ecdsa_secp256k1"];

            // Check the validity of the interaction object
            this.checkInteraction(ixObject, nonce)

            if (ixObject.nonce !== undefined || ixObject.nonce !== null) {
                ixObject.nonce =  nonce;
            }

            // Sign the interaction object
            const ixRequest = this.signInteraction(ixObject, sigAlgo)

            // Send the interaction request and return the response
            return await provider.sendInteraction(ixRequest);
        } catch(err) {
            throw err;
        }
    }

    /**
     * verify
     *
     * Verifies the authenticity of a signature by performing signature verification 
     * using the provided parameters.
     *
     * @param message - The message that was signed.
     * @param signature - The signature to verify, as a string or Buffer.
     * @param publicKey - The public key used for verification, as a string or Buffer.
     * @returns A boolean indicating whether the signature is valid or not.
     * @throws Error if the signature is invalid or the signature byte is not recognized.
     */
    public verify(message: Buffer, signature: string|Buffer, publicKey: string|Buffer): boolean {
        let verificationKey: Buffer;

        if(typeof publicKey === "string") {
            verificationKey = Buffer.from(publicKey, 'hex');
        } else {
            verificationKey = Buffer.from(publicKey)
        }
        
        const sig = new Signature();
        sig.unmarshall(signature);

        switch(sig.getSigByte()) {
            case 1: {
                const _sig = this.signingAlgorithms["ecdsa_secp256k1"];

                return _sig.verify(message, sig, verificationKey);
            }
            default: {
                ErrorUtils.throwError(
                    "Invalid signature provided. Unable to verify the signature.", 
                    ErrorCode.INVALID_SIGNATURE
                )
            }
        }
    }
}
