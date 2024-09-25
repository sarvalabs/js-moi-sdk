import { ErrorCode, ErrorUtils, decodeBase64, defineReadOnly, encodeToString } from "js-moi-utils";
import { w3cwebsocket as WsConn } from "websocket";
import * as errors from "./errors";
import { JsonRpcProvider } from "./jsonrpc-provider";
let nextReqId = 1;
/**
 * Enum defining the WebSocket events.
 */
export var WebSocketEvents;
(function (WebSocketEvents) {
    WebSocketEvents["TESSERACT"] = "tesseract";
    WebSocketEvents["ALL_TESSERACTS"] = "all_tesseracts";
    WebSocketEvents["PENDING_INTERACTIONS"] = "pending_interactions";
    WebSocketEvents["CONNECT"] = "connect";
    WebSocketEvents["RECONNECT"] = "reconnect";
    WebSocketEvents["CLOSE"] = "close";
    WebSocketEvents["DEBUG"] = "debug";
    WebSocketEvents["ERROR"] = "error";
    WebSocketEvents["LOGS"] = "logs";
})(WebSocketEvents || (WebSocketEvents = {}));
/**
 * WebSocketProvider class extends the JsonRpcProvider class and provides WebSocket-based
 * communication with the JSON-RPC endpoint.
 */
