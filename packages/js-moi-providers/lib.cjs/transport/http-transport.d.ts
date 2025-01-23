import { type JsonRpcRequest, type JsonRpcResponse, type Transport } from "js-moi-utils";
export interface HttpTransportOption {
    debug?: (params: {
        ok: boolean;
        request: JsonRpcRequest;
        response: JsonRpcResponse;
        error?: unknown;
    }) => void;
}
export declare class HttpTransport implements Transport {
    private readonly host;
    private readonly option?;
    private static HOST_REGEX;
    constructor(host: string, option?: HttpTransportOption);
    private createPayload;
    request<TResult = unknown>(method: string, params: unknown[]): Promise<JsonRpcResponse<TResult>>;
}
//# sourceMappingURL=http-transport.d.ts.map