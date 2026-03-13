import { Identifier } from "js-moi-identifiers";
import { BaseProvider } from "./base-provider";
/**
 * `BrowserProvider` wraps a browser-injected `Transport` (e.g. `window.moi`)
 * to provide wallet-aware RPC access in a browser environment.
 *
 * All standard MOI RPC calls (inherited from `BaseProvider`) and wallet-specific
 * calls are routed through the transport, so no HTTP host URL is needed.
 *
 * @example
 * const provider = new BrowserProvider(globalThis.moi);
 */
export class BrowserProvider extends BaseProvider {
    transport;
    constructor(transport) {
        super();
        this.transport = transport;
    }
    /**
     * Entry point for all `BaseProvider` RPC methods (getBalance, getTDU, etc.).
     * Wraps the single params object in an array to match the JSON-RPC spec.
     */
    async execute(method, params) {
        return this.transport.request(method, params != null ? [params] : []);
    }
    /**
     * Low-level request method for wallet-specific calls that already supply
     * their params as an array.
     */
    async request(method, params = []) {
        return this.transport.request(method, params);
    }
    // ── Wallet methods ──────────────────────────────────────────────────────
    async getWalletVersion() {
        const response = await this.request("wallet.ClientVersion");
        return this.processResponse(response);
    }
    /**
     * Returns all wallet account addresses. The first element is the currently
     * active account.
     */
    async getWalletAccounts() {
        const response = await this.request("wallet.Accounts");
        return this.processResponse(response);
    }
    async requestPermissions(key, permission) {
        const response = await this.request("wallet.RequestPermissions", [{ [key]: permission }]);
        return this.processResponse(response);
    }
    async getPermissions() {
        const response = await this.request("wallet.GetPermissions");
        return this.processResponse(response);
    }
    async revokePermissions(key, permission) {
        const response = await this.request("wallet.RevokePermissions", [{ [key]: permission }]);
        return response.result != null ? this.processResponse(response) : null;
    }
    async sendInteraction(interaction) {
        const response = await this.request("wallet.SendInteraction", [interaction]);
        const hash = this.processResponse(response);
        return {
            hash,
            wait: this.waitForInteraction.bind(this, hash),
            result: this.waitForResult.bind(this, hash),
        };
    }
    /**
     * @param id - Participant identifier. Omit to get the master account.
     */
    async getWalletAccount(id) {
        const value = id instanceof Identifier ? id.toHex() : id;
        const response = await this.request("wallet.Account", [value]);
        return this.processResponse(response);
    }
    async getNetwork() {
        const response = await this.request("wallet.Network");
        return this.processResponse(response);
    }
    // ── Event delegation ────────────────────────────────────────────────────
    // The Transport already extends EventEmitter and (in browser environments)
    // wires DOM `window.postMessage` listeners for wallet events. Delegating
    // here means callers work against a single object without caring about the
    // underlying transport's event plumbing.
    on(eventName, listener) {
        this.transport.on(eventName, listener);
        return this;
    }
    once(eventName, listener) {
        this.transport.once(eventName, listener);
        return this;
    }
    addListener(eventName, listener) {
        this.transport.addListener(eventName, listener);
        return this;
    }
    off(eventName, listener) {
        this.transport.off(eventName, listener);
        return this;
    }
    removeListener(eventName, listener) {
        this.transport.removeListener(eventName, listener);
        return this;
    }
}
//# sourceMappingURL=browser-provider.js.map