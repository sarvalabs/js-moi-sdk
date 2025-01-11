import { type Address, type Hex, type InteractionRequest, type JsonRpcResponse, type Transport } from "js-moi-utils";
import { EventEmitter } from "events";
import { type AccountAsset, type AccountInfo, type Confirmation, type Interaction, type RpcMethod, type RpcMethodParams, type RpcMethodResponse, type SimulateResult, type Tesseract } from "../types/moi-rpc-method";
import type { MoiClientInfo, RelativeTesseractOption, ResponseModifierParam, SignedInteraction, TesseractIncludeFields } from "../types/shared";
type LogicStorageOption = Omit<RpcMethodParams<"moi.LogicStorage">[0], "logic_id" | "storage_key" | "address">;
export declare class Provider extends EventEmitter {
    private readonly _transport;
    /**
     * Creates a new instance of the provider.
     *
     * @param transport - The transport to use for communication with the network.
     */
    constructor(transport: Transport);
    /**
     * The transport used to communicate with the network.
     */
    get transport(): Transport;
    /**
     * Calls a JSON-RPC method on the network using the `request` method and processes the response.
     *
     * @param method - The name of the method to invoke.
     * @param params - The parameters to pass to the method.
     *
     * @returns A promise that resolves processed result from the JSON-RPC response.
     *
     * @throws Will throw an error if the response contains an error.
     */
    protected call<T extends RpcMethod>(method: T, ...params: RpcMethodParams<T>): Promise<RpcMethodResponse<T>>;
    /**
     * Sends a JSON-RPC request to the network.
     *
     * @param method - name of the method to invoke.
     * @param params - parameters to pass to the method.
     *
     * @returns A promise that resolves to the JSON-RPC response.
     *
     * @throws Will throw an error if the response contains an error.
     */
    request<T>(method: string, params?: unknown[]): Promise<JsonRpcResponse<T>>;
    /**
     * Retrieves the version and chain id of the MOI protocol network.
     *
     * @returns A promise that resolves to the Moi client version.
     */
    getProtocol(option?: ResponseModifierParam): Promise<MoiClientInfo>;
    private getTesseractByReference;
    private getTesseractByHash;
    private getTesseractByAddressAndHeight;
    /**
     * Retrieves a tesseract by its hash
     *
     * @param hash - The hash of the tesseract to retrieve.
     * @param include - The fields to include in the response.
     * @returns A promise that resolves to the tesseract.
     */
    getTesseract(hash: Hex, include?: TesseractIncludeFields): Promise<Tesseract>;
    /**
     * Retrieves a tesseract by its address and height
     *
     * @param address - The address of the account that the tesseract is a part of.
     * @param height - The height of the tesseract on the account. The 0 & -1 values can be used to retrieve the oldest and latest tesseracts for the account respectively.
     * @param include - The fields to include in the response.
     *
     * @returns A promise that resolves to the tesseract.
     */
    getTesseract(address: Hex, height: number, include?: TesseractIncludeFields): Promise<Tesseract>;
    /**
     * Retrieves a tesseract by its relative reference
     *
     * @param relativeRef - The relative reference of the tesseract to retrieve.
     * @param include - The fields to include in the response.
     *
     * @returns A promise that resolves to the tesseract.
     */
    getTesseract(relativeRef: RelativeTesseractOption, include?: TesseractIncludeFields): Promise<Tesseract>;
    /**
     * Retrieves an interaction by its hash.
     *
     * @param hash - The hash of the interaction to retrieve.
     * @returns A promise that resolves to the interaction.
     */
    getInteraction(hash: Hex, options?: ResponseModifierParam): Promise<Partial<Interaction>>;
    /**
     * Retrieves information about an account.
     *
     * @param address The address that uniquely identifies the account
     * @param option The options to include and reference
     * @returns A promise that resolves to the account information
     */
    getAccount(address: Address, option?: Omit<RpcMethodParams<"moi.Account">[0], "identifier">): Promise<AccountInfo>;
    /**
     * Retrieves the account key for an account.
     *
     * @param address The address that uniquely identifies the account
     * @param keyId The key id that uniquely identifies the account key
     * @param pending Whether to include pending account keys
     *
     * @returns A promise that resolves to the account information for the provided key id
     */
    getAccountKey(address: Address, keyId: number, pending?: boolean): Promise<import("..").AccountKey>;
    /**
     * Retrieves the balances, mandates and deposits for a specific asset on an account
     *
     * @param address The address that uniquely identifies the account
     * @param assetId The asset id that uniquely identifies the asset
     * @param option The options to include and reference
     *
     * @returns A promise that resolves to the account asset information
     */
    getAccountAsset(address: Address, assetId: Hex, option?: Omit<RpcMethodParams<"moi.AccountAsset">[0], "asset_id">): Promise<AccountAsset[]>;
    /**
     * Retrieves the interaction confirmation
     *
     * @param hash The hash of the interaction to retrieve the confirmation.
     * @returns A promise that resolves to object containing the confirmation information.
     */
    getConfirmation(hash: Hex): Promise<Confirmation>;
    /**
     * Retrieves information about an asset
     *
     * @param assetId The asset id that uniquely identifies the asset
     * @param option The options to include and reference
     *
     * @returns A promise that resolves to the asset information
     */
    getAsset(assetId: Hex, option?: Omit<RpcMethodParams<"moi.Asset">[0], "asset_id">): Promise<unknown>;
    /**
     * Retrieves information about a logic
     *
     * @param logicId A unique identifier for the logic
     * @param option The options for the tesseract reference
     *
     * @returns A promise that resolves to the logic information
     */
    getLogic(logicId: Hex, option?: Omit<RpcMethodParams<"moi.Logic">[0], "logic_id">): Promise<unknown>;
    /**
     * Retrieves the value of a storage key for a logic from persistent storage
     *
     * @param logicId The unique identifier for the logic
     * @param key The storage key to retrieve
     * @param option The options for the tesseract reference
     *
     * @returns A promise that resolves to the value of the storage key
     */
    getLogicStorage(logicId: Hex, key: Hex, option?: LogicStorageOption): Promise<Hex>;
    /**
     * Retrieves the value of a storage key for a logic from ephemeral storage
     *
     * @param logicId The unique identifier for the logic
     * @param key The storage key to retrieve
     * @param address The address of the account to retrieve the storage key from
     * @param option The options for the tesseract reference
     *
     * @returns A promise that resolves to the value of the storage key
     */
    getLogicStorage(logicId: Hex, key: Hex, address: Hex, option?: LogicStorageOption): Promise<Hex>;
    private static isSignedInteraction;
    private ensureValidInteraction;
    /**
     * Simulates an interaction call without committing it to the chain. This method can be
     * used to dry run an interaction to test its validity and estimate its execution effort.
     * It is also a cost effective way to perform read-only logic calls without submitting an
     * interaction.
     *
     * This call does not require participating accounts to notarize the interaction,
     * and no signatures are verified while executing the interaction.
     *
     * @param ix - The interaction object
     * @returns A promise that resolves to the result of the simulation.
     */
    simulate(ix: InteractionRequest): Promise<SimulateResult>;
    /**
     * Simulates an interaction call without committing it to the chain. This method can be
     * used to dry run an interaction to test its validity and estimate its execution effort.
     * It is also a cost effective way to perform read-only logic calls without submitting an
     * interaction.
     *
     * This call does not require participating accounts to notarize the interaction,
     * and no signatures are verified while executing the interaction.
     *
     * @param ix - The POLO encoded interaction submission
     * @returns A promise that resolves to the result of the simulation.
     */
    simulate(serializedIx: Uint8Array): Promise<SimulateResult>;
    /**
     * Submits a signed interaction to the MOI protocol network.
     *
     * @param interaction - The signed interaction to submit.
     * @returns A promise that resolves to the hash of the submitted interaction.
     */
    submit(interaction: SignedInteraction): Promise<Hex>;
    subscribe(event: string, ...params: unknown[]): Promise<string>;
    /**
     * Processes a JSON-RPC response and returns the result.
     * If the response contains an error, it throws an error with the provided message, code, and data.
     *
     * @template T - The type of the result expected from the JSON-RPC response.
     * @param {JsonRpcResponse<T>} response - The JSON-RPC response to process.
     * @returns {T} - The result from the JSON-RPC response.
     *
     * @throws Will throw an error if the response contains an error.
     */
    processJsonRpcResponse<T>(response: JsonRpcResponse<T>): T;
}
export {};
//# sourceMappingURL=provider.d.ts.map