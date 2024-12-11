export class HttpTransport {
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
//# sourceMappingURL=http-transport.js.map