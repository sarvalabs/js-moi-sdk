import { AbstractProvider, CallorEstimateIxObject, InteractionCallResponse, InteractionObject, InteractionRequest, InteractionResponse, Options } from "js-moi-providers";
import { ErrorCode, ErrorUtils, IxType, hexToBytes, isValidAddress } from "js-moi-utils";
import { SigType, SigningAlgorithms } from "../types";
import ECDSA_S256 from "./ecdsa";
import Signature from "./signature";

/**
 * An abstract class representing a signer responsible for cryptographic 
 * activities like signing and verification.
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
    abstract connect(provider: AbstractProvider): void;
    abstract sign(message: Uint8Array, sigAlgo: SigType): string;
    abstract signInteraction(ixObject: InteractionObject, sigAlgo: SigType): InteractionRequest;


    /**
     * Retrieves the connected provider instance.
     *
     * @returns The connected provider instance.
     * @throws {Error} if the provider is not initialized.
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
     * Retrieves the nonce (interaction count) for the signer's address 
     * from the provider.
     *
     * @param {Options} options - The options for retrieving the nonce. (optional)
     * @returns {Promise<number | bigint>} A Promise that resolves to the nonce 
     * as a number or bigint.
     * @throws {Error} if there is an error retrieving the nonce or the provider 
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
     * Checks the validity of an interaction object by performing various checks.
     *
     * @param {InteractionObject} ixObject - The interaction object to be checked.
     * @param {number | bigint} nonce - The nonce (interaction count) for comparison.
     * @throws {Error} if any of the checks fail, indicating an invalid interaction.
     */
    private async checkInteraction(ixObject: InteractionObject): Promise<void> {
        if(ixObject.type === undefined || ixObject.type === null) {
            ErrorUtils.throwError("Interaction type is missing", ErrorCode.MISSING_ARGUMENT)
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
            ErrorUtils.throwError("Invalid fuel limit", ErrorCode.INTERACTION_UNDERPRICED);
        }

        if(ixObject.nonce !== undefined || ixObject.nonce !== null) {
            const nonce = await this.getNonce({ tesseract_number: -1 });
            if(ixObject.nonce < nonce) {
                ErrorUtils.throwError("Invalid nonce", ErrorCode.NONCE_EXPIRED);
            }
        }
    }

    /**
     * Prepares the interaction object by populating necessary fields and 
     * performing validity checks.
     *
     * @param {InteractionObject} ixObject - The interaction object to prepare.
     * @returns {Promise<void>} A Promise that resolves once the preparation is complete.
     * @throws {Error} if the interaction object is not valid or if there is 
     * an error during preparation.
     */
    private async prepareInteraction(ixObject: InteractionObject): Promise<void> {
        if (!ixObject.sender) {
            ixObject.sender = this.getAddress();
        }

        if (ixObject.nonce != null) {
            await this.checkInteraction(ixObject);
            return;
        }

        ixObject.nonce = await this.getNonce();
    }

    /**
     * Initiates an interaction by calling a method on the connected provider.
     * The interaction object is prepared and sent to the provider for execution.
     *
     * @param {InteractionObject} ixObject - The interaction object to be executed.
     * @returns {Promise<InteractionCallResponse>} A Promise that resolves to the 
     * interaction call response.
     * @throws {Error} if there is an error during the interaction, if the provider 
     * is not initialized,or if the interaction object fails validity checks.
     */
    public async call(ixObject: InteractionObject): Promise<InteractionCallResponse> {
        // Get the provider
        const provider = this.getProvider();

        await this.prepareInteraction(ixObject);

        return await provider.call(ixObject as CallorEstimateIxObject)
    }

    /**
     * Estimates the fuel required for executing an interaction.
     * The interaction object is used to estimate the amount of fuel needed for execution.
     *
     * @param {InteractionObject} ixObject - The interaction object for which 
     * fuel estimation is needed.
     * @returns {Promise<number | bigint>} A Promise that resolves to the 
     * estimated fuel amount.
     * @throws {Error} if there is an error during fuel estimation, if the 
     * provider is not initialized, or if the interaction object fails 
     * validity checks.
     */
    public async estimateFuel(ixObject: InteractionObject): Promise<number | bigint> {
        // Get the provider
        const provider = this.getProvider();

        await this.prepareInteraction(ixObject)

        return await provider.estimateFuel(ixObject as CallorEstimateIxObject)
    }

    /**
     * Sends an interaction object by signing it with the appropriate signature algorithm
     * and forwarding it to the connected provider.
     *
     * @param {InteractionObject} ixObject - The interaction object to send.
     * @returns {Promise<InteractionResponse>} A Promise that resolves to the 
     * interaction response.
     * @throws {Error} if there is an error sending the interaction, if the provider 
     * is not initialized, or if the interaction object fails the validity checks.
     */
    public async sendInteraction(ixObject: InteractionObject): Promise<InteractionResponse> {
        try {
            // Get the provider
            const provider = this.getProvider();

            // Get the signature algorithm
            const sigAlgo = this.signingAlgorithms["ecdsa_secp256k1"];

            await this.prepareInteraction(ixObject)

            // Sign the interaction object
            const ixRequest = this.signInteraction(ixObject, sigAlgo)

            // Send the interaction request and return the response
            return await provider.sendInteraction(ixRequest);
        } catch(err) {
            throw err;
        }
    }

    /**
     * Verifies the authenticity of a signature by performing signature verification 
     * using the provided parameters.
     *
     * @param {Uint8Array} message - The message that was signed.
     * @param {string|Uint8Array} signature - The signature to verify, as a 
     * string or Buffer.
     * @param {string|Uint8Array} publicKey - The public key used for 
     * verification, as a string or Buffer.
     * @returns {boolean} A boolean indicating whether the signature is valid or not.
     * @throws {Error} if the signature is invalid or the signature byte is not recognized.
     */
    public verify(message: Uint8Array, signature: string|Uint8Array, publicKey: string|Uint8Array): boolean {
        let verificationKey: Uint8Array;

        if (typeof publicKey === "string") {
            verificationKey = hexToBytes(publicKey as string)
        } else {
            verificationKey = publicKey as Uint8Array
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