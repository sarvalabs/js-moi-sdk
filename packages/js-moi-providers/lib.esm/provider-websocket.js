import { randomUUID } from "crypto";
import { ErrorCode, ErrorUtils } from "js-moi-utils";
import { w3cwebsocket as Websocket } from "websocket";
import { BaseProvider } from "./base-provider";
export class WebsocketProvider extends BaseProvider {
    ws;
    reconnects = 0;
    reconnectInterval;
    host;
    options;
    subscriptions = new Map();
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
    async disconnect() {
        if (this.ws.readyState === this.ws.OPEN) {
            this.ws.close();
        }
        if (this.ws.readyState === this.ws.CLOSED) {
            ErrorUtils.throwError("Closing on a closed connection", ErrorCode.ACTION_REJECTED);
        }
        if (this.ws.readyState === this.ws.CLOSING) {
            return new Promise((resolve) => {
                this.once('close', () => {
                    resolve();
                });
            });
        }
        if (this.ws.readyState === this.ws.CONNECTING) {
            return new Promise((resolve) => {
                this.once('connect', () => {
                    this.ws.close(1000);
                    resolve();
                });
            });
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
    isSubscriptionEvent(eventName) {
        const events = ['newTesseracts', 'newTesseractsByAccount', 'newLogs', 'newPendingInteractions'];
        const name = typeof eventName === "string" ? eventName : eventName.event;
        return events.includes(name);
    }
    async getSubscription(eventName) {
        const sub = this.subscriptions.get(eventName);
        if (sub?.subID != null) {
            return await this.subscriptions.get(eventName).subID;
        }
        if (sub == null) {
            const promise = super.getSubscription(eventName);
            this.subscriptions.set(eventName, { subID: promise });
            return await promise;
        }
        sub.subID = super.getSubscription(eventName);
        return await sub.subID;
    }
    on(eventName, listener) {
        if (typeof eventName === "string") {
            super.on(eventName, listener);
        }
        if (typeof eventName === "object") {
            if (this.subscriptions.has(eventName)) {
                const _sub = this.subscriptions.get(eventName);
                if (_sub?.uuid == null) {
                    _sub.uuid = `${eventName.event}:${randomUUID()}`;
                }
                super.on(_sub.uuid, listener);
            }
            else {
                const uuid = `${eventName.event}:${randomUUID()}`;
                this.subscriptions.set(eventName, { uuid });
                super.on(uuid, listener);
            }
        }
        if (this.isSubscriptionEvent(eventName)) {
            const _sub = this.subscriptions.get(eventName);
            if (_sub?.subID != null) {
                return this;
            }
            this.getSubscription(eventName).then((subscription) => {
                console.log("Subscribing to", eventName, subscription);
                // @ts-ignore - don't want to expose the message event
                this.on("message", (message) => {
                    const data = JSON.parse(message.data);
                    if (!("method" in data) || data.method !== "moi.subscription" || data.params.subscription !== subscription) {
                        return;
                    }
                    if (typeof eventName === "string") {
                        this.emit(eventName, this.processWsResult(eventName, data.params.result));
                        return;
                    }
                    if (typeof eventName === "object" && _sub.uuid != null) {
                        this.emit(_sub.uuid, this.processWsResult(eventName, data.params.result));
                        return;
                    }
                });
            });
        }
        return this;
    }
    once(eventName, listener) {
        if (typeof eventName === "string") {
            super.once(eventName, listener);
        }
        if (typeof eventName === "object") {
            if (this.subscriptions.has(eventName)) {
                const _sub = this.subscriptions.get(eventName);
                if (_sub?.uuid == null) {
                    _sub.uuid = `${eventName.event}:${randomUUID()}`;
                }
                super.once(_sub.uuid, listener);
            }
            else {
                const uuid = `${eventName.event}:${randomUUID()}`;
                this.subscriptions.set(eventName, { uuid });
                super.once(uuid, listener);
            }
        }
        if (this.isSubscriptionEvent(eventName)) {
            const _sub = this.subscriptions.get(eventName);
            if (_sub?.subID != null) {
                return this;
            }
            this.getSubscription(eventName).then((subscription) => {
                console.log("Subscribing to", eventName, subscription);
                // @ts-ignore - don't want to expose the message event
                this.on("message", (message) => {
                    const data = JSON.parse(message.data);
                    if (!("method" in data) || data.method !== "moi.subscription" || data.params.subscription !== subscription) {
                        return;
                    }
                    if (typeof eventName === "string") {
                        this.emit(eventName, this.processWsResult(eventName, data.params.result));
                        return;
                    }
                    if (typeof eventName === "object" && _sub.uuid != null) {
                        this.emit(_sub.uuid, this.processWsResult(eventName, data.params.result));
                        return;
                    }
                });
            });
        }
        return this;
    }
    removeListener(eventName, listener) {
        if (typeof eventName === "string") {
            super.removeListener(eventName, listener);
        }
        if (typeof eventName === "object") {
            const _sub = this.subscriptions.get(eventName);
            if (_sub?.uuid == null) {
                return this;
            }
            super.removeListener(_sub.uuid, listener);
            this.subscriptions.delete(eventName);
        }
        return this;
    }
}
//# sourceMappingURL=provider-websocket.js.map