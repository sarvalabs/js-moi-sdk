interface JsonRpcCommon {
    id: number;
    jsonrpc: "2.0";
}

/**
 * Represents a JSON-RPC request.
 */
export interface JsonRpcRequest extends JsonRpcCommon {
    method: string;
    params: unknown[];
}

interface ErrorPayload {
    code: number;
    message: string;
    data: any;
}

/**
 * Represents a JSON-RPC error.
 */
export interface JsonRpcError extends JsonRpcCommon {
    error: ErrorPayload;
}

/**
 * Represents a JSON-RPC result.
 */
export interface JsonRpcResult<T = unknown> extends JsonRpcCommon {
    result: T;
}

/**
 * Represents a JSON-RPC response.
 */
export type JsonRpcResponse<T = unknown> = JsonRpcResult<T> | JsonRpcError;
