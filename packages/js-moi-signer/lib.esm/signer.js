import { bytesToHex, ErrorCode, ErrorUtils, hexToBytes, interaction } from "js-moi-utils";
import ECDSA_S256 from "./ecdsa";
import Signature from "./signature";
/**
 * An abstract class representing a signer responsible for cryptographic
 * activities like signing and verification.
 */
export class Signer {
    provider;
    signingAlgorithms;
    constructor(provider, signingAlgorithms) {
        this.provider = provider;
        this.signingAlgorithms = signingAlgorithms ?? {
            ecdsa_secp256k1: new ECDSA_S256(),
        };
    }
    connect(provider) {
        this.provider = provider;
    }
    /**
     * Retrieves the connected provider instance.
     *
     * @returns The connected provider instance.
     * @throws {Error} if the provider is not initialized.
     */
    getProvider() {
        if (this.provider) {
            return this.provider;
        }
        ErrorUtils.throwError("Provider is not initialized!", ErrorCode.NOT_INITIALIZED);
    }
    async simulate(ix, option) {
        return await this.getProvider().simulate(ix, option);
    }
    async signInteraction(ix) {
        return this.sign(bytesToHex(interaction(ix)));
    }
    async execute(ix) {
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
    verify(message, signature, publicKey) {
        let verificationKey;
        if (typeof publicKey === "string") {
            verificationKey = hexToBytes(publicKey);
        }
        else {
            verificationKey = publicKey;
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
//# sourceMappingURL=signer.js.map