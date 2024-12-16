import { Provider } from "./provider";
import { type HttpTransportOption } from "./transport/http-transport";
export interface JsonRpcProviderOption extends HttpTransportOption {
}
export declare class JsonRpcProvider extends Provider {
    constructor(host: string, option?: JsonRpcProviderOption);
    private static isValidHost;
}
//# sourceMappingURL=json-rpc-provider.d.ts.map