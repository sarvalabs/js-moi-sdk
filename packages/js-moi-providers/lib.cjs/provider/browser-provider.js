"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserProvider = void 0;
const js_moi_identifiers_1 = require("js-moi-identifiers");
const interaction_response_1 = require("../utils/interaction-response");
const json_rpc_provider_1 = require("./json-rpc-provider");
/**
 * The `BrowserProvider` class extends the `JsonRpcProvider` to provide
 * additional functionality for interacting with a wallet in a browser environment.
 * It includes methods for managing wallet accounts, signing messages and interactions,
 * requesting permissions, and handling wallet-related events.
 *
 * @param {Transport} transport - The transport layer for communication with the wallet.
 *
 * @example
 *
 * const provider = new BrowserProvider(globalThis.moi);
 *
 * @extends JsonRpcProvider
 */
class BrowserProvider extends json_rpc_provider_1.JsonRpcProvider {
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
    /**
     * Retrieves the list of wallet accounts available.
     *
     * **Note**: The first address in the returned array is the current active address.
     *
     * @returns {Promise<Hex[]>} A promise that resolves to an array of wallet account addresses in hexadecimal format.
     * @throws {Error} If the JSON-RPC request fails or the response is invalid.
     */
    async getWalletAccounts() {
        const response = await this.request("wallet.Accounts");
        return this.processJsonRpcResponse(response);
    }
    /**
     * Requests specific permissions from the wallet.
     *
     * @param {string} key - The specific permission key to request.
     * @param {object} permission - The details or configuration of the permission being requested.
     * @returns {Promise<object>} A promise that resolves to an array containing the result of the requested permission.
     */
    async requestPermissions(key, permission) {
        const response = await this.request("wallet.RequestPermissions", [{ [key]: permission }]);
        return this.processJsonRpcResponse(response);
    }
    async sendInteraction(interaction) {
        const response = await this.request("wallet.SendInteraction", [interaction]);
        const hash = this.processJsonRpcResponse(response);
        return new interaction_response_1.InteractionResponse(hash, this);
    }
    /**
     * Retrieves the public encryption key of a wallet.
     *
     * - If the `id` parameter is provided, it retrieves the public encryption key for that specific wallet.
     * - If the `id` parameter is not provided, it retrieves the public encryption key for the master account.
     *
     * @param {string} id - (Optional) The hexadecimal identifier of the wallet
     * @returns {Promise<string>} A promise that resolves to the wallet's public encryption key as a string.
     * @throws Will throw an error if the JSON-RPC request fails or the response is invalid.
     */
    async getWalletPublicKey(id) {
        const params = id ? [id] : [];
        const response = await this.request("wallet.EncryptionPublicKey", params);
        return this.processJsonRpcResponse(response);
    }
    /**
     * Gets the details of a wallet account.
     *
     * @param id - The identifier of the wallet account. If not provided, the method will return master account details.
     * @returns {Promise<AccountConfiguration | null>} A promise that resolves to the account configuration object or null if not found.
     */
    async getWalletAccount(id) {
        const value = id instanceof js_moi_identifiers_1.Identifier ? id.toHex() : id;
        const response = await this.request("wallet.Account", [value]);
        return this.processJsonRpcResponse(response);
    }
    /**
     * Retrieves the network configuration from the wallet.
     *
     * @returns A promise that resolves to the `NetworkConfiguration` object if the request is successful, or `null` if the network details is not available.
     * @throws This method may throw an error if the underlying request fails.
     */
    async getNetwork() {
        const response = await this.request("wallet.Network");
        return this.processJsonRpcResponse(response);
    }
    /**
     * Registers an event listener for a specific wallet event.
     *
     * @param eventName - The name of the event to listen for.
     * @param listener - The callback function to be executed when the event is triggered.
     * @returns The current instance of the class for method chaining.
     */
    on(eventName, listener) {
        if (this.events.has(eventName)) {
            this.transport.on(eventName, listener);
        }
        return super.on(eventName, listener);
    }
    /**
     * Registers a one-time event listener for the specified event.
     * The listener will be invoked at most once after being registered,
     * and then it will be automatically removed.
     *
     * @param eventName - The name of the event to listen for.
     * @param listener - The callback function to execute when the event is triggered.
     * @returns The current instance of the class, allowing for method chaining.
     */
    once(eventName, listener) {
        if (this.events.has(eventName)) {
            this.transport.once(eventName, listener);
        }
        return super.once(eventName, listener);
    }
    /**
     * Adds a listener for a specific wallet event.
     *
     * @param eventName - The name of the event to listen for.
     * @param listener - The callback function to be executed when the event is triggered.
     * @returns The current instance of the class, allowing for method chaining.
     */
    addListener(eventName, listener) {
        if (this.events.has(eventName)) {
            this.transport.addListener(eventName, listener);
        }
        return super.addListener(eventName, listener);
    }
    /**
     * Removes a previously registered event listener for a specific wallet event.
     *
     * @param eventName - The name of the event for which the listener should be removed.
     * @param listener - The listener function to be removed for the specified event.
     * @returns The current instance of the class for method chaining.
     */
    removeListener(eventName, listener) {
        if (this.events.has(eventName)) {
            this.transport.removeListener(eventName, listener);
        }
        return super.removeListener(eventName, listener);
    }
    /**
     * Removes a previously registered event listener for a specific wallet event.
     *
     * @param eventName - The name of the event for which the listener should be removed.
     * @param listener - The listener function to be removed for the specified event.
     * @returns The current instance of the class for method chaining.
     */
    off(eventName, listener) {
        if (this.events.has(eventName)) {
            this.transport.off(eventName, listener);
        }
        return super.off(eventName, listener);
    }
}
exports.BrowserProvider = BrowserProvider;
//# sourceMappingURL=browser-provider.js.map