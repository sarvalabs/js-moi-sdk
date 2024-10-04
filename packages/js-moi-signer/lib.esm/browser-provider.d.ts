import { BaseProvider } from "js-moi-providers";
interface BrowserRequest {
    request<T>(method: string, params: any[]): Promise<T>;
}
export declare class BrowserProvider extends BaseProvider {
    constructor(browser: BrowserRequest);
}
export {};
//# sourceMappingURL=browser-provider.d.ts.map