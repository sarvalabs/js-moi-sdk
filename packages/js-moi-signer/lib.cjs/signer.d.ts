import { ExecuteIx, InteractionResponse, Provider, SimulateOption } from "js-moi-providers";
import { type Hex, type InteractionRequest, type Simulate } from "js-moi-utils";
import type { SigningAlgorithms, SigType } from "../types";
export declare abstract class Signer {
    private provider?;
    signingAlgorithms: SigningAlgorithms;
    constructor(provider?: Provider, signingAlgorithms?: SigningAlgorithms);
    abstract getKeyIndex(): Promise<number>;
    abstract getAddress(): Promise<Hex>;
    abstract sign(message: Hex | Uint8Array, sig: SigType): Promise<Hex>;
    abstract signInteraction(ix: InteractionRequest, sig: SigType): Promise<ExecuteIx>;
    abstract isInitialized(): boolean;
    connect(provider: Provider): void;
    getProvider(): Provider;
    private getLatestSequence;
    private getSender;
    simulate(ix: Omit<InteractionRequest, "sender">): Promise<Simulate>;
    simulate(ix: Omit<InteractionRequest, "sender">, sequence?: number, option?: SimulateOption): Promise<Simulate>;
    simulate(ix: Omit<InteractionRequest, "sender">, option?: SimulateOption): Promise<Simulate>;
    execute(ix: Omit<InteractionRequest, "sender">, sequence?: number): Promise<InteractionResponse>;
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