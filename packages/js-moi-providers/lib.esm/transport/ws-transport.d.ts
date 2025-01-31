import EventEmitter from "events";
import type { JsonRpcRequest, JsonRpcResponse, Transport } from "js-moi-utils";
export interface WebsocketTransportOptions {
    reconnect?: number;
}
/**
 * WebsocketTransport is a transport that sends JSON-RPC messages over Websocket.
 */
export declare class WebsocketTransport extends EventEmitter implements Transport {
    private readonly options;
    private readonly address;
    private reconnects;
    private ws?;
    private waitForConnectionPromise?;
    constructor(socket: string, options?: WebsocketTransportOptions);
    protected createNewConnection(): void;
    private waitForConnection;
    request<TResult = unknown>(request: JsonRpcRequest): Promise<JsonRpcResponse<TResult>>;
    close(): void;
    protected send(data: unknown): void;
    private static validateOptions;
    private static isValidWebSocketUrl;
}
//# sourceMappingURL=ws-transport.d.ts.map