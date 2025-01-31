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
    /**
     * Sends a JSON-RPC request over a WebSocket connection and waits for the response.
     *
     * @param {JsonRpcRequest} request - The JSON-RPC request object to be sent.
     * @returns {Promise<JsonRpcResponse<TResult>>} A promise that resolves with the JSON-RPC response.
     * @throws Will throw an error if the response cannot be parsed or if the connection fails.
     */
    request<TResult = unknown>(request: JsonRpcRequest): Promise<JsonRpcResponse<TResult>>;
    /**
     * Closes the WebSocket connection.
     *
     * @throws {Error} If the WebSocket is not initialized.
     */
    close(): void;
    protected send(data: unknown): void;
    private static validateOptions;
    private static isValidWebSocketUrl;
}
//# sourceMappingURL=ws-transport.d.ts.map