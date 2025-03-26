import { InteractionResponse } from "../utils/interaction-response";
import { JsonRpcProvider } from "./json-rpc-provider";
export class BrowserProvider extends JsonRpcProvider {
    events = new Set(["accountChange", "networkChange"]);
    constructor(transport) {
        super(transport);
    }
    request(method, params = []) {
        return super.request(method, JSON.parse(JSON.stringify(params)));
    }
    /**
     * Retrieves the version of the wallet client.
     *
     * @returns {Promise<string>} A promise that resolves to the wallet client version.
     * @throws Will throw an error if the JSON-RPC request or response processing fails.
     */
    async getWalletVersion() {
        const response = await this.request("wallet.ClientVersion");
        return this.processJsonRpcResponse(response);
    }
    async getWalletAccounts() {
        const response = await this.request("wallet.Accounts");
        return this.processJsonRpcResponse(response);
    }
    async requestPermissions(key, permission) {
        const response = await this.request("wallet.RequestPermissions", [{ [key]: permission }]);
        return this.processJsonRpcResponse(response);
    }
    async sign(message, account) {
        const response = await this.request("wallet.SignMessage", [message, account]);
        return this.processJsonRpcResponse(response);
    }
    async signInteraction(interaction) {
        const response = await this.request("wallet.SignInteraction", [interaction]);
        return this.processJsonRpcResponse(response);
    }
    async sendInteraction(interaction) {
        const response = await this.request("wallet.SendInteraction", [interaction]);
        const hash = this.processJsonRpcResponse(response);
        return new InteractionResponse(hash, this);
    }
    async getWalletPublicKey(id) {
        const params = id ? [id] : [];
        const response = await this.request("wallet.EncryptionPublicKey", params);
        return this.processJsonRpcResponse(response);
    }
    async getNetwork() {
        const response = await this.request("wallet.Network");
        return this.processJsonRpcResponse(response);
    }
    on(eventName, listener) {
        if (this.events.has(eventName)) {
            this.transport.on(eventName, listener);
        }
        return super.on(eventName, listener);
    }
    once(eventName, listener) {
        if (this.events.has(eventName)) {
            this.transport.once(eventName, listener);
        }
        return super.once(eventName, listener);
    }
    addListener(eventName, listener) {
        if (this.events.has(eventName)) {
            this.transport.addListener(eventName, listener);
        }
        return super.addListener(eventName, listener);
    }
    removeListener(eventName, listener) {
        if (this.events.has(eventName)) {
            this.transport.removeListener(eventName, listener);
        }
        return super.removeListener(eventName, listener);
    }
    off(eventName, listener) {
        if (this.events.has(eventName)) {
            this.transport.off(eventName, listener);
        }
        return super.off(eventName, listener);
    }
}
//# sourceMappingURL=browser-provider.js.map