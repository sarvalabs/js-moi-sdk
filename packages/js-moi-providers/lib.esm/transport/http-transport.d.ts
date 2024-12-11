import type { JsonRpcRequest, JsonRpcResponse } from "../types/json-rpc";
import type { Transport } from "../types/provider";
export interface HttpTransportOption {
    debug?: (request: JsonRpcRequest, result: {
        success: boolean;
        cause?: unknown;
    }) => void;
}
export declare class HttpTransport implements Transport {
    private readonly host;
    private readonly option?;
    constructor(host: string, option?: HttpTransportOption);
    createPayload(method: string, params: unknown[]): JsonRpcRequest;
    request<TResult = unknown>(method: string, params: unknown[]): Promise<JsonRpcResponse<TResult>>;
}
//# sourceMappingURL=http-transport.d.ts.map