"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonRpcProvider = void 0;
const provider_1 = require("./provider");
const http_transport_1 = require("./transport/http-transport");
class JsonRpcProvider extends provider_1.Provider {
    constructor(host, option) {
        if (!JsonRpcProvider.isValidHost(host)) {
            throw new Error("Invalid host");
        }
        super(new http_transport_1.HttpTransport(host, option));
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
exports.JsonRpcProvider = JsonRpcProvider;
//# sourceMappingURL=json-rpc-provider.js.map