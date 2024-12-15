import { Provider } from "./provider";
import { WebsocketTransport, type WebsocketTransportOptions } from "./transport/ws-transport";

export class WebsocketProvider extends Provider {
    constructor(address: string, options?: WebsocketTransportOptions) {
        const transport = new WebsocketTransport(address, options);
        super(transport);

        const events = ["error", "open", "close", "reconnect"];

        for (const event of events) {
            transport.on(event, (...args) => this.emit(event, ...args));
        }
    }
}
