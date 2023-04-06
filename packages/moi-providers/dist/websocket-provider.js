"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketProvider = void 0;
const websocket_1 = require("websocket");
const jsonrpc_provider_1 = require("./jsonrpc-provider");
class WebSocketProvider extends jsonrpc_provider_1.JsonRpcProvider {
    requestQueue;
    responseQueue;
    connection;
    isConnected;
    wsConnOptions;
    reconnecting;
    reconnAttempts;
    subscriptions;
    subsIds;
    constructor(host, options) {
        if (/^ws(s)?:\/\//i.test(host)) {
            super(host);
            this.subsIds = {};
            this.isConnected = false;
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
        console.log("Connection Error");
        // this.reject(new Error("Failed to establish connection"))
    };
    onConnect = () => {
        // this.eventStream.emit("connect");
        this.reconnAttempts = 0;
        this.reconnecting = false;
        this.isConnected = true;
        if (this.requestQueue.size > 0) {
            this.requestQueue.forEach((request, key) => {
                try {
                    this.connection.send(request.payload);
                }
                catch (error) {
                    request.callback(error, null);
                    this.requestQueue.delete(key);
                }
            });
        }
        console.log("Connection established successfully");
        // this.resolve("Connection established successfully")
    };
    onClose = (event) => {
        if (this.wsConnOptions.reconnectOptions.auto && (![1000, 1001].includes(event.code) || event.wasClean === false)) {
            this.reconnect();
            return;
        }
        // this.eventStream.emit("close", event)
        if (this.requestQueue.size > 0) {
            this.requestQueue.forEach(function (request, key) {
                // request.callBack(Errors.ConnectionNotOpenError(event));
                this.requestQueue.delete(key);
            });
        }
        if (this.responseQueue.size > 0) {
            this.responseQueue.forEach(function (request, key) {
                // request.callBack(Errors.InvalidConnection('on WS', event));
                this.responseQueue.delete(key);
            });
        }
        this.removeEventListener();
        // this.eventStream.removeAllListeners();
    };
    onMessage = (event) => {
        const data = event.data;
        const response = JSON.parse(data);
        if (response.id != null) {
            const id = String(response.id);
            const request = this.requestQueue.get(id);
            this.requestQueue.delete(id);
            if (response.result != undefined) {
                request.callback(null, response.result);
            }
            else {
                // TODO: handle error
            }
        }
        else if (response.method === "moi.subscription") {
            const sub = this.subscriptions[response.params.subscription];
            if (sub) {
                //this.emit.apply(this,                  );
                sub.processFunc(response.params.result);
            }
        }
    };
    send(method, params) {
        // var id = payload.id;
        // var request = {payload: payload, callBack: callback};
        // if (Array.isArray(payload)) {
        //     id = payload[0].id;
        // }
        // if (this.connection.readyState === this.connection.CONNECTING) {
        //     this.requestQueue.set(id, request);
        //     return;
        // }
        // if (this.connection.readyState !== this.connection.OPEN) {
        //     this.requestQueue.delete(id);
        //     // this.eventStream.emit("error", Errors.ConnectionNotOpenError());
        //     // request.callBack(Errors.ConnectionNotOpenError());
        //     return;
        // }
        // this.responseQueue.set(id, request);
        // this.requestQueue.delete(id);
        // try {
        //     this.connection.send(JSON.stringify(request.payload));
        // } catch (error) {
        //     request.callBack(error);
        //     this.responseQueue.delete(id);
        // }
        return new Promise((resolve, reject) => {
            function callback(error, result) {
                if (error) {
                    return reject(error);
                }
                return resolve(result);
            }
            const payload = JSON.stringify({
                method: method,
                params: params,
                id: 1,
                jsonrpc: "2.0"
            });
            const request = {
                payload: payload,
                callback: callback
            };
            this.requestQueue.set("1", request);
            if (this.isConnected) {
                try {
                    this.connection.send(request.payload);
                    request.callback(null, {});
                }
                catch (error) {
                    request.callback(error, null);
                }
            }
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
                this._subscribe("tesseract", ["newTesseracts", params], (result) => {
                    this.emit("tesseract", result);
                });
                break;
            case "all_tesseracts":
                this._subscribe("all_tesseracts", ["newTesseracts"], (result) => {
                    this.emit("all_tesseracts", result);
                });
                break;
            default:
                console.log("unhandled:", event);
                break;
        }
    }
    _stopEvent(event) {
        let tag = event.tag;
        if (event.type === "tx") {
            // There are remaining transaction event listeners
            if (this._events.filter((e) => (e.type === "tx")).length) {
                return;
            }
            tag = "tx";
        }
        else if (this.listenerCount(event.event)) {
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
        if (this.connection.readyState === websocket_1.w3cwebsocket.CONNECTING) {
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
