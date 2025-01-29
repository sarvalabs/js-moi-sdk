import EventEmitter from "events";
import type { JsonRpcRequest, JsonRpcResponse, Transport } from "js-moi-utils";
export type Websocketify<T extends JsonRpcRequest | JsonRpcResponse> = Omit<T, "id"> & {
    id: string;
};
export interface WebsocketTransportOptions {
    reconnect?: number;
}
export declare class WebsocketTransport extends EventEmitter implements Transport {
    private readonly options;
    private readonly address;
    private reconnects;
    private ws?;
    private waitForConnectionPromise?;
    constructor(socket: string, options?: WebsocketTransportOptions);
    protected createNewConnection(): void;
    private waitForConnection;
    request<TResult = unknown>(method: string, params: unknown[]): Promise<JsonRpcResponse<TResult>>;
    close(): void;
    private createId;
    private createPayload;
    protected send(data: unknown): void;
    private static validateOptions;
    private static isValidWebSocketUrl;
}
//# sourceMappingURL=ws-transport.d.ts.map