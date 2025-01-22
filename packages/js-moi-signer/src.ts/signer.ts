import { ExecuteIx, InteractionResponse, Provider, SimulateOption, type SimulateInteractionRequest } from "js-moi-providers";
import { ErrorCode, ErrorUtils, hexToBytes, isHex, type Hex, type InteractionRequest, type IxOp, type Sender, type Simulate } from "js-moi-utils";
import type { SigningAlgorithms, SigType } from "../types";
import ECDSA_S256 from "./ecdsa";
import Signature from "./signature";

export type SignerIx<T extends InteractionRequest | SimulateInteractionRequest> = Omit<T, "sender" | "fuel_price" | "fuel_limit"> & {
    sender?: Partial<Omit<Sender, "address">>;
    fuel_price?: InteractionRequest["fuel_price"];
} & (T extends InteractionRequest ? { fuel_limit?: InteractionRequest["fuel_limit"] } : {});

export abstract class Signer {
    private provider?: Provider;

    public signingAlgorithms: SigningAlgorithms;

    private static DEFAULT_FUEL_PRICE = 1;

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

    private async createIxRequestSender(sender?: Partial<Omit<Sender, "address">>): Promise<Sender> {
        if (sender == null) {
            const [address, index, sequenceId] = await Promise.all([this.getAddress(), this.getKeyId(), this.getLatestSequence()]);

            return { address, key_id: index, sequence_id: sequenceId };
        }

        if (sender.sequence_id != null) {
            if (sender.sequence_id < (await this.getLatestSequence())) {
                ErrorUtils.throwError("Sequence number is outdated", ErrorCode.SEQUENCE_EXPIRED);
            }
        }

        return {
            address: await this.getAddress(),
            key_id: sender.key_id ?? (await this.getKeyId()),
            sequence_id: sender.sequence_id ?? (await this.getLatestSequence()),
        };
    }

    private async createSimulateIxRequest(arg: SignerIx<SimulateInteractionRequest> | IxOp | IxOp[]): Promise<SimulateInteractionRequest> {
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

    public async createIxRequest(type: "moi.Simulate", args: SignerIx<SimulateInteractionRequest> | IxOp[] | IxOp): Promise<SimulateInteractionRequest>;
    public async createIxRequest(type: "moi.Execute", args: SignerIx<InteractionRequest> | IxOp[] | IxOp): Promise<InteractionRequest>;
    public async createIxRequest(
        type: "moi.Simulate" | "moi.Execute",
        args: SignerIx<InteractionRequest | SimulateInteractionRequest> | IxOp[] | IxOp
    ): Promise<SimulateInteractionRequest | InteractionRequest> {
        if (!["moi.Simulate", "moi.Execute"].includes(type)) {
            ErrorUtils.throwError("Invalid type provided", ErrorCode.INVALID_ARGUMENT, {
                type,
            });
        }

        const simulateIxRequest = await this.createSimulateIxRequest(args);

        if (type === "moi.Simulate") {
            return simulateIxRequest;
        }

        if (typeof args === "object" && "fuel_limit" in args && typeof args.fuel_limit === "number") {
            return { ...simulateIxRequest, fuel_limit: args.fuel_limit };
        }

        const simulation = await this.simulate(simulateIxRequest);

        return {
            ...simulateIxRequest,
            fuel_limit: simulation.effort,
        };
    }

    public async simulate(operation: IxOp, options?: SimulateOption): Promise<Simulate>;
    public async simulate(operations: IxOp[], options?: SimulateOption): Promise<Simulate>;
    public async simulate(ix: SignerIx<SimulateInteractionRequest>, option?: SimulateOption): Promise<Simulate>;
    public async simulate(arg: SignerIx<SimulateInteractionRequest> | IxOp[] | IxOp, option?: SimulateOption): Promise<Simulate> {
        const request = await this.createIxRequest("moi.Simulate", arg);

        return await this.getProvider().simulate(request, option);
    }

    public async execute(operation: IxOp): Promise<InteractionResponse>;
    public async execute(operations: IxOp[]): Promise<InteractionResponse>;
    public async execute(ix: SignerIx<InteractionRequest>): Promise<InteractionResponse>;
    public async execute(request: ExecuteIx): Promise<InteractionResponse>;
    public async execute(arg: SignerIx<InteractionRequest> | IxOp | IxOp[] | ExecuteIx): Promise<InteractionResponse> {
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
