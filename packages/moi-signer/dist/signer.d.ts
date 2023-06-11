/// <reference types="node" />
import { BaseProvider, Options, InteractionResponse, InteractionRequest } from "moi-providers";
import { SigType, InteractionObject, SigningAlgorithms } from "../types";
/**
 * Signer
 *
 * An abstract class representing a signer responsible for cryptographic activities like signing and verification.
 */
export declare abstract class Signer {
    provider?: BaseProvider;
    signingAlgorithms: SigningAlgorithms;
    constructor(provider?: BaseProvider);
    abstract getAddress(): string;
    abstract connect(provider: BaseProvider): Signer;
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
    getProvider(): BaseProvider;
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
    getNonce(options?: Options): Promise<number | bigint>;
    /**
     * sendInteraction
     *
     * Sends an interaction object by signing it with the appropriate signature algorithm
     * and forwarding it to the connected provider.
     *
     * @param ixObject - The interaction object to send.
     * @returns A Promise that resolves to the interaction response.
     * @throws Error if there is an error sending the interaction or the provider is not initialized.
     */
    sendInteraction(ixObject: InteractionObject): Promise<InteractionResponse>;
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
    verify(message: Buffer, signature: string | Buffer, publicKey: string | Buffer): boolean;
}
