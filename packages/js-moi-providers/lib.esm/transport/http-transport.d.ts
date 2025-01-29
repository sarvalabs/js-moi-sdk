import { type JsonRpcRequest, type JsonRpcResponse, type Transport } from "js-moi-utils";
export declare class HttpTransport implements Transport {
    private readonly host;
    private static HOST_REGEX;
    constructor(host: string);
    request<TResult = unknown>(request: JsonRpcRequest): Promise<JsonRpcResponse<TResult>>;
}
//# sourceMappingURL=http-transport.d.ts.map