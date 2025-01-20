import { HttpTransport } from "../transport/http-transport";
import { JsonRpcProvider } from "./json-rpc-provider";
export class HttpProvider extends JsonRpcProvider {
    constructor(host, option) {
        super(new HttpTransport(host, option));
    }
}
//# sourceMappingURL=http-provider.js.map