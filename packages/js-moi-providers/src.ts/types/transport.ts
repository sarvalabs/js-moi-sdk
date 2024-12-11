import type { JsonRpcResponse } from "./json-rpc";

export interface Transport {
    request<TResult = unknown>(method: string, params: unknown[]): Promise<JsonRpcResponse<TResult>>;
}
