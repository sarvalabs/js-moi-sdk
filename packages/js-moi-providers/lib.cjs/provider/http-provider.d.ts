import { type HttpTransportOption } from "../transport/http-transport";
import { JsonRpcProvider } from "./json-rpc-provider";
export interface HttpProviderOptions extends HttpTransportOption {
}
export declare class HttpProvider extends JsonRpcProvider {
    constructor(host: string, option?: HttpProviderOptions);
}
//# sourceMappingURL=http-provider.d.ts.map