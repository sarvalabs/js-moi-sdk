import { Provider } from "./provider";
import { WebsocketTransport } from "./transport/ws-transport";
export class WebsocketProvider extends Provider {
    constructor(address, options) {
        const transport = new WebsocketTransport(address, options);
        super(transport);
        const events = ["error", "open", "close", "reconnect"];
        for (const event of events) {
            transport.on(event, (...args) => this.emit(event, ...args));
        }
    }
}
//# sourceMappingURL=websocket-provider.js.map