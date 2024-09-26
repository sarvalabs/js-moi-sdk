import { randomUUID } from "crypto";
import { w3cwebsocket as Websocket } from "websocket";
import { BaseProvider } from "./base-provider";
export class WebsocketProvider extends BaseProvider {
    ws;
    reconnects = 0;
    reconnectInterval;
    host;
    options;
    constructor(host, options) {
        super();
        this.host = host;
        this.options = options;
        this.ws = this.createNewWebsocket(host, options);
    }
    createNewWebsocket(host, options) {
        const ws = new Websocket(host, options?.protocols, undefined, options?.headers ?? {}, options?.requestOptions, options?.clientConfig);
        ws.onopen = () => this.handleOnConnect();
        ws.onerror = (error) => this.handleOnError(error);
        ws.onclose = (event) => this.handleOnClose(event);
        // @ts-ignore - don't want to expose the message event
        ws.onmessage = (message) => this.emit('message', message);
        if (options?.timeout) {
            setTimeout(() => {
                if (ws.readyState === ws.OPEN) {
                    return;
                }
                ;
                ws.close(3008, "Connection timeout");
            }, options.timeout);
        }
        return ws;
    }
    reconnect() {
        this.reconnects++;
        this.ws = this.createNewWebsocket(this.host, this.options);
        this.emit('reconnect', this.reconnects);
        if (this.options.reconnect) {
            const interval = setInterval(() => {
                if (this.ws.readyState === this.ws.OPEN) {
                    clearInterval(interval);
                    return;
                }
                if (this.reconnects >= this.options.reconnect.maxAttempts) {
                    this.emit('error', new Error('Max reconnect attempts reached'));
                    clearInterval(interval);
                    return;
                }
                this.reconnects++;
                this.ws = this.createNewWebsocket(this.host, this.options);
                this.emit('reconnect', this.reconnects);
            }, this.options.reconnect.delay);
        }
    }
    handleOnConnect() {
        this.reconnects = 0;
        this.emit('connect');
    }
    handleOnError(error) {
        this.emit('error', error);
    }
    handleOnClose(event) {
        const isError = event.code !== 1000;
        if (isError) {
            if (this.options?.reconnect && this.reconnects < this.options.reconnect.maxAttempts) {
                if (this.reconnectInterval) {
                    clearInterval(this.reconnectInterval);
                }
                this.reconnect();
                return;
            }
        }
        this.emit('close');
    }
    execute(method, params) {
        if (this.ws.readyState !== this.ws.OPEN) {
            return new Promise((resolve) => {
                this.once('connect', async () => {
                    resolve(await this.handleRpcRequest(method, params));
                });
            });
        }
        return this.handleRpcRequest(method, params);
    }
    handleRpcRequest(method, params) {
        const inputParams = Array.isArray(params) ? params : [params];
        const payload = {
            method: method,
            params: inputParams,
            jsonrpc: "2.0",
            id: randomUUID(),
        };
        return new Promise((resolve) => {
            const handler = (message) => {
                const response = JSON.parse(message.data);
                if (response.id !== payload.id) {
                    return;
                }
                // @ts-ignore - don't want to expose the message event
                this.removeListener('message', handler);
                resolve({ ...response, id: 1 });
            };
            // @ts-ignore - don't want to expose the message event
            this.on('message', handler);
            this.ws.send(JSON.stringify(payload));
        });
    }
    async subscribe(event, ...args) {
        this.execute("moi.subscribe", []);
    }
}
//# sourceMappingURL=provider-websocket.js.map