
import { BaseProvider, type InteractionObject, type InteractionRequest } from "js-moi-providers";
import { ErrorCode, ErrorUtils } from "js-moi-utils";
import type { SigType } from "../types";
import { Signer } from "./signer";

interface BrowserRequest {
    request<T>(method: string, params: any[]): Promise<T>;
    sign(message: Uint8Array): string;
    getAddress(): Promise<string>;
    isInitialized(): boolean;
    signInteraction(ixObject: InteractionObject, sigAlgo: SigType): InteractionRequest;
}

export class BrowserProvider extends BaseProvider {
    constructor(browser: BrowserRequest) {
        super();
        
        this.execute = async <T>(method: string, params: any[]) => {
            const data = await browser.request<T>(method, params)
            return { id: 1, jsonrpc: "2.0", result: data }
        };

        this.getSigner = async () => {
            return new BrowserSigner(browser);
        }
    }

    async getSigner(): Promise<Signer> {
        const response = await this.execute<Signer>("moi_RequestSigner", []);
        return this.processResponse(response);
    }
}

// @ts-ignore
export class BrowserSigner extends Signer {
    constructor(browser: BrowserRequest) {
        super(new BrowserProvider(browser));
        
        this.sign = browser.sign;
        this.getAddress = browser.getAddress;
        this.connect = () => {
            ErrorUtils.throwError("Browser signer does not support connecting to a provider",  ErrorCode.UNSUPPORTED_OPERATION);
        };
        this.isInitialized = browser.isInitialized;
        this.signInteraction = browser.signInteraction;
    }
}