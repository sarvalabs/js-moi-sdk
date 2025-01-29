import { WebsocketTransport } from "../transport/ws-transport";
import { JsonRpcProvider } from "./json-rpc-provider";
export var WebsocketEvent;
(function (WebsocketEvent) {
    WebsocketEvent["Error"] = "error";
    WebsocketEvent["Open"] = "open";
    WebsocketEvent["Debug"] = "debug";
    WebsocketEvent["Close"] = "close";
    WebsocketEvent["Reconnect"] = "reconnect";
    WebsocketEvent["Message"] = "message";
    WebsocketEvent["NewPendingInteractions"] = "newPendingInteractions";
    WebsocketEvent["NewTesseracts"] = "newTesseracts";
    WebsocketEvent["NewTesseractsByAccount"] = "newTesseractsByAccount";
    WebsocketEvent["NewLogs"] = "newLogs";
})(WebsocketEvent || (WebsocketEvent = {}));
export class WebsocketProvider extends JsonRpcProvider {
    static events = {
        client: new Set(["error", "open", "close", "reconnect", "debug"]),
        internal: new Set(["message"]),
        network: new Set(["newPendingInteractions", "newTesseracts", "newTesseractsByAccount", "newLogs"]),
    };
    subscriptions = new Map();
    constructor(address, options) {
        super(new WebsocketTransport(address, options));
        if (this.transport instanceof WebsocketTransport) {
            for (const event of WebsocketProvider.events.client) {
                this.transport.on(event, (...args) => this.emit(event, ...args));
            }
        }
    }
    getSubscriptions() {
        return Array.from(Iterator.from(this.subscriptions).map(([id, event]) => ({ id, event })));
    }
    close() {
        if (this.transport instanceof WebsocketTransport) {
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
            this.handleOnNetworkEventSubscription(type, event, listener);
            return this;
        }
        super[type](eventName, listener);
        return this;
    }
    static isWebsocketEmittedResponse(response) {
        return "params" in response && "subscription" in response.params && "result" in response.params;
    }
    static getEventName(event) {
        return typeof event === "object" ? event.event : event;
    }
}
//# sourceMappingURL=websocket-provider.js.map