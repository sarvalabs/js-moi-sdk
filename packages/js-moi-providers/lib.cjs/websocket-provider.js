"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketProvider = void 0;
const provider_1 = require("./provider");
const ws_transport_1 = require("./transport/ws-transport");
class WebsocketProvider extends provider_1.Provider {
    constructor(address, options) {
        super(new ws_transport_1.WebsocketTransport(address, options));
        const events = ["error", "open", "close", "reconnect"];
        if (this.transport instanceof ws_transport_1.WebsocketTransport) {
            for (const event of events) {
                this.transport.on(event, (...args) => this.emit(event, ...args));
            }
        }
    }
    close() {
        if (this.transport instanceof ws_transport_1.WebsocketTransport) {
            this.transport.close();
        }
    }
}
exports.WebsocketProvider = WebsocketProvider;
//# sourceMappingURL=websocket-provider.js.map