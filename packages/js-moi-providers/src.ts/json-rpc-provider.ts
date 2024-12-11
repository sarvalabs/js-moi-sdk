import { Provider } from "./provider";
import { HttpTransport, type HttpTransportOption } from "./transport/http-transport";

interface JsonRpcProviderOption extends HttpTransportOption {}

export class JsonRpcProvider extends Provider {
    constructor(host: string, option?: JsonRpcProviderOption) {
        super(new HttpTransport(host, option));
    }
}
