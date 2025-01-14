import type { Provider, SimulateOption } from "js-moi-providers";
import { bytesToHex, ErrorCode, ErrorUtils, hexToBytes, interaction, type Hex, type InteractionRequest } from "js-moi-utils";
import { SigningAlgorithms, SigType } from "../types";
import ECDSA_S256 from "./ecdsa";
import Signature from "./signature";

/**
 * An abstract class representing a signer responsible for cryptographic
 * activities like signing and verification.
 */
export abstract class Signer {
    public provider?: Provider;
    public signingAlgorithms: SigningAlgorithms;

    constructor(provider?: Provider, signingAlgorithms?: SigningAlgorithms) {
        this.provider = provider;
        this.signingAlgorithms = signingAlgorithms ?? {
            ecdsa_secp256k1: new ECDSA_S256(),
        };
    }

    abstract getAddress(): string;

    abstract sign(message: Hex): Hex;

    abstract isInitialized(): boolean;

    abstract signIx(ix: InteractionRequest, sigAlgo: SigType): unknown;

    connect(provider: Provider): void {
        this.provider = provider;
    }

    /**
     * Retrieves the connected provider instance.
     *
     * @returns The connected provider instance.
     * @throws {Error} if the provider is not initialized.
     */
    public getProvider() {
        if (this.provider) {
            return this.provider;
        }

        ErrorUtils.throwError("Provider is not initialized!", ErrorCode.NOT_INITIALIZED);
    }

    public async simulate(ix: InteractionRequest, option?: SimulateOption) {
        return await this.getProvider().simulate(ix, option);
    }

    public async signInteraction(ix: InteractionRequest) {
        return this.sign(bytesToHex(interaction(ix)));
    }

    public async execute(ix: InteractionRequest) {
        const signature = this.signInteraction(ix);
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
