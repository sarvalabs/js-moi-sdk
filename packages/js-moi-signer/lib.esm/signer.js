import { ErrorCode, ErrorUtils, hexToBytes } from "js-moi-utils";
import ECDSA_S256 from "./ecdsa";
import Signature from "./signature";
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
    getProvider() {
        if (this.provider) {
            return this.provider;
        }
        ErrorUtils.throwError("Provider is not initialized!", ErrorCode.NOT_INITIALIZED);
    }
    async getLatestSequence() {
        const [address, index] = await Promise.all([this.getAddress(), this.getKeyIndex()]);
        const { sequence } = await this.getProvider().getAccountKey(address, index);
        return sequence;
    }
    async getSender(sequence) {
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
    async getIxRequest(ix, sequence) {
        return { ...ix, sender: await this.getSender(sequence) };
    }
    async simulate(ix, sequenceOrOption, option) {
        const sequence = typeof sequenceOrOption === "number" ? sequenceOrOption : undefined;
        return await this.getProvider().simulate(await this.getIxRequest(ix, sequence), option);
    }
    async execute(ix, sequence) {
        const { ecdsa_secp256k1: algorithm } = this.signingAlgorithms;
        const signedIx = await this.signInteraction(await this.getIxRequest(ix, sequence), algorithm);
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