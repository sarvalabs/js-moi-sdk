/// <reference types="node" />
import { Signer, SigType, InteractionObject } from "moi-signer";
import { AbstractProvider, InteractionRequest } from "moi-providers";
export declare class Wallet extends Signer {
    constructor(provider?: AbstractProvider);
    load(key: Buffer, mnemonic: string, curve: string): void;
    isInitialized(): boolean;
    createRandom(): Promise<void>;
    fromMnemonic(mnemonic: string, path?: string, wordlist?: string[]): Promise<void>;
    privateKey(): any;
    mnemonic(): any;
    publicKey(): any;
    curve(): any;
    getAddress(): string;
    connect(provider: AbstractProvider): Signer;
    sign(message: Uint8Array, sigAlgo: SigType): string;
    signInteraction(ixObject: InteractionObject, sigAlgo: SigType): InteractionRequest;
}
