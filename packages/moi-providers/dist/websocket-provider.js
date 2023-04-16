"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketProvider = void 0;
const websocket_1 = require("websocket");
const jsonrpc_provider_1 = require("./jsonrpc-provider");
const errors = __importStar(require("./errors"));
let nextReqId = 1;
class WebSocketProvider extends jsonrpc_provider_1.JsonRpcProvider {
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
                maxAttempts: false,
                onTimeout: false
            }, options?.reconnect);
            this.wsConnOptions.headers = options?.headers || {};
            this.wsConnOptions.protocol = options?.protocol || undefined;
            this.wsConnOptions.clientConfig = options?.clientConfig || undefined;
            this.wsConnOptions.requestOptions = options?.requestOptions || undefined;
            this.wsConnOptions.origin = options?.origin || undefined;
            this.wsConnOptions.clientConfig = options?.clientConfig || undefined;
            this.connection = null;
            this.requestQueue = new Map();
            this.responseQueue = new Map();
            this.subscriptions = new Map();
            this.connect();
            return;
        }
        throw new Error("Invalid websocket request url!");
    }
    connect = () => {
        this.connection = new websocket_1.w3cwebsocket(this.host, this.wsConnOptions.protocol, undefined, this.wsConnOptions.headers, this.wsConnOptions.requestOptions, this.wsConnOptions.clientConfig);
        this.addEventListener();
    };
    addEventListener = () => {
        this.connection.onerror = this.onError.bind(this);
        this.connection.onopen = this.onConnect.bind(this);
        this.connection.onclose = this.onClose.bind(this);
        this.connection.onmessage = this.onMessage.bind(this);
    };
    removeEventListener = () => {
        this.connection.onerror = null;
        this.connection.onopen = null;
        this.connection.onclose = null;
        this.connection.onmessage = null;
    };
    reconnect = () => {
        console.log("Trying to reconnect...!");
    };
    onError = () => {
        this.emit("error", "Failed to establish connection.");
    };
    onConnect = () => {
        this.emit("connect", "Websocket connection established successfully!");
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
    isConnectionFailed = (event) => {
        return event.code === 1006 && event.reason === "connection failed";
    };
    onClose = (event) => {
        if (!this.isConnectionFailed(event)) {
            if (this.wsConnOptions.reconnectOptions.auto &&
                (![1000, 1001].includes(event.code) || event.wasClean === false)) {
                this.reconnect();
                return;
            }
            this.emit("close", event);
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
    };
    onMessage = (event) => {
        const data = event.data;
        const response = JSON.parse(data);
        if (response.id != null) {
            const id = response.id;
            const request = this.responseQueue.get(id);
            this.responseQueue.delete(id);
            if (response.result != undefined) {
                request.callback(null, response.result);
                this.emit("debug", {
                    action: "response",
                    request: JSON.parse(request.payload),
                    response: response.result,
                    provider: this
                });
            }
            else {
                // TODO: handle error
            }
        }
        else if (response.method === "moi.subscription") {
            const sub = this.subscriptions[response.params.subscription];
            if (sub) {
                sub.processFunc(response.params.result);
            }
        }
    };
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
    send(method, params) {
        return new Promise((resolve, reject) => {
            function callback(error, result) {
                if (error) {
                    return reject(error);
                }
                return resolve(result);
            }
            const requestId = nextReqId + 1;
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
    async _subscribe(tag, param, processFunc) {
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
    _startEvent(event) {
        switch (event.type) {
            case "tesseract":
                const params = {
                    address: event.address
                };
                this._subscribe(event.tag, ["newAccountTesseracts", params], (result) => {
                    this.emit(event.address, result);
                });
                break;
            case "all_tesseracts":
                this._subscribe("all_tesseracts", ["newTesseracts"], (result) => {
                    this.emit("all_tesseracts", result);
                });
                break;
            case "connect":
            case "close":
            case "debug":
            case "error":
                break;
            default:
                console.log("unhandled:", event);
                break;
        }
    }
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
    async disconnect() {
        // Wait until we have connected before trying to disconnect
        if (this.connection.readyState === this.connection.CONNECTING) {
            await (new Promise((resolve) => {
                this.connection.onopen = function () {
                    resolve(true);
                };
                this.connection.onerror = function () {
                    resolve(false);
                };
            }));
        }
        // Hangup
        // See: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
        this.connection.close(1000);
    }
}
exports.WebSocketProvider = WebSocketProvider;
