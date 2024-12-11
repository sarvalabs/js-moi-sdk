export interface WsReconnectOptions {
    auto?: boolean;
    delay?: number;
    maxAttempts?: number;
    onTimeout?: boolean;
}

export interface WebsocketProviderOptions {
    host?: string;
    timeout?: number;
    reconnect?: any;
    reconnectDelay?: number;
    reconnectOptions?: WsReconnectOptions;
    headers?: any;
    protocol?: string;
    clientConfig?: object;
    requestOptions?: any;
    origin?: string;
}