/// <reference types="node" />
import { BaseProvider, Options, InteractionResponse, InteractionRequest } from "moi-providers";
import { SigType, InteractionObject } from "../types";
export declare abstract class Signer {
    provider?: BaseProvider;
    signingAlgorithms: any;
    constructor(provider?: BaseProvider);
    abstract getAddress(): string;
    abstract connect(provider: BaseProvider): Signer;
    abstract sign(message: Uint8Array, sigAlgo: SigType): string;
    abstract signInteraction(ixObject: InteractionObject, sigAlgo: SigType): InteractionRequest;
    getProvider(): BaseProvider;
    getNonce(options?: Options): Promise<number | bigint>;
    sendInteraction(ixObject: InteractionObject): Promise<InteractionResponse>;
    verify(message: Buffer, signature: string | Buffer, publicKey: string | Buffer): boolean;
}
