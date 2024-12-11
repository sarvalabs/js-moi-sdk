import { Provider } from "./provider";
import { type HttpTransportOption } from "./transport/http-transport";
interface JsonRpcProviderOption extends HttpTransportOption {
}
export declare class JsonRpcProvider extends Provider {
    constructor(host: string, option?: JsonRpcProviderOption);
}
export {};
//# sourceMappingURL=json-rpc-provider.d.ts.map