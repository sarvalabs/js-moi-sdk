"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketProvider = exports.WebsocketEvent = void 0;
const ws_transport_1 = require("../transport/ws-transport");
const provider_1 = require("./provider");
var WebsocketEvent;
(function (WebsocketEvent) {
    WebsocketEvent["Error"] = "error";
    WebsocketEvent["Open"] = "open";
    WebsocketEvent["Close"] = "close";
    WebsocketEvent["Reconnect"] = "reconnect";
    WebsocketEvent["Message"] = "message";
    WebsocketEvent["NewPendingInteractions"] = "newPendingInteractions";
    WebsocketEvent["NewTesseracts"] = "newTesseracts";
    WebsocketEvent["NewTesseractsByAccount"] = "newTesseractsByAccount";
    WebsocketEvent["NewLogs"] = "newLogs";
})(WebsocketEvent || (exports.WebsocketEvent = WebsocketEvent = {}));
class WebsocketProvider extends provider_1.Provider {
    static events = {
        client: new Set(["error", "open", "close", "reconnect"]),
        internal: new Set(["message"]),
        network: new Set(["newPendingInteractions", "newTesseracts", "newTesseractsByAccount", "newLogs"]),
    };
    subscriptions = new Map();
    constructor(address, options) {
        super(new ws_transport_1.WebsocketTransport(address, options));
        if (this.transport instanceof ws_transport_1.WebsocketTransport) {
            for (const event of WebsocketProvider.events.client) {
                this.transport.on(event, (...args) => this.emit(event, ...args));
            }
        }
    }
    getSubscriptions() {
        return Array.from(Iterator.from(this.subscriptions).map(([id, event]) => ({ id, event })));
    }
    close() {
        if (this.transport instanceof ws_transport_1.WebsocketTransport) {
            this.transport.close();
        }
    }
    async handleOnNetworkEventSubscription(type, event, listener) {
        const params = typeof event === "object" ? event.params ?? [] : [];
        const eventName = WebsocketProvider.getEventName(event);
        const response = await this.request("moi.subscribe", [eventName, ...params]);
        const id = this.processJsonRpcResponse(response);
        const transport = this.transport;
        super[type](eventName, listener);
        this.subscriptions.set(id, event);
        transport.on("message", (message) => {
            const data = JSON.parse(message);
            const isValidMessage = WebsocketProvider.isWebsocketEmittedResponse(data) && data.params.subscription === id;
            if (!isValidMessage) {
                return;
            }
            super.emit(eventName, data.params.result);
        });
    }
    on(event, listener) {
        return this.subscribeToEvent("on", event, listener);
    }
    once(eventName, listener) {
        return this.subscribeToEvent("once", eventName, listener);
    }
    subscribeToEvent(type, event, listener) {
        const eventName = WebsocketProvider.getEventName(event);
        if (WebsocketProvider.events.network.has(eventName)) {
            void this.handleOnNetworkEventSubscription(type, event, listener);
        }
        else {
            super[type](eventName, listener);
        }
        return this;
    }
    static isWebsocketEmittedResponse(response) {
        return "params" in response && "subscription" in response.params && "result" in response.params;
    }
    static getEventName(event) {
        return typeof event === "object" ? event.event : event;
    }
}
exports.WebsocketProvider = WebsocketProvider;
//# sourceMappingURL=websocket-provider.js.map