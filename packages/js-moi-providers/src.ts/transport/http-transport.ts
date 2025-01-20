import { ErrorUtils, type JsonRpcRequest, type JsonRpcResponse, type Transport } from "js-moi-utils";

export interface HttpTransportOption {
    debug?: (request: JsonRpcRequest, result: { success: boolean; cause?: unknown }) => void;
}

export class HttpTransport implements Transport {
    private readonly host: string;

    private readonly option?: HttpTransportOption;

    private static HOST_REGEX = /^https?:\/\/(?:(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}|localhost(?::\d+)?)\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

    constructor(host: string, option?: HttpTransportOption) {
        if (!host) {
            ErrorUtils.throwArgumentError(`Http host is required`, "host", host);
        }

        if (!HttpTransport.HOST_REGEX.test(host)) {
            ErrorUtils.throwArgumentError(`Invalid host url "${host}"`, "host", host);
        }

        this.host = host;
        this.option = option;
    }

    private createPayload(method: string, params: unknown[]): JsonRpcRequest {
        return {
            id: 1,
            jsonrpc: "2.0",
            method: method,
            params: params,
        };
    }

    public async request<TResult = unknown>(method: string, params: unknown[]): Promise<JsonRpcResponse<TResult>> {
        const request = this.createPayload(method, params);
        let result: JsonRpcResponse<TResult>;

        try {
            const content = JSON.stringify(request);
            const headers: HeadersInit = new Headers({
                "Content-Type": "application/json",
                "Content-Length": content.length.toString(),
                Accept: "application/json",
            });
            const response = await fetch(this.host, {
                method: "POST",
                body: content,
                headers: headers,
            });

            if (!response.ok) {
                result = {
                    id: 1,
                    jsonrpc: "2.0",
                    error: {
                        code: response.status,
                        message: `Request failed`,
                        data: null,
                    },
                };
            }

            result = await response.json();
        } catch (error: any) {
            const isNetworkError = error?.cause?.code === "ECONNREFUSED" || error.message === "Failed to fetch";
            const errMessage = isNetworkError ? `Network error. Cannot connect to ${this.host}` : "message" in error ? error.message : "Unknown error occurred";

            result = {
                id: 1,
                jsonrpc: "2.0",
                error: { code: -1, message: errMessage, data: error },
            };
        }

        this.option?.debug?.(request, {
            success: "result" in result,
            cause: "error" in result ? result.error : undefined,
        });

        return result;
    }
}
