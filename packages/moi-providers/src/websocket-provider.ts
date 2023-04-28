import { WebsocketProviderOptions } from "../types/provider";
import { w3cwebsocket as WsConn } from "websocket";
import {JsonRpcProvider} from "./jsonrpc-provider";
import Event from "./event";
import { TesseractParams, Subscription } from "../types/websocket";
import { InflightRequest } from "../types/websocket";
import * as errors from "./errors";
import { defineReadOnly } from "moi-utils";

let nextReqId = 1;

export enum WebSocketEvents {
    TESSERACT = 'tesseract',
    ALL_TESSERACTS = 'all_tesseracts',
    CONNECT = "connect",
    RECONNECT = 'reconnect',
    CLOSE = 'close',
    DEBUG = 'debug',
    ERROR = 'error',
}

export class WebSocketProvider extends JsonRpcProvider {
    private requestQueue: Map<number, InflightRequest>;
    private responseQueue: Map<number, InflightRequest>;
    private connection: any;
    private wsConnOptions: WebsocketProviderOptions;
    private reconnecting: boolean;
    private reconnAttempts: number;
    private subscriptions: Map<string, Subscription>;
    private subsIds: { [ tag: string ]: Promise<string> };

    constructor(host: string, options?: WebsocketProviderOptions) {
        if(/^ws(s)?:\/\//i.test(host)) {
            super(host)
            this.subsIds = {}
            this.wsConnOptions = {}
            this.wsConnOptions.host = host
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
            this.requestQueue = new Map()
            this.responseQueue = new Map()
            this.subscriptions = new Map()
    
            this.connect()

            return;
        }

        throw new Error("Invalid websocket request url!")
    }

    private connect = () => {
        this.connection = new WsConn(
            this.host, 
            this.wsConnOptions.protocol, 
            undefined,
            this.wsConnOptions.headers, 
            this.wsConnOptions.requestOptions, 
            this.wsConnOptions.clientConfig
        );

        this.addEventListener();
    }

    private addEventListener = () => {
        this.connection.onopen = this.onConnect.bind(this)
        this.connection.onclose = this.onClose.bind(this)
        this.connection.onmessage = this.onMessage.bind(this)

        if(this.connection._client) {
            this.connection._client.removeAllListeners("connectFailed")

            this.connection._client.on("connectFailed", this.onConnectFailed.bind(this))
        }
    }

    private removeEventListener = () => {
        this.connection.onopen = null;
        this.connection.onclose = null;
        this.connection.onmessage = null;
    }

    private reconnect(): void {
        this.reconnecting = true;
    
        if (this.responseQueue.size > 0) {
            this.responseQueue.forEach(function (request, key) {
                try{
                    this.responseQueue.delete(key);
                    request.callback(errors.PendingRequestsOnReconnectingError(), null)
                } catch (e) {
                    console.error("Error encountered in reconnect: ", e)
                }
            });
        }
    
        if (
            !this.wsConnOptions.reconnectOptions.maxAttempts ||
            this.reconnAttempts < this.wsConnOptions.reconnectOptions.maxAttempts
        ) {
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
            this.requestQueue.forEach(function (request, key) {
                request.callback(errors.MaxAttemptsReachedOnReconnectingError(), null);
                this.requestQueue.delete(key);
            });
        }
    }

    private onConnect = () => {
        this.emit(WebSocketEvents.CONNECT, "Websocket connection established successfully!");
        this.reconnAttempts = 0;
        this.reconnecting = false;

        if(this.requestQueue.size > 0) {
            this.requestQueue.forEach((request: any, key) => {
                try {
                    this.sendRequest(key, request);
                } catch (error) {
                    request.callback(error, null);
                    this.requestQueue.delete(key);
                }
            })
        }
    }

    private isConnectionFailed = (event) => {
        return event.code === 1006 && event.reason === "connection failed";
    }

    private onClose = (event) => {
        if(!this.isConnectionFailed(event)) {
            if(this.wsConnOptions.reconnectOptions.auto && 
            (![1000, 1001].includes(event.code) || event.wasClean === false)) {
                this.reconnect();
    
                return;
            }
    
            this.emit(WebSocketEvents.CLOSE, event)
    
            if (this.requestQueue.size > 0) {
                this.requestQueue.forEach(function (request, key) {
                    request.callback(errors.ConnectionNotOpenError(event), null);
                    this.requestQueue.delete(key);
                });
            }
        
            if (this.responseQueue.size > 0) {
                this.responseQueue.forEach(function (request, key) {
                    request.callback(errors.InvalidConnection('on WS', event), null);
                    this.responseQueue.delete(key);
                });
            }
    
            this.removeEventListener();
            this.removeAllListeners();
        }
    }

