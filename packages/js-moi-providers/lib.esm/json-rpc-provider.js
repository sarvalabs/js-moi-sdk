import { Provider } from "./provider";
import { HttpTransport } from "./transport/http-transport";
export class JsonRpcProvider extends Provider {
    constructor(host, option) {
        super(new HttpTransport(host, option));
    }
}
//# sourceMappingURL=json-rpc-provider.js.map