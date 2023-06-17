"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signer = void 0;
const ecdsa_1 = __importDefault(require("./ecdsa"));
const signature_1 = __importDefault(require("./signature"));
class Signer {
    provider;
    signingAlgorithms;
    constructor(provider) {
        this.provider = provider;
        this.signingAlgorithms = {
            ecdsa_secp256k1: new ecdsa_1.default()
        };
    }
    sign(message, sigAlgo) {
        if (sigAlgo) {
            switch (sigAlgo.sigName) {
                case "ECDSA_S256": {
                    const _sig = this.signingAlgorithms["ecdsa_secp256k1"];
                    const sigBytes = _sig.sign(message, this.signingVault);
                    return sigBytes.Serialize().toString('hex');
                }
                default: {
                    throw new Error("invalid signature type");
                }
            }
            if (!(0, moi_utils_1.isValidAddress)(ixObject.receiver)) {
                moi_utils_1.ErrorUtils.throwError("Invalid receiver address", moi_utils_1.ErrorCode.INVALID_ARGUMENT);
            }
        }
        if (ixObject.fuel_price === undefined || ixObject.fuel_price === null) {
            moi_utils_1.ErrorUtils.throwError("Fuel price is missing", moi_utils_1.ErrorCode.MISSING_ARGUMENT);
        }
        if (ixObject.fuel_limit === undefined || ixObject.fuel_limit === null) {
            moi_utils_1.ErrorUtils.throwError("Fuel limit is missing", moi_utils_1.ErrorCode.MISSING_ARGUMENT);
        }
        if (ixObject.fuel_limit === 0) {
            moi_utils_1.ErrorUtils.throwError("Invalid fuel limit", moi_utils_1.ErrorCode.INTERACTION_UNDERPRICED);
        }
        if (ixObject.nonce !== undefined || ixObject.nonce !== null) {
            if (ixObject.nonce < nonce) {
                moi_utils_1.ErrorUtils.throwError("Invalid nonce", moi_utils_1.ErrorCode.NONCE_EXPIRED);
            }
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
     * @throws Error if there is an error sending the interaction, if the provider
     * is not initialized, or if the interaction object fails the validity checks.
     */
    async sendInteraction(ixObject) {
        try {
            // Get the provider and nonce
            const provider = this.getProvider();
            const nonce = await this.getNonce();
            // Get the signature algorithm
            const sigAlgo = this.signingAlgorithms["ecdsa_secp256k1"];
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
        sig.UnMarshall(signature);
        switch (sig.SigByte()) {
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
