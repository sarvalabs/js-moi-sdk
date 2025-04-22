import { Identifier } from "js-moi-identifiers";
import type { Hex, InteractionRequest, JsonRpcResponse, Transport } from "js-moi-utils";
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
        caveats: { type: "returnAddress"; value: Hex[] }[];
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

    // !Important to note: (string & {}) is specifically used to prevent the type from being narrowed to a string literal type.
    // This also helps provides a better developer experience by allowing the developer to use string literals or symbols as event names along
    // with suggestions and autocompletion in modern IDEs.
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
export class BrowserProvider extends JsonRpcProvider {
    private readonly events = new Set<keyof WalletEventListenerMap>(["accountChange", "networkChange"]);

    constructor(transport: Transport) {
        super(transport);
    }

    public override request<T>(method: string, params: unknown[] = []): Promise<JsonRpcResponse<T>> {
        return super.request<T>(method, JSON.parse(JSON.stringify(params)));
    }

    /**
     * Retrieves the version of the wallet client.
     *
     * @returns {Promise<string>} A promise that resolves to the wallet client version.
     * @throws Will throw an error if the JSON-RPC request or response processing fails.
     */
    public async getWalletVersion(): Promise<string> {
        const response = await this.request<string>("wallet.ClientVersion");
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
    public async getWalletAccounts(): Promise<Hex[]> {
        const response = await this.request<Hex[]>("wallet.Accounts");
        return this.processJsonRpcResponse(response);
    }

    /**
     * Requests specific permissions from the wallet.
     *
     * @param {string} key - The specific permission key to request.
     * @param {object} permission - The details or configuration of the permission being requested.
     * @returns {Promise<object>} A promise that resolves to an array containing the result of the requested permission.
     */
    public async requestPermissions<TKey extends keyof RequestPermissions>(key: TKey, permission: RequestPermissions[TKey]): Promise<[RequestPermissionsResult[TKey]]> {
        const response = await this.request<[RequestPermissionsResult[TKey]]>("wallet.RequestPermissions", [{ [key]: permission }]);
        return this.processJsonRpcResponse(response);
    }

    public async sendInteraction(interaction: InteractionRequest): Promise<InteractionResponse> {
        const response = await this.request<Hex>("wallet.SendInteraction", [interaction]);
        const hash = this.processJsonRpcResponse(response);

        return new InteractionResponse(hash, this);
    }

    /**
     * Gets the details of a wallet account.
     *
     * @param id - The identifier of the wallet account. If not provided, the method will return master account details.
     * @returns {Promise<WalletParticipant | null>} A promise that resolves to the account configuration object or null if not found.
     */
    public async getWalletAccount(id?: Hex | Identifier | null): Promise<WalletParticipant | null> {
        const value = id instanceof Identifier ? id.toHex() : id;
        const response = await this.request<WalletParticipant | null>("wallet.Account", [value]);
        return this.processJsonRpcResponse(response);
    }

    /**
     * Retrieves the network configuration from the wallet.
     *
     * @returns A promise that resolves to the `NetworkConfiguration` object if the request is successful, or `null` if the network details is not available.
     * @throws This method may throw an error if the underlying request fails.
     */
    public async getNetwork(): Promise<NetworkConfiguration | null> {
        const response = await this.request<NetworkConfiguration>("wallet.Network");
        return this.processJsonRpcResponse(response);
    }

    /**
     * Registers an event listener for a specific wallet event.
     *
     * @param eventName - The name of the event to listen for.
     * @param listener - The callback function to be executed when the event is triggered.
     * @returns The current instance of the class for method chaining.
     */
    public on<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this {
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
    public once<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this {
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
    public addListener<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this {
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
    public removeListener<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this {
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
    public off<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this {
        if (this.events.has(eventName)) {
            this.transport.off(eventName, listener);
        }

        return super.off(eventName, listener);
    }
}