    private onMessage = (event: { data: string }) => {
        const data:any = event.data;
        const response = JSON.parse(data);

        if(response.id != null) {
            const id = response.id
            const request = this.responseQueue.get(id)
            this.responseQueue.delete(id);

            if(response.result != undefined) {
                request.callback(null, response.result);

                this.emit(WebSocketEvents.DEBUG, {
                    action: "response",
                    request: JSON.parse(request.payload),
                    response: response.result,
                    provider: this
                });
            } else {
                // TODO: handle error
                let error: Error = null;
                if (response.error) {
                    error = new Error(response.error.message || "unknown error");
                    defineReadOnly(<any>error, "code", response.error.code || null);
                    defineReadOnly(<any>error, "response", data);
                } else {
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
        } else if(response.method === "moi.subscription") {
            const sub = this.subscriptions[response.params.subscription];
            if (sub) {
                sub.processFunc(response.params.result)
            }
        }
    }

    private onConnectFailed = (event): void => {
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
            this.requestQueue.forEach(function (request, key) {
                request.callback(errors.ConnectionNotOpenError(event), null);
                this.requestQueue.delete(key);
            });
        }
    
        if (this.responseQueue.size > 0) {
            this.responseQueue.forEach(function (request, key) {
                request.callback(errors.InvalidConnection('on WS', event), null);
                this.responseQueue.delete(key);
            });
        }
    
        //clean connection on our own
        if(this.connection._connection){
            this.connection._connection.removeAllListeners();
        }
        this.connection._client.removeAllListeners();
        this.connection._readyState = 3; // set readyState to CLOSED
    
        this.emit(WebSocketEvents.CLOSE, event);
    }

    private sendRequest(requestId: number, request: InflightRequest): void {
        if (this.connection.readyState !== this.connection.OPEN) {
            this.requestQueue.delete(requestId);
    
            request.callback(errors.ConnectionNotOpenError(), null);
    
            return;
        }

        this.responseQueue.set(requestId, request);
        this.requestQueue.delete(requestId);

        try {
            this.connection.send(request.payload);
        } catch (error) {
            request.callback(error, null);
            this.responseQueue.delete(requestId);
        }
    }

    public send(method: string, params: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            function callback(error: Error, result: any) {
                if (error) { return reject(error); }
                return resolve(result);
            }

            const requestId = nextReqId++

            const payload = {
                method: method,
                params: params,
                id: requestId,
                jsonrpc: "2.0"
            };

            const request: InflightRequest = {
                payload: JSON.stringify(payload), 
                callback: callback
            };

            if (this.connection.readyState === this.connection.CONNECTING || this.reconnecting) {
                this.requestQueue.set(requestId, request);
        
                return;
            }

            this.sendRequest(requestId, request)
        })
    }

    public async _subscribe(tag: string, param: Array<any>, processFunc: (result: any) => void): Promise<void> {
        let subIdPromise = this.subsIds[tag];
        if (subIdPromise == null) {
            subIdPromise = Promise.all(param).then((param) => {
                return this.send("moi.subscribe", param);
            });
            this.subsIds[tag] = subIdPromise;
        }
        const subId = await subIdPromise;
        this.subscriptions[subId] = { tag, processFunc };
    }

    public _startEvent(event: Event): void {
        switch (event.type) {
            case "tesseract":
                const params: TesseractParams = {
                    address: event.address
                }
                this._subscribe(event.tag, [ "newAccountTesseracts", params ], (result: any) => {
                    this.emit(event.address, result);
                });
                break;

            case "all_tesseracts":
                this._subscribe("all_tesseracts", [ "newTesseracts" ], (result: any) => {
                    this.emit(WebSocketEvents.ALL_TESSERACTS, result);
                });
                break;
            
            case "connect":

            case "reconnect":
            
            case "close":

            case "debug":

            case "error":
                break;

            default:
                console.log("unhandled:", event);
                break;
        }
    }

    public _stopEvent(event: Event): void {
        let tag = event.tag;

        if (this.listenerCount(event.event)) {
            // There are remaining event listeners
            return;
        }

        const subId = this.subsIds[tag];
        if (!subId) { return; }

       delete this.subsIds[tag];
       subId.then((subId) => {
            if (!this.subscriptions[subId]) { return; }
            delete this.subscriptions[subId];
            this.send("moi.unsubscribe", [ subId ]);
        });
    }

    public async disconnect(): Promise<void> {
        // Wait until we have connected before trying to disconnect
        if (this.connection.readyState === this.connection.CONNECTING) {
            await (new Promise((resolve) => {
                this.connection.onopen = function() {
                    resolve(true);
                };

                this.connection.onerror = function() {
                    resolve(false);
                };
            }));
        }

        // Hangup
        // See: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
        this.connection.close(1000);
    }
}
