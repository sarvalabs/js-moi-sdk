import { Provider } from "./provider";
import { WebsocketTransport, type WebsocketTransportOptions } from "./transport/ws-transport";

export class WebsocketProvider extends Provider {
    constructor(address: string, options?: WebsocketTransportOptions) {
        super(new WebsocketTransport(address, options));
        const events = ["error", "open", "close", "reconnect"];

        if (this.transport instanceof WebsocketTransport) {
            for (const event of events) {
                this.transport.on(event, (...args) => this.emit(event, ...args));
            }
        }
    }

    close(): void {
        if (this.transport instanceof WebsocketTransport) {
            this.transport.close();
        }
    }
}
