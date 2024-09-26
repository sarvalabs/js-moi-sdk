import { w3cwebsocket as Websocket } from "websocket";
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
    };
    timeout?: number;
}
export declare class WebsocketProvider extends BaseProvider {
    private ws;
    private reconnects;
    private reconnectInterval?;
    private readonly host;
    private readonly options?;
    constructor(host: string, options?: WebsocketConnection);
    private createNewWebsocket;
    private reconnect;
    handleOnConnect(): void;
    handleOnError(error: Error): void;
    private handleOnClose;
    protected execute<T = unknown>(method: string, params: any): Promise<RpcResponse<T>>;
    private handleRpcRequest;
    subscribe<T extends keyof WebsocketSubscriptionParams>(event: T, ...args: WebsocketSubscriptionParams[T]): Promise<void>;
}
export {};
//# sourceMappingURL=provider-websocket.d.ts.map