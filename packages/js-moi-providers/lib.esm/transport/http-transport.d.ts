import type { JsonRpcResponse } from "../types/json-rpc";
import type { Transport } from "../types/provider";
export declare class HttpTransport implements Transport {
    private readonly host;
    constructor(host: string);
    request<TResult = unknown>(method: string, ...params: unknown[]): Promise<JsonRpcResponse<TResult>>;
}
//# sourceMappingURL=http-transport.d.ts.map