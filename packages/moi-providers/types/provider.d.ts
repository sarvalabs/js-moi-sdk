export interface WebsocketProviderOptions {
    host?: string;
    timeout?: number;
    reconnect?: any;
    reconnectDelay?: number;
    reconnectOptions?: any;
    headers?: any;
    protocol?: string;
    clientConfig?: object;
    requestOptions?: any;
    origin?: string;
}