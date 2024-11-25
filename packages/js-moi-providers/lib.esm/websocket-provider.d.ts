import { type Tesseract } from "@zenz-solutions/js-moi-utils";
import { w3cwebsocket as Websocket } from "websocket";
import type { Log, RpcResponse } from "../types/jsonrpc";
import type { NewLogs, NewTesseractsByAccount, ProviderEvents, WebsocketEventMap } from "../types/websocket";
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
    disconnect(): Promise<void>;
    private handleOnConnect;
    private handleOnError;
    private handleOnClose;
    protected execute<T = unknown>(method: string, params: any): Promise<RpcResponse<T>>;
    private handleRpcRequest;
    private isSubscriptionEvent;
    getSubscription(eventName: ProviderEvents): Promise<string>;
    on(eventName: NewLogs, listener: (log: Log) => void): this;
    on(eventName: NewTesseractsByAccount, listener: (tesseract: Tesseract) => void): this;
    on<K extends keyof WebsocketEventMap>(eventName: K, listener: (...args: WebsocketEventMap[K]) => void): this;
    once<K>(eventName: NewTesseractsByAccount, listener: (tesseract: Tesseract) => void): this;
    once<K>(eventName: NewLogs, listener: (logs: Log) => void): this;
    once<K>(eventName: keyof WebsocketEventMap | K, listener: K extends keyof WebsocketEventMap ? WebsocketEventMap[K] extends unknown[] ? (...args: WebsocketEventMap[K]) => void : never : never): this;
    removeListener<K>(eventName: NewLogs, listener: (logs: Log) => void): this;
    removeListener<K>(eventName: NewTesseractsByAccount, listener: (tesseract: Tesseract) => void): this;
    removeListener<K>(eventName: keyof WebsocketEventMap | K, listener: K extends keyof WebsocketEventMap ? WebsocketEventMap[K] extends unknown[] ? (...args: WebsocketEventMap[K]) => void : never : never): this;
    /**
     * This method removes a listener from the provider
     *
     * @param eventName - The event to remove the listener from
     * @param listener - The listener to remove
     * @returns - The provider instance
     */
    off(eventName: string | symbol, listener: (...args: any[]) => void): this;
    /**
     * This methods returns all the listeners for a given event
     *
     * @param eventName - The event to get the listeners for
     * @returns - An array of listeners
     */
    listeners<K>(eventName: string | symbol): Function[];
    /**
     * Returns the number of listeners for the specified event name.
     *
     * @param eventName - The name of the event.
     * @param listener - (Optional) The listener function.
     * @returns The number of listeners for the specified event name.
     */
    listenerCount<K>(eventName: string | symbol, listener?: Function): number;
    /**
     * Removes all event listeners for the specified event or all events.
     *
     * @param event - The event to remove listeners for. If not specified, all listeners for all events will be removed.
     * @returns The instance of the class with all listeners removed.
     */
    removeAllListeners(event?: string | symbol): this;
}
export {};
//# sourceMappingURL=websocket-provider.d.ts.map