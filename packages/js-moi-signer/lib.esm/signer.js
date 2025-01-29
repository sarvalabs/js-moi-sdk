import { ErrorCode, ErrorUtils, hexToBytes, isHex, validateIxRequest } from "js-moi-utils";
import ECDSA_S256 from "./ecdsa";
import Signature from "./signature";
export class Signer {
    provider;
    signingAlgorithms;
    static DEFAULT_FUEL_PRICE = 1;
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
        const [participant, index] = await Promise.all([this.getIdentifier(), this.getKeyId()]);
        const { sequence } = await this.getProvider().getAccountKey(participant, index);
        return sequence;
    }
    async createIxRequestSender(sender) {
        if (sender == null) {
            const [participant, index, sequenceId] = await Promise.all([this.getIdentifier(), this.getKeyId(), this.getLatestSequence()]);
            return { address: participant.toHex(), key_id: index, sequence_id: sequenceId };
        }
        return {
            address: (await this.getIdentifier()).toHex(),
            key_id: sender.key_id ?? (await this.getKeyId()),
            sequence_id: sender.sequence_id ?? (await this.getLatestSequence()),
        };
    }
    async createSimulateIxRequest(arg) {
        // request was array of operations
        if (Array.isArray(arg)) {
            return {
                sender: await this.createIxRequestSender(),
                fuel_price: Signer.DEFAULT_FUEL_PRICE,
                operations: arg,
            };
        }
        // request was single operation
        if (typeof arg === "object" && "type" in arg && "payload" in arg) {
            return {
                sender: await this.createIxRequestSender(),
                fuel_price: Signer.DEFAULT_FUEL_PRICE,
                operations: [arg],
            };
        }
        // request was simulate interaction request without `sender` and `fuel_price`
        return {
            ...arg,
            sender: await this.createIxRequestSender(arg.sender),
            fuel_price: arg.fuel_price ?? Signer.DEFAULT_FUEL_PRICE,
        };
    }
    async createIxRequest(type, args) {
        const simulateIxRequest = await this.createSimulateIxRequest(args);
        if (type === "moi.Simulate") {
            return simulateIxRequest;
        }
        if (typeof args === "object" && "fuel_limit" in args && typeof args.fuel_limit === "number") {
            return { ...simulateIxRequest, fuel_limit: args.fuel_limit };
        }
        const simulation = await this.simulate(simulateIxRequest);
        const executeIxRequest = {
            ...simulateIxRequest,
            fuel_limit: simulation.effort,
        };
        const err = validateIxRequest("moi.Execute", executeIxRequest);
        if (err != null) {
            ErrorUtils.throwError(`Invalid interaction request: ${err.message}`, ErrorCode.INVALID_ARGUMENT, { ...err });
        }
        return executeIxRequest;
    }
    async simulate(arg, option) {
        const request = await this.createIxRequest("moi.Simulate", arg);
        return await this.getProvider().simulate(request, option);
    }
    async execute(arg) {
        const { ecdsa_secp256k1: algorithm } = this.signingAlgorithms;
        // checking argument is an already signed request
        if (typeof arg === "object" && "interaction" in arg && "signatures" in arg) {
            if (!isHex(arg.interaction)) {
                ErrorUtils.throwError("Invalid interaction provided. Not a valid hex.", ErrorCode.INVALID_ARGUMENT, {
                    interaction: arg.interaction,
                });
            }
            if (!Array.isArray(arg.signatures)) {
                ErrorUtils.throwError("Invalid signatures provided. Not an array.", ErrorCode.INVALID_ARGUMENT, {
                    signatures: arg.signatures,
                });
            }
            return await this.getProvider().execute(arg);
        }
        const request = await this.createIxRequest("moi.Execute", arg);
        if (request.sender.sequence_id < (await this.getLatestSequence())) {
            ErrorUtils.throwError("Sequence number is outdated", ErrorCode.SEQUENCE_EXPIRED);
        }
        const error = validateIxRequest("moi.Execute", request);
        if (error != null) {
            ErrorUtils.throwError(`Invalid interaction request: ${error.message}`, ErrorCode.INVALID_ARGUMENT, error);
        }
        const signedRequest = await this.signInteraction(request, algorithm);
        return await this.getProvider().execute(signedRequest);
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