import { HttpTransport, type HttpTransportOption } from "../transport/http-transport";
import { JsonRpcProvider } from "./json-rpc-provider";

export interface HttpProviderOptions extends HttpTransportOption {}

export class HttpProvider extends JsonRpcProvider {
    constructor(host: string, option?: HttpProviderOptions) {
        if (!HttpProvider.isValidHost(host)) {
            throw new Error("Invalid host");
        }

        super(new HttpTransport(host, option));
    }

    private static isValidHost(host: string): boolean {
        try {
            const url = new URL(host);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch (error) {
            return false;
        }
    }
}
