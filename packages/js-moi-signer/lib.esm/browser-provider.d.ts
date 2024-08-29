import { BaseProvider, type InteractionObject, type InteractionRequest } from "js-moi-providers";
import type { SigType } from "../types";
import { Signer } from "./signer";
interface BrowserRequest {
    request<T>(method: string, params: any[]): Promise<T>;
    sign(message: Uint8Array): string;
    getAddress(): Promise<string>;
    isInitialized(): boolean;
    signInteraction(ixObject: InteractionObject, sigAlgo: SigType): InteractionRequest;
}
export declare class BrowserProvider extends BaseProvider {
    constructor(browser: BrowserRequest);
    getSigner(): Promise<Signer>;
}
export declare class BrowserSigner extends Signer {
    constructor(browser: BrowserRequest);
}
export {};
//# sourceMappingURL=browser-provider.d.ts.map