import { Provider } from "./provider";
import { HttpTransport } from "./transport/http-transport";
export class JsonRpcProvider extends Provider {
    constructor(host, option) {
        if (!JsonRpcProvider.isValidHost(host)) {
            throw new Error("Invalid host");
        }
        super(new HttpTransport(host, option));
    }
    static isValidHost(host) {
        try {
            const url = new URL(host);
            return url.protocol === "http:" || url.protocol === "https:";
        }
        catch (error) {
            return false;
        }
    }
}
//# sourceMappingURL=json-rpc-provider.js.map