import type { Provider, SimulateOption } from "js-moi-providers";
import { type Hex, type InteractionRequest } from "js-moi-utils";
import { SigningAlgorithms, SigType } from "../types";
/**
 * An abstract class representing a signer responsible for cryptographic
 * activities like signing and verification.
 */
export declare abstract class Signer {
    provider?: Provider;
    signingAlgorithms: SigningAlgorithms;
    constructor(provider?: Provider, signingAlgorithms?: SigningAlgorithms);
    abstract getAddress(): string;
    abstract sign(message: Hex): Hex;
    abstract isInitialized(): boolean;
    abstract signIx(ix: InteractionRequest, sigAlgo: SigType): unknown;
    connect(provider: Provider): void;
    /**
     * Retrieves the connected provider instance.
     *
     * @returns The connected provider instance.
     * @throws {Error} if the provider is not initialized.
     */
    getProvider(): Provider;
    simulate(ix: InteractionRequest, option?: SimulateOption): Promise<import("js-moi-utils").Simulate>;
    signInteraction(ix: InteractionRequest): Promise<`0x${string}`>;
    execute(ix: InteractionRequest): Promise<void>;
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