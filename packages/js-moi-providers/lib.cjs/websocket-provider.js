"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketProvider = void 0;
const provider_1 = require("./provider");
const ws_transport_1 = require("./transport/ws-transport");
class WebsocketProvider extends provider_1.Provider {
    constructor(address, options) {
        const transport = new ws_transport_1.WebsocketTransport(address, options);
        super(transport);
        const events = ["error", "open", "close", "reconnect"];
        for (const event of events) {
            transport.on(event, (...args) => this.emit(event, ...args));
        }
    }
}
exports.WebsocketProvider = WebsocketProvider;
//# sourceMappingURL=websocket-provider.js.map