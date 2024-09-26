import { randomUUID } from "crypto";
import { w3cwebsocket as Websocket, type ICloseEvent } from "websocket";
import type { RpcResponse } from "../types/jsonrpc";
import type { WebsocketSubscriptionParams } from "./abstract-provider";
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
    }
    timeout?: number;
}

export class WebsocketProvider extends BaseProvider {
    private ws: Websocket;
    private reconnects = 0;
    private reconnectInterval?: NodeJS.Timeout;
    private readonly host: string;
    private readonly options?: WebsocketConnection;

    constructor(host: string, options?: WebsocketConnection) {
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
        // @ts-ignore - don't want to expose the message event
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
        this.reconnects++;
        this.ws = this.createNewWebsocket(this.host, this.options);
        this.emit('reconnect', this.reconnects);

        if (this.options.reconnect) {
            const interval = setInterval(() => {
                if (this.ws.readyState === this.ws.OPEN) {
                    clearInterval(interval);
                    return;
                }

                if (this.reconnects >= this.options.reconnect.maxAttempts) {
                    this.emit('error', new Error('Max reconnect attempts reached'));
                    clearInterval(interval);
                    return;
                }

                this.reconnects++;
                this.ws = this.createNewWebsocket(this.host, this.options);
                this.emit('reconnect', this.reconnects);
            }, this.options.reconnect.delay);
        }
    }

    handleOnConnect(): void {
        this.reconnects = 0;
        this.emit('connect');
    }

    handleOnError(error: Error): void {
        this.emit('error', error);
    }

    private handleOnClose(event: ICloseEvent): void {
        const isError = event.code !== 1000;
        
        if (isError) {
            if (this.options?.reconnect && this.reconnects < this.options.reconnect.maxAttempts) {
                if (this.reconnectInterval) {
                    clearInterval(this.reconnectInterval);
                }
                
                this.reconnect();
                return;
            }
        }

        this.emit('close');
    }

    protected execute<T = unknown>(method: string, params: any): Promise<RpcResponse<T>> {
        if (this.ws.readyState !== this.ws.OPEN) {
            return new Promise((resolve) => {
                this.once('connect', async () => {
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

    public async subscribe<T extends keyof WebsocketSubscriptionParams>(event: T, ...args: WebsocketSubscriptionParams[T]): Promise<void> {
        this.execute("moi.subscribe", [])
    }
}