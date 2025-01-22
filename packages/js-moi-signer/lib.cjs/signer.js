"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signer = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const ecdsa_1 = __importDefault(require("./ecdsa"));
const signature_1 = __importDefault(require("./signature"));
class Signer {
    provider;
    signingAlgorithms;
    constructor(provider, signingAlgorithms) {
        this.provider = provider;
        this.signingAlgorithms = signingAlgorithms ?? {
            ecdsa_secp256k1: new ecdsa_1.default(),
        };
    }
    connect(provider) {
        this.provider = provider;
    }
    getProvider() {
        if (this.provider) {
            return this.provider;
        }
        js_moi_utils_1.ErrorUtils.throwError("Provider is not initialized!", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
    }
    async getLatestSequence() {
        const [address, index] = await Promise.all([this.getAddress(), this.getKeyId()]);
        const { sequence } = await this.getProvider().getAccountKey(address, index);
        return sequence;
    }
    async createIxSender(sender) {
        if (sender == null) {
            const [address, index, sequenceId] = await Promise.all([this.getAddress(), this.getKeyId(), this.getLatestSequence()]);
            return { address, key_id: index, sequence_id: sequenceId };
        }
        if (sender.sequence_id != null) {
            if (sender.sequence_id < (await this.getLatestSequence())) {
                js_moi_utils_1.ErrorUtils.throwError("Sequence number is outdated", js_moi_utils_1.ErrorCode.SEQUENCE_EXPIRED);
            }
        }
        if (sender.sequence_id == null) {
            sender.sequence_id = await this.getLatestSequence();
        }
        if (sender.sequence_id == null) {
            js_moi_utils_1.ErrorUtils.throwError("Sequence number is not provided", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        const sequenceId = sender.sequence_id;
        const key_id = sender.key_id ?? (await this.getKeyId());
        const address = await this.getAddress();
        return { key_id, sequence_id: sequenceId, address };
    }
    async createIxRequest(ix) {
        ix.sender = await this.createIxSender(ix.sender);
        return ix;
    }
    async simulate(ix, option) {
        return await this.getProvider().simulate(await this.createIxRequest(ix), option);
    }
    async execute(ix) {
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
    verify(message, signature, publicKey) {
        let verificationKey;
        if (typeof publicKey === "string") {
            verificationKey = (0, js_moi_utils_1.hexToBytes)(publicKey);
        }
        else {
            verificationKey = publicKey;
        }
        if (verificationKey.length === 33) {
            verificationKey = verificationKey.slice(1);
        }
        const sig = new signature_1.default();
        sig.unmarshall(signature);
        switch (sig.getSigByte()) {
            case 1: {
                const _sig = this.signingAlgorithms["ecdsa_secp256k1"];
                return _sig.verify(message, sig, verificationKey);
            }
            default: {
                js_moi_utils_1.ErrorUtils.throwError("Invalid signature provided. Unable to verify the signature.", js_moi_utils_1.ErrorCode.INVALID_SIGNATURE);
            }
        }
    }
}
exports.Signer = Signer;
//# sourceMappingURL=signer.js.map