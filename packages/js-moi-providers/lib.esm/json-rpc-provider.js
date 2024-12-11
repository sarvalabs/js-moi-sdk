import { Provider } from "./provider";
import { HttpTransport } from "./transport/http-transport";
export class JsonRpcProvider extends Provider {
    constructor(host) {
        super(new HttpTransport(host));
    }
}
//# sourceMappingURL=json-rpc-provider.js.map