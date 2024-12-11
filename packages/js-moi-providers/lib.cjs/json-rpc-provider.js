"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonRpcProvider = void 0;
const provider_1 = require("./provider");
const http_transport_1 = require("./transport/http-transport");
class JsonRpcProvider extends provider_1.Provider {
    constructor(host, option) {
        super(new http_transport_1.HttpTransport(host, option));
    }
}
exports.JsonRpcProvider = JsonRpcProvider;
//# sourceMappingURL=json-rpc-provider.js.map