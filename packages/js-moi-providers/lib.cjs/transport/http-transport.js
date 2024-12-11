"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpTransport = void 0;
class HttpTransport {
    host;
    constructor(host) {
        this.host = host;
    }
    async request(method, ...params) {
        const request = {
            id: 1,
            jsonrpc: "2.0",
            method: method,
            params: params,
        };
        console.log(JSON.stringify(request, null, 2));
        const response = await fetch(this.host, {
            method: "POST",
            body: JSON.stringify(request),
            headers: {
                "Content-Type": "application/json",
            },
        });
        return await response.json();
    }
}
exports.HttpTransport = HttpTransport;
//# sourceMappingURL=http-transport.js.map