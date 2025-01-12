import { HttpTransport } from "../transport/http-transport";
import { JsonRpcProvider } from "./json-rpc-provider";
export class HttpProvider extends JsonRpcProvider {
    constructor(host, option) {
        if (!HttpProvider.isValidHost(host)) {
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
//# sourceMappingURL=http-provider.js.map