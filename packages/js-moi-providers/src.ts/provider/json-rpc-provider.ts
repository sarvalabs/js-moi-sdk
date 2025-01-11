import { HttpTransport, type HttpTransportOption } from "../transport/http-transport";
import { Provider } from "./provider";

export interface JsonRpcProviderOption extends HttpTransportOption {}

export class JsonRpcProvider extends Provider {
    constructor(host: string, option?: JsonRpcProviderOption) {
        if (!JsonRpcProvider.isValidHost(host)) {
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
