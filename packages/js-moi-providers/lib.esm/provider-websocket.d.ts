import type { Tesseract } from "js-moi-utils";
import { w3cwebsocket as Websocket } from "websocket";
import type { RpcResponse } from "../types/jsonrpc";
import type { ProviderEvents, WebsocketEventMap } from "./abstract-provider";
import { BaseProvider } from "./base-provider";
type TypeOfWebsocketConst = ConstructorParameters<typeof Websocket>;
interface WebsocketConnection {
    protocols?: TypeOfWebsocketConst[1];
    headers?: TypeOfWebsocketConst[3];
    requestOptions?: TypeOfWebsocketConst[4];
    clientConfig?: TypeOfWebsocketConst[5];
    reconnect?: {
        delay: number;
        maxAttempts: number;
    };
    timeout?: number;
}
export declare class WebsocketProvider extends BaseProvider {
    private ws;
    private reconnects;
    private reconnectInterval?;
    private readonly host;
    private readonly options?;
    private readonly subscriptions;
    constructor(host: string, options?: WebsocketConnection);
    private createNewWebsocket;
    private reconnect;
    private handleOnConnect;
    private handleOnError;
    private handleOnClose;
    protected execute<T = unknown>(method: string, params: any): Promise<RpcResponse<T>>;
    private handleRpcRequest;
    private isSubscriptionEvent;
    getSubscription(eventName: ProviderEvents): Promise<string>;
    on<K>(eventName: {
        event: "newTesseractsByAccount";
        params: string;
    }, listener: (tesseract: Tesseract) => void): this;
    on<K>(eventName: keyof WebsocketEventMap | K, listener: K extends keyof WebsocketEventMap ? WebsocketEventMap[K] extends unknown[] ? (...args: WebsocketEventMap[K]) => void : never : never): this;
    once<K>(eventName: {
        event: "newTesseractsByAccount";
        params: string;
    }, listener: (tesseract: Tesseract) => void): this;
    once<K>(eventName: keyof WebsocketEventMap | K, listener: K extends keyof WebsocketEventMap ? WebsocketEventMap[K] extends unknown[] ? (...args: WebsocketEventMap[K]) => void : never : never): this;
    removeListener<K>(eventName: {
        event: "newTesseractsByAccount";
        params: string;
    }, listener: (tesseract: Tesseract) => void): this;
    removeListener<K>(eventName: keyof WebsocketEventMap | K, listener: K extends keyof WebsocketEventMap ? WebsocketEventMap[K] extends unknown[] ? (...args: WebsocketEventMap[K]) => void : never : never): this;
}
export {};
//# sourceMappingURL=provider-websocket.d.ts.map