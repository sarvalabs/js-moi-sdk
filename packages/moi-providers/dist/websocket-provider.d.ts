import { WebsocketProviderOptions } from "../types/provider";
import { JsonRpcProvider } from "./jsonrpc-provider";
import Event from "./event";
export declare enum WebSocketEvents {
    TESSERACT = "tesseract",
    ALL_TESSERACTS = "all_tesseracts",
    CONNECT = "connect",
    RECONNECT = "reconnect",
    CLOSE = "close",
    DEBUG = "debug",
    ERROR = "error"
}
export declare class WebSocketProvider extends JsonRpcProvider {
    private requestQueue;
    private responseQueue;
    private connection;
    private wsConnOptions;
    private reconnecting;
    private reconnAttempts;
    private subscriptions;
    private subsIds;
    constructor(host: string, options?: WebsocketProviderOptions);
    private connect;
    private addEventListener;
    private removeEventListener;
    private reconnect;
    private onConnect;
    private isConnectionFailed;
    private onClose;
    private onMessage;
    private onConnectFailed;
    private sendRequest;
    send(method: string, params: any[]): Promise<any>;
    _subscribe(tag: string, param: Array<any>, processFunc: (result: any) => void): Promise<void>;
    _startEvent(event: Event): void;
    _stopEvent(event: Event): void;
    disconnect(): Promise<void>;
}
