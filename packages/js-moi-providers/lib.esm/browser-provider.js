import { Identifier } from "js-moi-identifiers";
import { JsonRpcProvider } from "./jsonrpc-provider";
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
export class BrowserProvider extends JsonRpcProvider {
    // private readonly events = new Set<keyof WalletEventListenerMap>(["accountChange", "networkChange"]);
    constructor(host) {
        super(host);
    }
    request(method, params = []) {
        return super.send(method, JSON.parse(JSON.stringify(params)));
    }
    /**
     * Retrieves the version of the wallet client.
     *
     * @returns {Promise<string>} A promise that resolves to the wallet client version.
     * @throws Will throw an error if the JSON-RPC request or response processing fails.
     */
    async getWalletVersion() {
        const response = await this.request("wallet.ClientVersion");
        return this.processResponse(response);
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
        return this.processResponse(response);
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
        return this.processResponse(response);
    }
    /**
     * Get the permissions granted to the wallet.
     *
     * @returns {Promise<RequestPermissionsResult[]>} A promise that resolves to an array of revoked permissions.
     */
    async getPermissions() {
        const response = await this.request("wallet.GetPermissions");
        return this.processResponse(response);
    }
    /**
     * Revokes specific permissions from the wallet.
     * @param key - The specific permission key to revoke.
     * @param permission - The details or configuration of the permission being revoked.
     *
     * @returns {Promise<null>} A promise that resolves to null if the revocation is successful.
     */
    async revokePermissions(key, permission) {
        const response = await this.request("wallet.RevokePermissions", [{ [key]: permission }]);
        return this.processResponse(response);
    }
    async sendInteraction(interaction) {
        const response = await this.request("wallet.SendInteraction", [interaction]);
        const hash = this.processResponse(response);
        return {
            hash: hash,
            wait: this.waitForInteraction.bind(this, hash),
            result: this.waitForResult.bind(this, hash)
        };
    }
    /**
     * Gets the details of a wallet account.
     *
     * @param id - The identifier of the wallet account. If not provided, the method will return master account details.
     * @returns {Promise<WalletParticipant | null>} A promise that resolves to the account configuration object or null if not found.
     */
    async getWalletAccount(id) {
        const value = id instanceof Identifier ? id.toHex() : id;
        const response = await this.request("wallet.Account", [value]);
        return this.processResponse(response);
    }
    /**
     * Retrieves the network configuration from the wallet.
     *
     * @returns A promise that resolves to the `NetworkConfiguration` object if the request is successful, or `null` if the network details is not available.
     * @throws This method may throw an error if the underlying request fails.
     */
    async getNetwork() {
        const response = await this.request("wallet.Network");
        return this.processResponse(response);
    }
}
//# sourceMappingURL=browser-provider.js.map