/// <reference types="node" />
import { Signer, SigType, InteractionObject } from "moi-signer";
import { BaseProvider, InteractionRequest } from "moi-providers";
export declare class Wallet extends Signer {
    constructor(provider?: BaseProvider);
    load(key: Buffer | undefined, mnemonic: string | undefined, curve: string): void;
    createRandom(): Promise<void>;
    fromMnemonic(mnemonic: string, path?: string, wordlist?: string[]): Promise<void>;
    privateKey(): any;
    mnemonic(): any;
    publicKey(): any;
    curve(): any;
    getAddress(): string;
    connect(provider: BaseProvider): Signer;
    sign(message: Uint8Array, sigAlgo: SigType): string;
    signInteraction(ixObject: InteractionObject, sigAlgo: SigType): InteractionRequest;
}
