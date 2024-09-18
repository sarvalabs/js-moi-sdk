
import { BaseProvider, type RpcResponse } from "js-moi-providers";

interface BrowserRequest {
    request<T>(method: string, params: any[]): Promise<T>;
}

export class BrowserProvider extends BaseProvider {
    constructor(browser: BrowserRequest) {
        super();
        
        this.execute = async <T>(method: string, params: any[]) => {
            return await browser.request<RpcResponse<T>>(method, [params]);
        };
    }
}