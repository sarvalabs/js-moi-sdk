import { HttpTransport } from "../transport/http-transport";
import { JsonRpcProvider } from "./json-rpc-provider";
export class HttpProvider extends JsonRpcProvider {
    constructor(host) {
        const transport = new HttpTransport(host);
        super(transport);
        transport.on("debug", (data) => this.emit("debug", data));
    }
}
//# sourceMappingURL=http-provider.js.map