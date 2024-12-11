import type { JsonRpcRequest, JsonRpcResponse } from "../types/json-rpc";
import type { Transport } from "../types/provider";

export class HttpTransport implements Transport {
    private readonly host: string;

    constructor(host: string) {
        this.host = host;
    }

    async request<TResult = unknown>(method: string, ...params: unknown[]): Promise<JsonRpcResponse<TResult>> {
        const request: JsonRpcRequest = {
            id: 1,
            jsonrpc: "2.0",
            method: method,
            params: params,
        };

        const response = await fetch(this.host, {
            method: "POST",
            body: JSON.stringify(request),
            headers: {
                "Content-Type": "application/json",
            },
        });

        return await response.json();
    }
}
