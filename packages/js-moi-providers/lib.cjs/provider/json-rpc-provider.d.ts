import { type HttpTransportOption } from "../transport/http-transport";
import { Provider } from "./provider";
export interface JsonRpcProviderOption extends HttpTransportOption {
}
export declare class JsonRpcProvider extends Provider {
    constructor(host: string, option?: JsonRpcProviderOption);
    private static isValidHost;
}
//# sourceMappingURL=json-rpc-provider.d.ts.map