import { HttpTransport, type HttpTransportOption } from "../transport/http-transport";
import { JsonRpcProvider } from "./json-rpc-provider";

export interface HttpProviderOptions extends HttpTransportOption {}

export class HttpProvider extends JsonRpcProvider {
    constructor(host: string, option?: HttpProviderOptions) {
        super(new HttpTransport(host, option));
    }
}
