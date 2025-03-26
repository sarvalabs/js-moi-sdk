import type { Hex, InteractionRequest, JsonRpcResponse, Transport } from "js-moi-utils";
import type { ExecuteIx } from "../types/provider";
import { InteractionResponse } from "../utils/interaction-response";
import { JsonRpcProvider } from "./json-rpc-provider";
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
export interface WalletEventListenerMap {
    accountChange: (identifier: Hex) => void;
    networkChange: (host: NetworkConfiguration) => void;
    [key: (string & {}) | symbol]: (...args: any[]) => void;
}
export declare class BrowserProvider extends JsonRpcProvider {
    private readonly events;
    constructor(transport: Transport);
    request<T>(method: string, params?: unknown[]): Promise<JsonRpcResponse<T>>;
    /**
     * Retrieves the version of the wallet client.
     *
     * @returns {Promise<string>} A promise that resolves to the wallet client version.
     * @throws Will throw an error if the JSON-RPC request or response processing fails.
     */
    getWalletVersion(): Promise<string>;
    getWalletAccounts(): Promise<Hex[]>;
    requestPermissions<TKey extends keyof RequestPermissions>(key: TKey, permission: RequestPermissions[TKey]): Promise<[RequestPermissionsResult[TKey]]>;
    sign(message: Hex, account: Hex): Promise<Hex>;
    signInteraction(interaction: InteractionRequest): Promise<ExecuteIx>;
    sendInteraction(interaction: InteractionRequest): Promise<InteractionResponse>;
    getWalletPublicKey(id?: Hex): Promise<string>;
    getNetwork(): Promise<NetworkConfiguration | null>;
    on<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this;
    once<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this;
    addListener<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this;
    removeListener<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this;
    off<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this;
}
//# sourceMappingURL=browser-provider.d.ts.map