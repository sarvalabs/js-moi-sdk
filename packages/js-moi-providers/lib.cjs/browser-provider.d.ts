import { Identifier } from "js-moi-identifiers";
import type { Hex } from "js-moi-utils";
import { JsonRpcProvider } from "./jsonrpc-provider";
import { InteractionRequest, InteractionResponse, RpcResponse } from "../types/jsonrpc";
export interface RequestPermissions {
    "wallet.Accounts": {};
}
export interface RequestPermissionsResult {
    "wallet.Accounts": {
        capability: "wallet.Accounts";
        id: string;
        invoker: string;
        caveats: {
            type: "returnAddress";
            value: Hex[];
        }[];
    };
}
export interface NetworkConfiguration {
    id: string;
    name: string;
    jsonRpcHost: string;
    blockExplorer?: string;
}
export interface WalletAccount {
    id: Hex;
    name?: string;
    path: string;
    pubkey: string;
}
export interface WalletParticipant {
    readonly id: string;
    name: Hex;
    accounts: WalletAccount[];
}
export interface WalletEventListenerMap {
    accountChange: (identifier: Hex) => void;
    networkChange: (host: NetworkConfiguration) => void;
    [key: (string & {}) | symbol]: (...args: any[]) => void;
}
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
export declare class BrowserProvider extends JsonRpcProvider {
    constructor(host: string);
    request<T>(method: string, params?: unknown[]): Promise<RpcResponse<T>>;
    /**
     * Retrieves the version of the wallet client.
     *
     * @returns {Promise<string>} A promise that resolves to the wallet client version.
     * @throws Will throw an error if the JSON-RPC request or response processing fails.
     */
    getWalletVersion(): Promise<string>;
    /**
     * Retrieves the list of wallet accounts available.
     *
     * **Note**: The first address in the returned array is the current active address.
     *
     * @returns {Promise<Hex[]>} A promise that resolves to an array of wallet account addresses in hexadecimal format.
     * @throws {Error} If the JSON-RPC request fails or the response is invalid.
     */
    getWalletAccounts(): Promise<Hex[]>;
    /**
     * Requests specific permissions from the wallet.
     *
     * @param {string} key - The specific permission key to request.
     * @param {object} permission - The details or configuration of the permission being requested.
     * @returns {Promise<object>} A promise that resolves to an array containing the result of the requested permission.
     */
    requestPermissions<TKey extends keyof RequestPermissions>(key: TKey, permission: RequestPermissions[TKey]): Promise<[RequestPermissionsResult[TKey]]>;
    /**
     * Get the permissions granted to the wallet.
     *
     * @returns {Promise<RequestPermissionsResult[]>} A promise that resolves to an array of revoked permissions.
     */
    getPermissions(): Promise<RequestPermissionsResult[]>;
    /**
     * Revokes specific permissions from the wallet.
     * @param key - The specific permission key to revoke.
     * @param permission - The details or configuration of the permission being revoked.
     *
     * @returns {Promise<null>} A promise that resolves to null if the revocation is successful.
     */
    revokePermissions<TKey extends keyof RequestPermissions>(key: TKey, permission: RequestPermissions[TKey]): Promise<null>;
    sendInteraction(interaction: InteractionRequest): Promise<InteractionResponse>;
    /**
     * Gets the details of a wallet account.
     *
     * @param id - The identifier of the wallet account. If not provided, the method will return master account details.
     * @returns {Promise<WalletParticipant | null>} A promise that resolves to the account configuration object or null if not found.
     */
    getWalletAccount(id?: Hex | Identifier | null): Promise<WalletParticipant | null>;
    /**
     * Retrieves the network configuration from the wallet.
     *
     * @returns A promise that resolves to the `NetworkConfiguration` object if the request is successful, or `null` if the network details is not available.
     * @throws This method may throw an error if the underlying request fails.
     */
    getNetwork(): Promise<NetworkConfiguration | null>;
}
//# sourceMappingURL=browser-provider.d.ts.map