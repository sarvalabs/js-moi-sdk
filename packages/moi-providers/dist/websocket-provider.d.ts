import { JsonRpcProvider } from "./jsonrpc-provider";
import Event from "./event";
import { WebsocketProviderOptions } from "../types/provider";
/**
 * WebSocketEvents
 *
 * Enum defining the WebSocket events.
 */
export declare enum WebSocketEvents {
    TESSERACT = "tesseract",
    ALL_TESSERACTS = "all_tesseracts",
    CONNECT = "connect",
    RECONNECT = "reconnect",
    CLOSE = "close",
    DEBUG = "debug",
    ERROR = "error"
}
/**
 * WebSocketProvider
 *
 * WebSocketProvider class extends the JsonRpcProvider class and provides WebSocket-based communication with the JSON-RPC endpoint.
 */
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
    /**
     * connect
     *
     * Establishes a WebSocket connection with the provided host.
     * Creates a new WebSocket connection instance and sets up event handlers.
     */
    private connect;
    /**
     * addEventListener
     *
     * Sets up event listeners for the WebSocket connection.
     */
    private addEventListener;
    /**
     * removeEventListener
     *
     * Removes event listeners from the WebSocket connection.
     */
    private removeEventListener;
    /**
     * reconnect
     *
     * Initiates a reconnection to the WebSocket server.
     * If there are pending requests in the response queue, their callbacks are
     * invoked with a reconnection error.
     * If the maximum reconnection attempts have not been reached, it schedules
     * another reconnection attempt.
     * If the maximum reconnection attempts have been reached, it invokes the
     * error event and clears the request queue.
     */
    private reconnect;
    /**
     * onConnect
     *
     * Event handler triggered when the WebSocket connection is successfully established.
     * Invokes pending requests in the request queue if any.
     */
    private onConnect;
    /**
     * isConnectionFailed
     *
     * Checks if the WebSocket connection has failed based on the close event.
     * @param event The close event object.
     * @returns A boolean indicating whether the connection has failed.
     */
    private isConnectionFailed;
    /**
     * Method called when the WebSocket connection is closed.
     * @param event - The close event.
     */
    private onClose;
    /**
     * Method called when a message is received through the WebSocket connection.
     * @param event - The message event.
     */
    private onMessage;
    /**
     * Method called when the WebSocket connection fails to connect.
     * @param event - The connect failed event.
     */
    private onConnectFailed;
    /**
     * sendRequest
     *
     * Sends a request over the WebSocket connection.
     * @param requestId - The ID of the request.
     * @param request - The request object.
     */
    private sendRequest;
    /**
     * send
     *
     * Sends a request over the WebSocket connection and returns a Promise that
     * resolves with the response.
     * @param method - The method of the request.
     * @param params - The parameters of the request.
     * @returns A Promise that resolves with the response or rejects with an error.
     */
    protected send(method: string, params: any[]): Promise<any>;
    /**
     * _subscribe
     *
     * Subscribes to an event.
     * @param tag - The tag associated with the subscription.
     * @param param - The parameters of the subscription.
     * @param processFunc - The function to process the subscription result.
     * @returns A Promise that resolves when the subscription is complete.
     */
    protected _subscribe(tag: string, param: Array<any>, processFunc: (result: any) => void): Promise<void>;
    /**
     * _startEvent
     *
     * Starts listening to an event.
     * @param event - The event to start listening to.
     */
    protected _startEvent(event: Event): void;
    /**
     * Stops listening to an event.
     * @param event - The event to stop listening to.
     */
    protected _stopEvent(event: Event): void;
    /**
     * Disconnects the WebSocket connection.
     * @returns A Promise that resolves when the disconnect operation is complete.
     */
    disconnect(): Promise<void>;
}