export class WebSocketProvider extends JsonRpcProvider {
    requestQueue;
    responseQueue;
    connection;
    wsConnOptions;
    reconnecting;
    reconnAttempts;
    subscriptions;
    subsIds;
    constructor(host, options) {
        if (/^ws(s)?:\/\//i.test(host)) {
            super(host);
            this.subsIds = {};
            this.wsConnOptions = {};
            this.wsConnOptions.host = host;
            this.wsConnOptions.timeout = options?.timeout || 1000 * 5;
            this.wsConnOptions.reconnectDelay = options?.reconnectDelay || undefined;
            this.wsConnOptions.reconnectOptions = Object.assign({
                auto: false,
                delay: 5000,
                maxAttempts: 5,
                onTimeout: false
            }, options?.reconnectOptions);
            this.wsConnOptions.headers = options?.headers || {};
            this.wsConnOptions.protocol = options?.protocol || undefined;
            this.wsConnOptions.clientConfig = options?.clientConfig || undefined;
            this.wsConnOptions.requestOptions = options?.requestOptions || undefined;
            this.wsConnOptions.origin = options?.origin || undefined;
            this.wsConnOptions.clientConfig = options?.clientConfig || undefined;
            this.connection = null;
            this.reconnAttempts = 0;
            this.requestQueue = new Map();
            this.responseQueue = new Map();
            this.subscriptions = new Map();
            this.connect();
            return;
        }
        ErrorUtils.throwError("Invalid websocket request url!", ErrorCode.INVALID_ARGUMENT);
    }
    /**
     * Establishes a WebSocket connection with the provided host.
     * Creates a new WebSocket connection instance and sets up event handlers.
     */
    connect = () => {
        this.connection = new WsConn(this.host, this.wsConnOptions.protocol, undefined, this.wsConnOptions.headers, this.wsConnOptions.requestOptions, this.wsConnOptions.clientConfig);
        this.addEventListener();
    };
    /**
     * Sets up event listeners for the WebSocket connection.
     */
    addEventListener = () => {
        this.connection.onopen = this.onConnect.bind(this);
        this.connection.onclose = this.onClose.bind(this);
        this.connection.onmessage = this.onMessage.bind(this);
        if (this.connection._client) {
            this.connection._client.removeAllListeners("connectFailed");
            this.connection._client.on("connectFailed", this.onConnectFailed.bind(this));
        }
    };
    /**
     * Removes event listeners from the WebSocket connection.
     */
    removeEventListener = () => {
        this.connection.onopen = null;
        this.connection.onclose = null;
        this.connection.onmessage = null;
    };
    /**
     * Initiates a reconnection to the WebSocket server.
     * If there are pending requests in the response queue, their callbacks are
     * invoked with a reconnection error.
     * If the maximum reconnection attempts have not been reached, it schedules
     * another reconnection attempt.
     * If the maximum reconnection attempts have been reached, it invokes the
     * error event and clears the request queue.
     */
    reconnect() {
        this.reconnecting = true;
        if (this.responseQueue.size > 0) {
            this.responseQueue.forEach((request, key) => {
                try {
                    this.responseQueue.delete(key);
                    request.callback(errors.PendingRequestsOnReconnectingError(), null);
                }
                catch (e) {
                    console.error("Error encountered in reconnect: ", e);
                }
            });
        }
        if (!this.wsConnOptions.reconnectOptions.maxAttempts ||
            this.reconnAttempts < this.wsConnOptions.reconnectOptions.maxAttempts) {
            setTimeout(() => {
                this.reconnAttempts++;
                this.removeEventListener();
                this.emit(WebSocketEvents.RECONNECT, this.reconnAttempts);
                this.connect();
            }, this.wsConnOptions.reconnectOptions.delay);
            return;
        }
        this.emit(WebSocketEvents.ERROR, errors.MaxAttemptsReachedOnReconnectingError());
        this.reconnecting = false;
        if (this.requestQueue.size > 0) {
            this.requestQueue.forEach((request, key) => {
                request.callback(errors.MaxAttemptsReachedOnReconnectingError(), null);
                this.requestQueue.delete(key);
            });
        }
    }
    /**
     * Event handler triggered when the WebSocket connection is successfully established.
     * Invokes pending requests in the request queue if any.
     */
    onConnect = () => {
        this.emit(WebSocketEvents.CONNECT, "Websocket connection established successfully!");
        this.reconnAttempts = 0;
        this.reconnecting = false;
        if (this.requestQueue.size > 0) {
            this.requestQueue.forEach((request, key) => {
                try {
                    this.sendRequest(key, request);
                }
                catch (error) {
                    request.callback(error, null);
                    this.requestQueue.delete(key);
                }
            });
        }
    };
    /**
     * Checks if the WebSocket connection has failed based on the close event.
     *
     * @param event The close event object.
     * @returns A boolean indicating whether the connection has failed.
     */
    isConnectionFailed = (event) => {
        return event.code === 1006 && event.reason === "connection failed";
    };
    /**
     * Method called when the WebSocket connection is closed.
     *
     * @param event - The close event.
     */
    onClose = (event) => {
        if (!this.isConnectionFailed(event)) {
            this.subsIds = {};
            this.subscriptions = new Map();
            this.emit(WebSocketEvents.CLOSE, event);
            if (this.wsConnOptions.reconnectOptions.auto &&
                (![1000, 1001].includes(event.code) || event.wasClean === false)) {
                this.reconnect();
                return;
            }
            if (this.requestQueue.size > 0) {
                this.requestQueue.forEach((request, key) => {
                    request.callback(errors.ConnectionNotOpenError(event), null);
                    this.requestQueue.delete(key);
                });
            }
            if (this.responseQueue.size > 0) {
                this.responseQueue.forEach((request, key) => {
                    request.callback(errors.InvalidConnection('on WS', event), null);
                    this.responseQueue.delete(key);
                });
            }
            this.removeEventListener();
            this.removeAllListeners();
        }
    };
    /**
     * Method called when a message is received through the WebSocket connection.
     *
     * @param event - The message event.
     */
    onMessage = (event) => {
        const data = event.data;
        const response = JSON.parse(data);
        if (response.id != null) {
            const id = response.id;
            const request = this.responseQueue.get(id);
            this.responseQueue.delete(id);
            if (response.result != undefined) {
                request.callback(null, response);
                this.emit(WebSocketEvents.DEBUG, {
                    action: "response",
                    request: JSON.parse(request.payload),
                    response: response.result,
                    provider: this
                });
            }
            else {
                // TODO: handle error
                let error = null;
                if (response.error) {
                    error = new Error(response.error.message || "unknown error");
                    defineReadOnly(error, "code", response.error.code || null);
                    defineReadOnly(error, "response", data);
                }
                else {
                    error = new Error("unknown error");
                }
                request.callback(error, null);
                this.emit(WebSocketEvents.ERROR, {
                    action: "response",
                    error: error,
                    request: JSON.parse(request.payload),
                    provider: this
                });
            }
        }
        else if (response.method === "moi.subscription") {
            const sub = this.subscriptions[response.params.subscription];
            if (sub) {
                sub.processFunc(response.params.result);
            }
        }
    };
    /**
     * Method called when the WebSocket connection fails to connect.
     *
     * @param event - The connect failed event.
     */
    onConnectFailed = (event) => {
        let connectFailedDescription = event.toString().split('\n')[0];
        if (connectFailedDescription) {
            event.description = connectFailedDescription;
        }
        event.code = 1006;
        event.reason = 'connection failed';
        if (this.wsConnOptions.reconnectOptions.auto && (![1000, 1001].includes(event.code) || event.wasClean === false)) {
            this.reconnect();
            return;
        }
        this.emit(WebSocketEvents.ERROR, event);
        if (this.requestQueue.size > 0) {
            this.requestQueue.forEach((request, key) => {
                request.callback(errors.ConnectionNotOpenError(event), null);
                this.requestQueue.delete(key);
            });
        }
        if (this.responseQueue.size > 0) {
            this.responseQueue.forEach((request, key) => {
                request.callback(errors.InvalidConnection('on WS', event), null);
                this.responseQueue.delete(key);
            });
        }
        //clean connection on our own
        if (this.connection._connection) {
            this.connection._connection.removeAllListeners();
        }
        this.connection._client.removeAllListeners();
        this.connection._readyState = 3; // set readyState to CLOSED
        this.emit(WebSocketEvents.CLOSE, event);
    };
    /**
     * Sends a request over the WebSocket connection.
     *
     * @param requestId - The ID of the request.
     * @param request - The request object.
     */
    sendRequest(requestId, request) {
        if (this.connection.readyState !== this.connection.OPEN) {
            this.requestQueue.delete(requestId);
            request.callback(errors.ConnectionNotOpenError(), null);
            return;
        }
        this.responseQueue.set(requestId, request);
        this.requestQueue.delete(requestId);
        try {
            this.connection.send(request.payload);
        }
        catch (error) {
            request.callback(error, null);
            this.responseQueue.delete(requestId);
        }
    }
    /**
     * Sends a request over the WebSocket connection and returns a Promise that
     * resolves with the response.
     *
     * @param method - The method of the request.
     * @param params - The parameters of the request.
     * @returns A Promise that resolves with the response or rejects with an error.
     */
    send(method, params) {
        return new Promise((resolve, reject) => {
            const callback = (error, result) => {
                if (error) {
                    return reject(error);
                }
                return resolve(result);
            };
            const requestId = nextReqId++;
            const payload = {
                method: method,
                params: params,
                id: requestId,
                jsonrpc: "2.0"
            };
            const request = {
                payload: JSON.stringify(payload),
                callback: callback
            };
            if (this.connection.readyState === this.connection.CONNECTING || this.reconnecting) {
                this.requestQueue.set(requestId, request);
                return;
            }
            this.sendRequest(requestId, request);
        });
    }
    /**
     * Subscribes to an event.
     *
     * @param tag - The tag associated with the subscription.
     * @param param - The parameters of the subscription.
     * @param processFunc - The function to process the subscription result.
     * @returns A Promise that resolves when the subscription is complete.
     */
    async _subscribe(tag, param, processFunc) {
        let subIdPromise = this.subsIds[tag];
        if (subIdPromise == null) {
            subIdPromise = Promise.all(param).then(async (param) => {
                const response = await this.send("moi.subscribe", param);
                return response.result;
            });
            this.subsIds[tag] = subIdPromise;
        }
        const subId = await subIdPromise;
        this.subscriptions[subId] = { tag, processFunc };
    }
    /**
     * Starts listening to an event.
     *
     * @param event - The event to start listening to.
     */
    _startEvent(event) {
        switch (event.type) {
            case WebSocketEvents.TESSERACT:
                const params = {
                    address: event.address
                };
                this._subscribe(event.tag, ["newAccountTesseracts", params], (result) => {
                    this.emit(event.address, result);
                });
                break;
            case WebSocketEvents.ALL_TESSERACTS:
                this._subscribe("all_tesseracts", ["newTesseracts"], (result) => {
                    this.emit(WebSocketEvents.ALL_TESSERACTS, result);
                });
                break;
            case WebSocketEvents.PENDING_INTERACTIONS:
                this._subscribe("pending_interactions", ["newPendingInteractions"], (result) => {
                    this.emit(WebSocketEvents.PENDING_INTERACTIONS, result);
                });
                break;
            case WebSocketEvents.LOGS:
                this._subscribe("logs", ["newLogs", event.params], (result) => {
                    this.emit(WebSocketEvents.LOGS, {
                        ...result,
                        data: encodeToString(decodeBase64(result.data)) // FIXME: remove this once PR (https://github.com/sarvalabs/go-moi/pull/1023) is merged
                    });
                });
                break;
            case WebSocketEvents.CONNECT:
            case WebSocketEvents.RECONNECT:
            case WebSocketEvents.CLOSE:
            case WebSocketEvents.DEBUG:
            case WebSocketEvents.ERROR:
                break;
            default:
                console.log("unhandled:", event);
                break;
        }
    }
    /**
     * Stops listening to an event.
     *
     * @param event - The event to stop listening to.
     */
    _stopEvent(event) {
        let tag = event.tag;
        if (this.listenerCount(event.event)) {
            // There are remaining event listeners
            return;
        }
        const subId = this.subsIds[tag];
        if (!subId) {
            return;
        }
        delete this.subsIds[tag];
        subId.then((subId) => {
            if (!this.subscriptions[subId]) {
                return;
            }
            delete this.subscriptions[subId];
            this.send("moi.unsubscribe", [subId]);
        });
    }
    /**
     * Disconnects the WebSocket connection.
     *
     * @returns A Promise that resolves when the disconnect operation is complete.
     */
    async disconnect() {
        // Wait until we have connected before trying to disconnect
        if (this.connection.readyState === this.connection.CONNECTING) {
            await (new Promise((resolve) => {
                this.connection.onopen = () => {
                    resolve(true);
                };
                this.connection.onerror = () => {
                    resolve(false);
                };
            }));
        }
        // Hangup
        // See: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
        this.connection.close(1000);
    }
}
//# sourceMappingURL=websocket-provider.js.map