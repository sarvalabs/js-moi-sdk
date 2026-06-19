import { Identifier } from "js-moi-identifiers";
import type { Hex } from "js-moi-utils";
import { BaseProvider } from "./base-provider";
import type { InteractionRequest, InteractionResponse, RpcResponse } from "../types/jsonrpc";
import type { Transport } from "../types/transport";
import type { NetworkConfiguration, RequestPermissions, RequestPermissionsResult, WalletEventListenerMap, WalletParticipant } from "../types/browser";
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
export declare class BrowserProvider extends BaseProvider {
    private readonly transport;
    constructor(transport: Transport);
    /**
     * Entry point for all `BaseProvider` RPC methods (getBalance, getTDU, etc.).
     * Wraps the single params object in an array to match the JSON-RPC spec.
     */
    protected execute<T>(method: string, params: any): Promise<RpcResponse<T>>;
    /**
     * Low-level request method for wallet-specific calls that already supply
     * their params as an array.
     */
    request<T>(method: string, params?: unknown[]): Promise<RpcResponse<T>>;
    getWalletVersion(): Promise<string>;
    /**
     * Returns all wallet account addresses. The first element is the currently
     * active account.
     */
    getWalletAccounts(): Promise<Hex[]>;
    requestPermissions<TKey extends keyof RequestPermissions>(key: TKey, permission: RequestPermissions[TKey]): Promise<[RequestPermissionsResult[TKey]]>;
    getPermissions(): Promise<RequestPermissionsResult[]>;
    revokePermissions<TKey extends keyof RequestPermissions>(key: TKey, permission: RequestPermissions[TKey]): Promise<null>;
    sendInteraction(interaction: InteractionRequest): Promise<InteractionResponse>;
    /**
     * @param id - Participant identifier. Omit to get the master account.
     */
    getWalletAccount(id?: Hex | Identifier | null): Promise<WalletParticipant | null>;
    getNetwork(): Promise<NetworkConfiguration | null>;
    on<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this;
    once<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this;
    addListener<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this;
    off<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this;
    removeListener<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this;
}
//# sourceMappingURL=browser-provider.d.ts.map