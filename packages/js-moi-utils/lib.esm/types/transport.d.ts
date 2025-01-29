import type { JsonRpcRequest, JsonRpcResponse } from "./json-rpc";
/**
 * Transport represents a way to send and receive JSON-RPC messages.
 */
export interface Transport {
    /**
     * Sends a JSON-RPC request to the client.
     *
     * @param method The method to call.
     * @param params The parameters to pass to the method.
     * @returns The JSON-RPC response.
     */
    request<TResult = unknown>(request: JsonRpcRequest): Promise<JsonRpcResponse<TResult>>;
}
//# sourceMappingURL=transport.d.ts.map