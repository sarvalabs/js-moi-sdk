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
        caveats: { type: "returnAddress"; value: Hex[] }[];
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

    // !Important to note: (string & {}) is specifically used to prevent the type from being narrowed to a string literal type.
    // This also helps provides a better developer experience by allowing the developer to use string literals or symbols as event names along
    // with suggestions and autocompletion in modern IDEs.
    [key: (string & {}) | symbol]: (...args: any[]) => void;
}

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

    public async getWalletAccounts(): Promise<Hex[]> {
        const response = await this.request<Hex[]>("wallet.Accounts");
        return this.processJsonRpcResponse(response);
    }

    public async requestPermissions<TKey extends keyof RequestPermissions>(key: TKey, permission: RequestPermissions[TKey]): Promise<[RequestPermissionsResult[TKey]]> {
        const response = await this.request<[RequestPermissionsResult[TKey]]>("wallet.RequestPermissions", [{ [key]: permission }]);
        return this.processJsonRpcResponse(response);
    }

    public async sign(message: Hex, account: Hex): Promise<Hex> {
        const response = await this.request<Hex>("wallet.SignMessage", [message, account]);
        return this.processJsonRpcResponse(response);
    }

    public async signInteraction(interaction: InteractionRequest): Promise<ExecuteIx> {
        const response = await this.request<ExecuteIx>("wallet.SignInteraction", [interaction]);
        return this.processJsonRpcResponse(response);
    }

    public async sendInteraction(interaction: InteractionRequest): Promise<InteractionResponse> {
        const response = await this.request<Hex>("wallet.SendInteraction", [interaction]);
        const hash = this.processJsonRpcResponse(response);

        return new InteractionResponse(hash, this);
    }

    public async getWalletPublicKey(id?: Hex): Promise<string> {
        const params = id ? [id] : [];
        const response = await this.request<string>("wallet.EncryptionPublicKey", params);
        return this.processJsonRpcResponse(response);
    }

    public async getNetwork(): Promise<NetworkConfiguration | null> {
        const response = await this.request<NetworkConfiguration>("wallet.Network");
        return this.processJsonRpcResponse(response);
    }

    public on<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this {
        if (this.events.has(eventName)) {
            this.transport.on(eventName, listener);
        }

        return super.on(eventName, listener);
    }

    public once<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this {
        if (this.events.has(eventName)) {
            this.transport.once(eventName, listener);
        }

        return super.once(eventName, listener);
    }

    public addListener<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this {
        if (this.events.has(eventName)) {
            this.transport.addListener(eventName, listener);
        }

        return super.addListener(eventName, listener);
    }

    public removeListener<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this {
        if (this.events.has(eventName)) {
            this.transport.removeListener(eventName, listener);
        }

        return super.removeListener(eventName, listener);
    }

    public off<K extends keyof WalletEventListenerMap>(eventName: K, listener: WalletEventListenerMap[K]): this {
        if (this.events.has(eventName)) {
            this.transport.off(eventName, listener);
        }

        return super.off(eventName, listener);
    }
}
