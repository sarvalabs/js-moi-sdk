"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signer = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const ecdsa_1 = __importDefault(require("./ecdsa"));
const signature_1 = __importDefault(require("./signature"));
const js_moi_utils_2 = require("js-moi-utils");
/**
 * An abstract class representing a signer responsible for cryptographic
 * activities like signing and verification.
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
     * Retrieves the connected provider instance.
     *
     * @returns The connected provider instance.
     * @throws {Error} if the provider is not initialized.
     */
    getProvider() {
        if (this.provider) {
            return this.provider;
        }
        js_moi_utils_2.ErrorUtils.throwError("Provider is not initialized!", js_moi_utils_2.ErrorCode.NOT_INITIALIZED);
    }
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
    async getNonce(options) {
        try {
            const provider = this.getProvider();
            const address = this.getAddress();
            if (!options) {
                return await provider.getPendingInteractionCount(address);
            }
            return await provider.getInteractionCount(address, options);
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * Checks the validity of an interaction object by performing various checks.
     *
     * @param {InteractionObject} ixObject - The interaction object to be checked.
     * @param {number | bigint} nonce - The nonce (interaction count) for comparison.
     * @throws {Error} if any of the checks fail, indicating an invalid interaction.
     */
    checkInteraction(ixObject, nonce) {
        if (ixObject.type === undefined || ixObject.type === null) {
            js_moi_utils_2.ErrorUtils.throwError("Interaction type is missing", js_moi_utils_2.ErrorCode.MISSING_ARGUMENT);
        }
        if (!(0, js_moi_utils_2.isValidAddress)(ixObject.sender)) {
            js_moi_utils_2.ErrorUtils.throwError("Invalid sender address", js_moi_utils_2.ErrorCode.INVALID_ARGUMENT);
        }
        if (ixObject.sender !== this.getAddress()) {
            js_moi_utils_2.ErrorUtils.throwError("Sender address mismatches with the signer", js_moi_utils_2.ErrorCode.UNEXPECTED_ARGUMENT);
        }
        if (ixObject.type === js_moi_utils_2.IxType.VALUE_TRANSFER) {
            if (!ixObject.receiver) {
                js_moi_utils_2.ErrorUtils.throwError("Receiver address is missing", js_moi_utils_2.ErrorCode.MISSING_ARGUMENT);
            }
            if (!(0, js_moi_utils_2.isValidAddress)(ixObject.receiver)) {
                js_moi_utils_2.ErrorUtils.throwError("Invalid receiver address", js_moi_utils_2.ErrorCode.INVALID_ARGUMENT);
            }
        }
        if (ixObject.fuel_price === undefined || ixObject.fuel_price === null) {
            js_moi_utils_2.ErrorUtils.throwError("Fuel price is missing", js_moi_utils_2.ErrorCode.MISSING_ARGUMENT);
        }
        if (ixObject.fuel_limit === undefined || ixObject.fuel_limit === null) {
            js_moi_utils_2.ErrorUtils.throwError("Fuel limit is missing", js_moi_utils_2.ErrorCode.MISSING_ARGUMENT);
        }
        if (ixObject.fuel_limit === 0) {
            js_moi_utils_2.ErrorUtils.throwError("Invalid fuel limit", js_moi_utils_2.ErrorCode.INTERACTION_UNDERPRICED);
        }
        if (ixObject.nonce !== undefined || ixObject.nonce !== null) {
            if (ixObject.nonce < nonce) {
                js_moi_utils_2.ErrorUtils.throwError("Invalid nonce", js_moi_utils_2.ErrorCode.NONCE_EXPIRED);
            }
        }
    }
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
    async sendInteraction(ixObject) {
        try {
            // Get the provider and nonce
            const provider = this.getProvider();
            const nonce = await this.getNonce();
            // Get the signature algorithm
            const sigAlgo = this.signingAlgorithms["ecdsa_secp256k1"];
            if (!ixObject.sender) {
                ixObject.sender = this.getAddress();
            }
            // Check the validity of the interaction object
            this.checkInteraction(ixObject, nonce);
            if (ixObject.nonce !== undefined || ixObject.nonce !== null) {
                ixObject.nonce = nonce;
            }
            // Sign the interaction object
            const ixRequest = this.signInteraction(ixObject, sigAlgo);
            // Send the interaction request and return the response
            return await provider.sendInteraction(ixRequest);
        }
        catch (err) {
            throw err;
        }
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
            verificationKey = (0, js_moi_utils_1.hexToBytes)(publicKey);
        }
        else {
            verificationKey = publicKey;
        }
        const sig = new signature_1.default();
        sig.unmarshall(signature);
        switch (sig.getSigByte()) {
            case 1: {
                const _sig = this.signingAlgorithms["ecdsa_secp256k1"];
                return _sig.verify(message, sig, verificationKey);
            }
            default: {
                js_moi_utils_2.ErrorUtils.throwError("Invalid signature provided. Unable to verify the signature.", js_moi_utils_2.ErrorCode.INVALID_SIGNATURE);
            }
        }
    }
}
exports.Signer = Signer;