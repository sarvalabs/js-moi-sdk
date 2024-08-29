
import { BaseProvider, type AbstractProvider, type InteractionObject, type InteractionRequest } from "js-moi-providers";
import type { SigType } from "../types";
import { Signer } from "./signer";

interface BrowserRequest {
    request<T>(method: string, params: any[]): Promise<T>;
    sign(message: Uint8Array): string;
}

export class BrowserProvider extends BaseProvider {
    constructor(browser: BrowserRequest) {
        super();
        
        this.execute = async <T>(method: string, params: any[]) => {
            const data = await browser.request<T>(method, params)
            return { id: 1, jsonrpc: "2.0", result: data }
        };
    }

    async getSigner(): Promise<Signer> {
        const response = await this.execute<Signer>("moi_RequestSigner", []);
        return this.processResponse(response);
    }
}

export class BrowserSigner extends Signer {
    constructor() {
        super();
    }

    sign(message: Uint8Array): string {
        throw new Error("Not implemented");
    }

    getAddress(): Promise<string> {
        throw new Error("Method not implemented.");
    }
    
    connect(provider: AbstractProvider): void {
        throw new Error("Method not implemented.");
    }

    isInitialized(): boolean {
        throw new Error("Method not implemented.");
    }
    
    signInteraction(ixObject: InteractionObject, sigAlgo: SigType): InteractionRequest {
        throw new Error("Method not implemented.");
    }
}