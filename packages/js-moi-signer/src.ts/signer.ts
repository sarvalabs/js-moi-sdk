import { ExecuteIx, InteractionResponse, Provider, SimulateOption, type SimulateInteractionRequest } from "js-moi-providers";
import { ErrorCode, ErrorUtils, hexToBytes, type Hex, type InteractionRequest, type Sender, type Simulate } from "js-moi-utils";
import type { SigningAlgorithms, SigType } from "../types";
import ECDSA_S256 from "./ecdsa";
import Signature from "./signature";

export type SignerIx<T extends InteractionRequest | SimulateInteractionRequest> = Omit<T, "sender"> & { sender?: Partial<Omit<Sender, "address">> };

export abstract class Signer {
    private provider?: Provider;

    public signingAlgorithms: SigningAlgorithms;

    constructor(provider?: Provider, signingAlgorithms?: SigningAlgorithms) {
        this.provider = provider;

        this.signingAlgorithms = signingAlgorithms ?? {
            ecdsa_secp256k1: new ECDSA_S256(),
        };
    }

    public abstract getKeyId(): Promise<number>;

    public abstract getAddress(): Promise<Hex>;

    public abstract sign(message: Hex | Uint8Array, sig: SigType): Promise<Hex>;

    public abstract signInteraction(ix: InteractionRequest, sig: SigType): Promise<ExecuteIx>;

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
        const [address, index] = await Promise.all([this.getAddress(), this.getKeyId()]);
        const { sequence } = await this.getProvider().getAccountKey(address, index);
        return sequence;
    }

    private async createIxSender(sender?: Partial<Omit<Sender, "address">>): Promise<Sender> {
        if (sender == null) {
            const [address, index, sequenceId] = await Promise.all([this.getAddress(), this.getKeyId(), this.getLatestSequence()]);

            return { address, key_id: index, sequence_id: sequenceId };
        }

        if (sender.sequence_id != null) {
            if (sender.sequence_id < (await this.getLatestSequence())) {
                ErrorUtils.throwError("Sequence number is outdated", ErrorCode.SEQUENCE_EXPIRED);
            }
        }

        if (sender.sequence_id == null) {
            sender.sequence_id = await this.getLatestSequence();
        }

        if (sender.sequence_id == null) {
            ErrorUtils.throwError("Sequence number is not provided", ErrorCode.NOT_INITIALIZED);
        }

        const sequenceId = sender.sequence_id;
        const key_id = sender.key_id ?? (await this.getKeyId());
        const address = await this.getAddress();

        return { key_id, sequence_id: sequenceId, address };
    }

    public async createIxRequest<T extends InteractionRequest | SimulateInteractionRequest>(ix: SignerIx<T>): Promise<T> {
        ix.sender = await this.createIxSender(ix.sender);

        return ix as T;
    }

    public async simulate(ix: SignerIx<SimulateInteractionRequest>, option?: SimulateOption): Promise<Simulate> {
        return await this.getProvider().simulate(await this.createIxRequest(ix), option);
    }

    public async execute(ix: SignerIx<InteractionRequest>): Promise<InteractionResponse> {
        const { ecdsa_secp256k1: algorithm } = this.signingAlgorithms;
        const signedIx = await this.signInteraction(await this.createIxRequest(ix), algorithm);

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
