import { ExecuteIx, InteractionResponse, Provider, SimulateOption, type SimulateInteractionRequest } from "js-moi-providers";
import { ErrorCode, ErrorUtils, hexToBytes, type Hex, type InteractionRequest, type Sender, type Simulate } from "js-moi-utils";
import type { SigningAlgorithms, SigType } from "../types";
import ECDSA_S256 from "./ecdsa";
import Signature from "./signature";

export type SignerInteractionRequest<T extends InteractionRequest | SimulateInteractionRequest> = Omit<T, "sender">;

export abstract class Signer {
    private provider?: Provider;

    public signingAlgorithms: SigningAlgorithms;

    constructor(provider?: Provider, signingAlgorithms?: SigningAlgorithms) {
        this.provider = provider;

        this.signingAlgorithms = signingAlgorithms ?? {
            ecdsa_secp256k1: new ECDSA_S256(),
        };
    }

    public abstract getKeyIndex(): Promise<number>;

    public abstract getAddress(): Promise<Hex>;

    public abstract sign(message: Hex | Uint8Array, sig: SigType): Promise<Hex>;

    public abstract signInteraction(ix: InteractionRequest, sig: SigType): Promise<ExecuteIx>;

    public abstract isInitialized(): boolean;

    public connect(provider: Provider): void {
        this.provider = provider;
    }

    public getProvider(): Provider {
        if (this.provider) {
            return this.provider;
        }

        ErrorUtils.throwError("Provider is not initialized!", ErrorCode.NOT_INITIALIZED);
    }

    private async getLatestSequence() {
        const [address, index] = await Promise.all([this.getAddress(), this.getKeyIndex()]);
        const { sequence } = await this.getProvider().getAccountKey(address, index);
        return sequence;
    }

    private async getSender(sequence?: number): Promise<Sender> {
        if (sequence != null) {
            const latest = await this.getLatestSequence();

            if (sequence < latest) {
                ErrorUtils.throwError("Sequence number is outdated", ErrorCode.SEQUENCE_EXPIRED);
            }
        }

        if (sequence == null) {
            sequence = await this.getLatestSequence();
        }

        const [address, index] = await Promise.all([this.getAddress(), this.getKeyIndex()]);

        return { address, key_id: index, sequence_id: sequence };
    }

    public simulate(ix: SignerInteractionRequest<SimulateInteractionRequest>): Promise<Simulate>;
    public simulate(ix: SignerInteractionRequest<SimulateInteractionRequest>, sequence?: number, option?: SimulateOption): Promise<Simulate>;
    public simulate(ix: SignerInteractionRequest<SimulateInteractionRequest>, option?: SimulateOption): Promise<Simulate>;
    public async simulate(ix: SignerInteractionRequest<SimulateInteractionRequest>, sequenceOrOption?: number | SimulateOption, option?: SimulateOption): Promise<Simulate> {
        const sequence = typeof sequenceOrOption === "number" ? sequenceOrOption : undefined;
        const request = { ...ix, sender: await this.getSender(sequence) };
        return await this.getProvider().simulate(request, option);
    }

    public async execute(ix: SignerInteractionRequest<InteractionRequest>, sequence?: number): Promise<InteractionResponse> {
        const { ecdsa_secp256k1: algorithm } = this.signingAlgorithms;
        const request = { ...ix, sender: await this.getSender(sequence) };
        const signedIx = await this.signInteraction(request, algorithm);
        return await this.getProvider().execute(signedIx);
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
    public verify(message: Uint8Array, signature: string | Uint8Array, publicKey: string | Uint8Array): boolean {
        let verificationKey: Uint8Array;

        if (typeof publicKey === "string") {
            verificationKey = hexToBytes(publicKey as string);
        } else {
            verificationKey = publicKey as Uint8Array;
        }

        if (verificationKey.length === 33) {
            verificationKey = verificationKey.slice(1);
        }

        const sig = new Signature();
        sig.unmarshall(signature);

        switch (sig.getSigByte()) {
            case 1: {
                const _sig = this.signingAlgorithms["ecdsa_secp256k1"];

                return _sig.verify(message, sig, verificationKey);
            }
            default: {
                ErrorUtils.throwError("Invalid signature provided. Unable to verify the signature.", ErrorCode.INVALID_SIGNATURE);
            }
        }
    }
}
