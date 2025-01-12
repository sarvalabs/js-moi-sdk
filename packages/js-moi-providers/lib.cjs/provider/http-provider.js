"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpProvider = void 0;
const http_transport_1 = require("../transport/http-transport");
const json_rpc_provider_1 = require("./json-rpc-provider");
class HttpProvider extends json_rpc_provider_1.JsonRpcProvider {
    constructor(host, option) {
        if (!HttpProvider.isValidHost(host)) {
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
exports.HttpProvider = HttpProvider;
//# sourceMappingURL=http-provider.js.map