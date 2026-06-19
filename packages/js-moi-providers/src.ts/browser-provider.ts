import { Identifier } from "js-moi-identifiers";
import type { Hex } from "js-moi-utils";
import { BaseProvider } from "./base-provider";
import type { InteractionRequest, InteractionResponse, RpcResponse } from "../types/jsonrpc";
import type { Transport } from "../types/transport";
import type {
    NetworkConfiguration,
    RequestPermissions,
    RequestPermissionsResult,
    WalletEventListenerMap,
    WalletParticipant,
} from "../types/browser";

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
    private readonly transport: Transport;

    constructor(transport: Transport) {
        super();
        this.transport = transport;
    }

    /**
     * Entry point for all `BaseProvider` RPC methods (getBalance, getTDU, etc.).
     * Wraps the single params object in an array to match the JSON-RPC spec.
     */
    protected override async execute<T>(method: string, params: any): Promise<RpcResponse<T>> {
        return this.transport.request<T>(method, params != null ? [params] : []);
    }

    /**
     * Low-level request method for wallet-specific calls that already supply
     * their params as an array.
     */
    public async request<T>(method: string, params: unknown[] = []): Promise<RpcResponse<T>> {
        return this.transport.request<T>(method, params);
    }

    // ── Wallet methods ──────────────────────────────────────────────────────

    public async getWalletVersion(): Promise<string> {
        const response = await this.request<string>("wallet.ClientVersion");
        return this.processResponse(response);
    }

    /**
     * Returns all wallet account addresses. The first element is the currently
     * active account.
     */
    public async getWalletAccounts(): Promise<Hex[]> {
        const response = await this.request<Hex[]>("wallet.Accounts");
        return this.processResponse(response);
    }

    public async requestPermissions<TKey extends keyof RequestPermissions>(
        key: TKey,
        permission: RequestPermissions[TKey],
    ): Promise<[RequestPermissionsResult[TKey]]> {
        const response = await this.request<[RequestPermissionsResult[TKey]]>(
            "wallet.RequestPermissions",
            [{ [key]: permission }],
        );
        return this.processResponse(response);
    }

    public async getPermissions(): Promise<RequestPermissionsResult[]> {
        const response = await this.request<RequestPermissionsResult[]>("wallet.GetPermissions");
        return this.processResponse(response);
    }

    public async revokePermissions<TKey extends keyof RequestPermissions>(
        key: TKey,
        permission: RequestPermissions[TKey],
    ): Promise<null> {
        const response = await this.request<null>("wallet.RevokePermissions", [{ [key]: permission }]);
        return response.result != null ? this.processResponse(response) : null;
    }

    public override async sendInteraction(interaction: InteractionRequest): Promise<InteractionResponse> {
        const response = await this.request<Hex>("wallet.SendInteraction", [interaction]);
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
    public async getWalletAccount(id?: Hex | Identifier | null): Promise<WalletParticipant | null> {
        const value = id instanceof Identifier ? id.toHex() : id;
        const response = await this.request<WalletParticipant | null>("wallet.Account", [value]);
        return this.processResponse(response);
    }

    public async getNetwork(): Promise<NetworkConfiguration | null> {
        const response = await this.request<NetworkConfiguration>("wallet.Network");
        return this.processResponse(response);
    }

    // ── Event delegation ────────────────────────────────────────────────────
    // The Transport already extends EventEmitter and (in browser environments)
    // wires DOM `window.postMessage` listeners for wallet events. Delegating
    // here means callers work against a single object without caring about the
    // underlying transport's event plumbing.

    public override on<K extends keyof WalletEventListenerMap>(
        eventName: K,
        listener: WalletEventListenerMap[K],
    ): this {
        this.transport.on(eventName, listener);
        return this;
    }

    public override once<K extends keyof WalletEventListenerMap>(
        eventName: K,
        listener: WalletEventListenerMap[K],
    ): this {
        this.transport.once(eventName, listener);
        return this;
    }

    public override addListener<K extends keyof WalletEventListenerMap>(
        eventName: K,
        listener: WalletEventListenerMap[K],
    ): this {
        this.transport.addListener(eventName, listener);
        return this;
    }

    public override off<K extends keyof WalletEventListenerMap>(
        eventName: K,
        listener: WalletEventListenerMap[K],
    ): this {
        this.transport.off(eventName, listener);
        return this;
    }

    public override removeListener<K extends keyof WalletEventListenerMap>(
        eventName: K,
        listener: WalletEventListenerMap[K],
    ): this {
        this.transport.removeListener(eventName, listener);
        return this;
    }
}
