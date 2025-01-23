import { type JsonRpcRequest, type JsonRpcResponse, type Transport } from "js-moi-utils";
type DebugArgument = {
    ok: boolean;
    request: JsonRpcRequest;
    response: JsonRpcResponse;
    error?: unknown;
    host: string;
};
export interface HttpTransportOption {
    debug?: (params: DebugArgument) => void;
}
export declare class HttpTransport implements Transport {
    private readonly host;
    private readonly option?;
    private static HOST_REGEX;
    constructor(host: string, option?: HttpTransportOption);
    private createPayload;
    request<TResult = unknown>(method: string, params: unknown[]): Promise<JsonRpcResponse<TResult>>;
}
export {};
//# sourceMappingURL=http-transport.d.ts.map