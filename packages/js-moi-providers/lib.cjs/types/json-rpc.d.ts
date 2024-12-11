interface JsonRpcSharedPayload {
    jsonrpc: "2.0";
    id: number;
}
export interface JsonRpcRequest extends JsonRpcSharedPayload {
    method: string;
    params: unknown[];
}
interface ErrorPayload {
    code: number;
    message: string;
    data: unknown;
}
export interface JsonRpcError extends JsonRpcSharedPayload {
    error: ErrorPayload;
}
export interface JsonRpcResult<T = unknown> extends JsonRpcSharedPayload {
    result: T;
}
export type JsonRpcResponse<T = unknown> = JsonRpcResult<T> | JsonRpcError;
export {};
//# sourceMappingURL=json-rpc.d.ts.map