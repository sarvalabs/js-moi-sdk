import { ErrorCode, ErrorUtils, type Tesseract } from "js-moi-utils";
import { w3cwebsocket as Websocket, type ICloseEvent } from "websocket";
import type { Log, RpcResponse } from "../types/jsonrpc";
import type { NewLogs, NewTesseractsByAccount, ProviderEvents, WebsocketEventMap } from "../types/websocket";
import { BaseProvider } from "./base-provider";
import { WebSocketEvent } from "./websocket-events";
import { randomUUID } from "crypto";

type TypeOfWebsocketConst = ConstructorParameters<typeof Websocket>;

interface WebsocketConnection {
    protocols?: TypeOfWebsocketConst[1];
    headers?: TypeOfWebsocketConst[3];
    requestOptions?: TypeOfWebsocketConst[4];
    clientConfig?: TypeOfWebsocketConst[5];
    reconnect?: {
        delay: number;
        maxAttempts: number;
    }
    timeout?: number;
}

const WEBSOCKET_HOST_REGEX = /^wss?:\/\/([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+(:[0-9]+)?(\/.*)?$/;

export class WebsocketProvider extends BaseProvider {
    private ws: Websocket;
    private reconnects = 0;
    private reconnectInterval?: NodeJS.Timeout;
    private readonly host: string;
    private readonly options?: WebsocketConnection;
    private readonly subscriptions: Map<ProviderEvents, { subID?: Promise<string>, uuid?: string, messageHandler?: (message: MessageEvent<string>) => void }> = new Map();

    constructor(host: string, options?: WebsocketConnection) {
        if (!WEBSOCKET_HOST_REGEX.test(host)) {
            ErrorUtils.throwArgumentError("Invalid host", "host", host);
        }

        super();
        this.host = host;
        this.options = options;
        this.ws = this.createNewWebsocket(host, options);
    }

    private createNewWebsocket(host: string, options?: WebsocketConnection): Websocket {
        const ws = new Websocket(host, options?.protocols, undefined, options?.headers ?? {}, options?.requestOptions, options?.clientConfig);

        ws.onopen = () => this.handleOnConnect();
        ws.onerror = (error) => this.handleOnError(error);
        ws.onclose = (event) => this.handleOnClose(event);
        ws.onmessage = (message) => this.emit('message', message);

        if (options?.timeout) {
            setTimeout(() => {
                if (ws.readyState === ws.OPEN) {
                    return;
                };

                ws.close(3008, "Connection timeout");
            }, options.timeout);
        }

        return ws;
    }

    private reconnect(): void {
        if (this.reconnectInterval) {
            // a reconnect cycle is already running; let it keep retrying
            // at the configured delay instead of starting another one.
            return;
        }

        this.reconnects++;
        this.ws = this.createNewWebsocket(this.host, this.options);
        this.emit('reconnect', this.reconnects);

        const reconnect = this.options?.reconnect;
        if (reconnect) {
            this.reconnectInterval = setInterval(() => {
                if (this.ws.readyState === this.ws.OPEN) {
                    clearInterval(this.reconnectInterval);
                    this.reconnectInterval = undefined;
                    return;
                }

                if (this.reconnects >= reconnect.maxAttempts) {
                    this.emit('error', new Error('Max reconnect attempts reached'));
                    clearInterval(this.reconnectInterval);
                    this.reconnectInterval = undefined;
                    return;
                }

                this.reconnects++;
                this.ws = this.createNewWebsocket(this.host, this.options);
                this.emit('reconnect', this.reconnects);
            }, reconnect.delay);
        }
    }

    public async disconnect(): Promise<void> {
        if (this.ws.readyState === this.ws.OPEN) {
            this.ws.close();
        }

        if (this.ws.readyState === this.ws.CLOSED) {
            ErrorUtils.throwError("Closing on a closed connection", ErrorCode.ACTION_REJECTED);
        }

        if (this.ws.readyState === this.ws.CLOSING) {
            return new Promise((resolve) => {
                this.once(WebSocketEvent.Close, () => {
                    resolve();
                });
            });
        }

        if (this.ws.readyState === this.ws.CONNECTING) {
            return new Promise((resolve) => {
                this.once(WebSocketEvent.Connect, () => {
                    this.ws.close(1000);
                    resolve();
                });
            });
        }
    }

    private handleOnConnect(): void {
        this.reconnects = 0;

        // Any subID cached from a prior connection is no longer known to
        // the (possibly restarted) node, so drop it - and the listener
        // matching against it - to force a fresh `moi_subscribe` the next
        // time `on()`/`once()` is called for that event.
        for (const sub of this.subscriptions.values()) {
            if (sub.messageHandler) {
                // @ts-ignore - don't want to expose the message event
                this.removeListener('message', sub.messageHandler);
                sub.messageHandler = undefined;
            }

            sub.subID = undefined;
        }

        this.emit('connect');
    }

    private handleOnError(error: Error): void {
        this.emit('error', error);
    }

    private handleOnClose(event: ICloseEvent): void {
        const isError = event.code !== 1000;

        if (isError && this.options?.reconnect && this.reconnects < this.options.reconnect.maxAttempts) {
            this.reconnect();
            return;
        }

        this.emit('close');
    }

    protected execute<T = unknown>(method: string, params: any): Promise<RpcResponse<T>> {
        if (this.ws.readyState !== this.ws.OPEN) {
            return new Promise((resolve) => {
                this.once(WebSocketEvent.Connect, async () => {
                    resolve(await this.handleRpcRequest(method, params));
                });
            });
        }

        return this.handleRpcRequest(method, params);
    }

    private handleRpcRequest<T = unknown>(method: string, params: any) {
        const inputParams = Array.isArray(params) ? params : [params];
        const payload = {
            method: method,
            params: inputParams,
            jsonrpc: "2.0",
            id: randomUUID(),
        };

        return new Promise<RpcResponse<T>>((resolve) => {
            const handler = (message: MessageEvent) => {
                const response: Omit<RpcResponse<T>, "id"> & { id: string; } = JSON.parse(message.data);

                if (response.id !== payload.id as unknown) {
                    return;
                }

                // @ts-ignore - don't want to expose the message event
                this.removeListener('message', handler);
                resolve({ ...response, id: 1 });
            };

            // @ts-ignore - don't want to expose the message event
            this.on('message', handler);
            this.ws.send(JSON.stringify(payload));
        });
    }

    private isSubscriptionEvent(eventName: ProviderEvents): boolean {
        const events = ['newTesseracts', 'newTesseractsByAccount', 'newLogs', 'newPendingInteractions'];
        const name = typeof eventName === "string" ? eventName : eventName.event;
        return events.includes(name);
    }

    public override async getSubscription(eventName: ProviderEvents): Promise<string> {
        const sub = this.subscriptions.get(eventName);

        if (sub?.subID != null) {
            return await sub.subID;
        }

        if (sub == null) {
            const promise = super.getSubscription(eventName);
            this.subscriptions.set(eventName, { subID: promise });
            return await promise;
        }

        sub.subID = super.getSubscription(eventName);
        return await sub.subID;
    }

    on(eventName: NewLogs, listener: (log: Log) => void): this;
    on(eventName: NewTesseractsByAccount, listener: (tesseract: Tesseract) => void): this;
    on<K extends keyof WebsocketEventMap>(eventName: K, listener: (...args: WebsocketEventMap[K]) => void): this;
    /**
     * This method listens to events emitted by the provider for the given event
     * 
     * @param eventName - The event to listen to this can be a string or an object
     * @param listener - The callback function to be called when the event is emitted
     * @returns - The provider instance
     */
    on(eventName: ProviderEvents, listener: (...args: any[]) => void): this {
        if (typeof eventName === "string") {
            super.on(eventName, listener);
        }

        if (typeof eventName === "object") {
            if (this.subscriptions.has(eventName)) {
                const _sub = this.subscriptions.get(eventName)!;

                if (_sub.uuid == null) {
                    _sub.uuid = `${eventName.event}:${randomUUID()}`;
                }
                super.on(_sub.uuid, listener);
            } else {
                const uuid = `${eventName.event}:${randomUUID()}`;
                this.subscriptions.set(eventName, { uuid });
                super.on(uuid, listener);
            }
        }

        if (this.isSubscriptionEvent(eventName)) {
            const _sub = this.subscriptions.get(eventName);

            if (_sub?.subID != null) {
                return this;
            }


            this.getSubscription(eventName).then((subscription) => {
                const messageHandler = (message: MessageEvent<string>) => {
                    const data = JSON.parse(message.data);

                    if (!("method" in data) || data.method !== "moi.subscription" || data.params.subscription !== subscription) {
                        return
                    }

                    if (typeof eventName === "string") {
                        this.emit(eventName, this.processWsResult(eventName as ProviderEvents, data.params.result));
                        return;
                    }

                    if (typeof eventName === "object" && _sub?.uuid != null) {
                        this.emit(_sub.uuid, this.processWsResult(eventName, data.params.result));
                        return;
                    }
                };

                const sub = this.subscriptions.get(eventName);
                if (sub) {
                    sub.messageHandler = messageHandler;
                }

                // @ts-ignore - don't want to expose the message event
                this.on("message", messageHandler);
            });
        }

        return this;
    }

    once<K>(eventName: NewTesseractsByAccount, listener: (tesseract: Tesseract) => void): this;
    once<K>(eventName: NewLogs, listener: (logs: Log) => void): this;
    once<K>(eventName: keyof WebsocketEventMap | K, listener: K extends keyof WebsocketEventMap ? WebsocketEventMap[K] extends unknown[] ? (...args: WebsocketEventMap[K]) => void : never : never): this;
    /**
     * Adds a one-time listener function for the specified event.
     *
     * @param eventName - The name of the event to listen for.
     * @param listener - A function to be called when the event is triggered.
     * @returns The WebSocketProvider instance.
     */
    once(eventName: ProviderEvents, listener: (...args: any[]) => void): this {
        if (typeof eventName === "string") {
            super.once(eventName, listener);
        }

        if (typeof eventName === "object") {
            if (this.subscriptions.has(eventName)) {
                const _sub = this.subscriptions.get(eventName)!;

                if (_sub.uuid == null) {
                    _sub.uuid = `${eventName.event}:${randomUUID()}`;
                }
                super.once(_sub.uuid, listener);
            } else {
                const uuid = `${eventName.event}:${randomUUID()}`;
                this.subscriptions.set(eventName, { uuid });
                super.once(uuid, listener);
            }
        }

        if (this.isSubscriptionEvent(eventName)) {
            const _sub = this.subscriptions.get(eventName);

            if (_sub?.subID != null) {
                return this;
            }


            this.getSubscription(eventName).then((subscription) => {
                const messageHandler = (message: MessageEvent<string>) => {
                    const data = JSON.parse(message.data);

                    if (!("method" in data) || data.method !== "moi.subscription" || data.params.subscription !== subscription) {
                        return
                    }

                    if (typeof eventName === "string") {
                        this.emit(eventName, this.processWsResult(eventName, data.params.result));
                        return;
                    }

                    if (typeof eventName === "object" && _sub?.uuid != null) {
                        this.emit(_sub.uuid, this.processWsResult(eventName, data.params.result));
                        return;
                    }
                };

                const sub = this.subscriptions.get(eventName);
                if (sub) {
                    sub.messageHandler = messageHandler;
                }

                // @ts-ignore - don't want to expose the message event
                this.on("message", messageHandler);
            });
        }

        return this;
    }

    removeListener<K>(eventName: NewLogs, listener: (logs: Log) => void): this;
    removeListener<K>(eventName: NewTesseractsByAccount, listener: (tesseract: Tesseract) => void): this;
    removeListener<K>(eventName: keyof WebsocketEventMap | K, listener: K extends keyof WebsocketEventMap ? WebsocketEventMap[K] extends unknown[] ? (...args: WebsocketEventMap[K]) => void : never : never): this;
    /**
     * Removes a listener from the WebSocket provider.
     * 
     * @param eventName - The name of the event or an object representing a subscription.
     * @param listener - The listener function to be removed.
     * @returns The WebSocket provider instance.
     */
    removeListener(eventName: ProviderEvents, listener: (...args: any[]) => void): this {
        if (typeof eventName === "string") {
            super.removeListener(eventName, listener);
        }

        if (typeof eventName === "object") {
            const _sub = this.subscriptions.get(eventName);

            if (_sub?.uuid == null) {
                return this;
            }

            super.removeListener(_sub.uuid, listener);
            this.subscriptions.delete(eventName);
        }
        return this;
    }

    /**
     * This method removes a listener from the provider
     * 
     * @param eventName - The event to remove the listener from
     * @param listener - The listener to remove
     * @returns - The provider instance
     */
    off(eventName: string | symbol, listener: (...args: any[]) => void): this {
        return super.off(eventName, listener);
    }

    /**
     * This methods returns all the listeners for a given event
     * 
     * @param eventName - The event to get the listeners for
     * @returns - An array of listeners
     */
    listeners<K>(eventName: string | symbol): Function[] {
        return super.listeners(eventName);
    }

    /**
     * Returns the number of listeners for the specified event name.
     * 
     * @param eventName - The name of the event.
     * @param listener - (Optional) The listener function.
     * @returns The number of listeners for the specified event name.
     */
    listenerCount<K>(eventName: string | symbol, listener?: Function): number {
        return super.listenerCount(eventName, listener);
    }

    /**
     * Removes all event listeners for the specified event or all events.
     * 
     * @param event - The event to remove listeners for. If not specified, all listeners for all events will be removed.
     * @returns The instance of the class with all listeners removed.
     */
    removeAllListeners(event?: string | symbol): this {
        return super.removeAllListeners(event);
    }
}