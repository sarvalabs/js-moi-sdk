import { BaseProvider, type AbstractProvider, type InteractionObject, type InteractionRequest } from "js-moi-providers";
import type { SigType } from "../types";
import { Signer } from "./signer";
interface BrowserRequest {
    request<T>(method: string, params: any[]): Promise<T>;
    sign(message: Uint8Array): string;
}
export declare class BrowserProvider extends BaseProvider {
    constructor(browser: BrowserRequest);
    getSigner(): Promise<Signer>;
}
export declare class BrowserSigner extends Signer {
    constructor();
    sign(message: Uint8Array): string;
    getAddress(): string;
    connect(provider: AbstractProvider): void;
    isInitialized(): boolean;
    signInteraction(ixObject: InteractionObject, sigAlgo: SigType): InteractionRequest;
}
export {};
//# sourceMappingURL=browser-provider.d.ts.map