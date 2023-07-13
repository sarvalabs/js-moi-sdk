import { AbstractProvider, Options, InteractionResponse, InteractionRequest } from "moi-providers";
import { SigType, InteractionObject, SigningAlgorithms } from "../types";
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
     * @param {InteractionObject} ixObject - The interaction object to be checked.
     * @param {number | bigint} nonce - The nonce (interaction count) for comparison.
     * @throws {Error} if any of the checks fail, indicating an invalid interaction.
     */
    private checkInteraction;
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
