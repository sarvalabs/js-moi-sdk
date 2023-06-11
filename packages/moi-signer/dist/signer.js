"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signer = void 0;
const ecdsa_1 = __importDefault(require("./ecdsa"));
const signature_1 = __importDefault(require("./signature"));
const moi_utils_1 = require("moi-utils");
/**
 * Signer
 *
 * An abstract class representing a signer responsible for cryptographic activities like signing and verification.
 */
class Signer {
    provider;
    signingAlgorithms;
    constructor(provider) {
        this.provider = provider;
        this.signingAlgorithms = {
            ecdsa_secp256k1: new ecdsa_1.default()
        };
    }
    /**
     * getProvider
     *
     * Retrieves the connected provider instance.
     *
     * @returns The connected provider instance.
     * @throws Error if the provider is not initialized.
     */
    getProvider() {
        if (this.provider) {
            return this.provider;
        }
        moi_utils_1.ErrorUtils.throwError("Provider is not initialized!", moi_utils_1.ErrorCode.NOT_INITIALIZED);
    }
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
    async getNonce(options) {
        try {
            const provider = this.getProvider();
            return provider.getInteractionCount(this.getAddress(), options);
        }
        catch (err) {
            throw err;
        }
    }
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
    async sendInteraction(ixObject) {
        try {
            const provider = this.getProvider();
            const sigAlgo = this.signingAlgorithms["ecdsa_secp256k1"];
            const ixRequest = this.signInteraction(ixObject, sigAlgo);
            return await provider.sendInteraction(ixRequest);
        }
        catch (err) {
            throw err;
        }
    }
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
    verify(message, signature, publicKey) {
        let verificationKey;
        if (typeof publicKey === "string") {
            verificationKey = Buffer.from(publicKey, 'hex');
        }
        else {
            verificationKey = Buffer.from(publicKey);
        }
        const sig = new signature_1.default();
        sig.unmarshall(signature);
        switch (sig.getSigByte()) {
            case 1: {
                const _sig = this.signingAlgorithms["ecdsa_secp256k1"];
                return _sig.verify(message, sig, verificationKey);
            }
            default: {
                moi_utils_1.ErrorUtils.throwError("Invalid signature provided. Unable to verify the signature.", moi_utils_1.ErrorCode.INVALID_SIGNATURE);
            }
        }
    }
}
exports.Signer = Signer;
