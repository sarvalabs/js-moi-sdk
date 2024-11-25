import { AbstractProvider, InteractionCallResponse, InteractionObject, InteractionRequest, InteractionResponse, Options } from "@zenz-solutions/js-moi-providers";
import { SigType, SigningAlgorithms } from "../types";
/**
 * An abstract class representing a signer responsible for cryptographic
 * activities like signing and verification.
 */
export declare abstract class Signer {
    provider?: AbstractProvider;
    signingAlgorithms: SigningAlgorithms;
    constructor(provider?: AbstractProvider);
    abstract getAddress(): string;
    abstract connect(provider: AbstractProvider): void;
    abstract sign(message: Uint8Array, sigAlgo: SigType): string;
    abstract isInitialized(): boolean;
    abstract signInteraction(ixObject: InteractionObject, sigAlgo: SigType): InteractionRequest;
    /**
     * Retrieves the connected provider instance.
     *
     * @returns The connected provider instance.
     * @throws {Error} if the provider is not initialized.
     */
    getProvider(): AbstractProvider;
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
    getNonce(options?: Options): Promise<number | bigint>;
    /**
     * Checks the validity of an interaction object by performing various checks.
     *
     * @param {InteractionMethod} method - The method to be checked.
     * @param {InteractionObject} ixObject - The interaction object to be checked.
     * @throws {Error} if any of the checks fail, indicating an invalid interaction.
     */
    private checkInteraction;
    /**
     * Prepares the interaction object by populating necessary fields and
     * performing validity checks.
     *
     * @param {InteractionMethod} method - The method for which the interaction is being prepared.
     * @param {InteractionObject} ixObject - The interaction object to prepare.
     * @returns {Promise<void>} A Promise that resolves once the preparation is complete.
     * @throws {Error} if the interaction object is not valid or if there is
     * an error during preparation.
     */
    private prepareInteraction;
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
    call(ixObject: InteractionObject): Promise<InteractionCallResponse>;
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
    estimateFuel(ixObject: InteractionObject): Promise<number | bigint>;
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
    sendInteraction(ixObject: InteractionObject): Promise<InteractionResponse>;
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
    verify(message: Uint8Array, signature: string | Uint8Array, publicKey: string | Uint8Array): boolean;
}
//# sourceMappingURL=signer.d.ts.map