import { WebsocketProviderOptions } from "../types/provider";
import { JsonRpcProvider } from "./jsonrpc-provider";
import Event from "./event";
import { Subscription } from "../types/websocket";
import { InflightRequest } from "../types/websocket";
export declare class WebSocketProvider extends JsonRpcProvider {
    requestQueue: Map<number, InflightRequest>;
    responseQueue: Map<number, InflightRequest>;
    connection: any;
    wsConnOptions: WebsocketProviderOptions;
    reconnecting: boolean;
    reconnAttempts: number;
    subscriptions: Map<string, Subscription>;
    subsIds: {
        [tag: string]: Promise<string>;
    };
    constructor(host: string, options?: WebsocketProviderOptions);
    connect: () => void;
    private addEventListener;
    private removeEventListener;
    private reconnect;
    private onError;
    private onConnect;
    private isConnectionFailed;
    private onClose;
    private onMessage;
    private sendRequest;
    send(method: string, params: any[]): Promise<any>;
    _subscribe(tag: string, param: Array<any>, processFunc: (result: any) => void): Promise<void>;
    _startEvent(event: Event): void;
    _stopEvent(event: Event): void;
    disconnect(): Promise<void>;
}
