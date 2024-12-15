import { Provider } from "./provider";
import { WebsocketTransport } from "./transport/ws-transport";
export class WebsocketProvider extends Provider {
    constructor(address, options) {
        super(new WebsocketTransport(address, options));
        const events = ["error", "open", "close", "reconnect"];
        if (this.transport instanceof WebsocketTransport) {
            for (const event of events) {
                this.transport.on(event, (...args) => this.emit(event, ...args));
            }
        }
    }
    close() {
        if (this.transport instanceof WebsocketTransport) {
            this.transport.close();
        }
    }
}
//# sourceMappingURL=websocket-provider.js.map