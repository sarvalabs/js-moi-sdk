import { Provider } from "./provider";
import { HttpTransport } from "./transport/http-transport";

export class JsonRpcProvider extends Provider {
    constructor(host: string) {
        super(new HttpTransport(host));
    }
}
