import { type Hex } from "js-moi-utils";
import type { JsonRpcResponse } from "./types/json-rpc.ts";
import type { RpcMethod, RpcMethodParams, RpcMethodResponse } from "./types/moi-rpc-spec.d.ts";
import type { TesseractIncludes, TesseractReference, TesseractReferenceOption, Transport } from "./types/provider.d.ts";
import type { ClientTesseractReference, IncludesParam, MoiClientInfo, RelativeTesseractOption } from "./types/shared.d.ts";
export declare class Provider {
    private readonly transport;
    constructor(transport: Transport);
    protected execute<T extends RpcMethod>(method: T, ...params: RpcMethodParams<T>): Promise<RpcMethodResponse<T>>;
    request<T>(method: string, ...params: unknown[]): Promise<JsonRpcResponse<T>>;
    /**
     * Retrieves the version and chain id of the MOI protocol network.
     *
     * @returns A promise that resolves to the Moi client version.
     */
    getVersion(): Promise<MoiClientInfo>;
    private getTesseractByReference;
    private getTesseractByHash;
    private getTesseractByAddressAndHeight;
    /**
     * Retrieves a tesseract by its hash
     *
     * @param tesseractHash - The hash of the tesseract to retrieve.
     * @param include - The fields to include in the response.
     * @returns A promise that resolves to the tesseract.
     */
    getTesseract(tesseractHash: Hex, include?: TesseractIncludes): Promise<unknown>;
    /**
     * Retrieves a tesseract by its address and height
     *
     * @param address - The address of the account that the tesseract is a part of.
     * @param height - The height of the tesseract on the account. The 0 & -1 values can be used to retrieve the oldest and latest tesseracts for the account respectively.
     * @param include - The fields to include in the response.
     *
     * @returns A promise that resolves to the tesseract.
     */
    getTesseract(address: Hex, height: number, include?: TesseractIncludes): Promise<unknown>;
    /**
     * Retrieves a tesseract by its relative reference
     *
     * @param relativeRef - The relative reference of the tesseract to retrieve.
     * @param include - The fields to include in the response.
     *
     * @returns A promise that resolves to the tesseract.
     */
    getTesseract(relativeRef: RelativeTesseractOption, include?: TesseractIncludes): Promise<unknown>;
    /**
     * Retrieves an interaction by its hash.
     *
     * @param hash - The hash of the interaction to retrieve.
     * @returns A promise that resolves to the interaction.
     */
    getInteraction(hash: Hex): Promise<unknown>;
    /**
     * Retrieves information about an account.
     *
     * @param address The address that uniquely identifies the account
     * @param option The options to include and reference
     * @returns A promise that resolves to the account information
     */
    getAccount(address: Hex, option?: TesseractReferenceOption & IncludesParam<"moi.Account">): Promise<unknown>;
    /**
     * Retrieves the account key for an account.
     *
     * @param address The address that uniquely identifies the account
     * @param keyId The key id that uniquely identifies the account key
     * @param pending Whether to include pending account keys
     *
     * @returns A promise that resolves to the account information for the provided key id
     */
    getAccountKey(address: Hex, keyId: number, pending?: boolean): Promise<{
        key_data: unknown;
    }>;
    /**
     * Retrieves the balances, mandates and deposits for a specific asset on an account
     *
     * @param address The address that uniquely identifies the account
     * @param assetId The asset id that uniquely identifies the asset
     * @param option The options to include and reference
     *
     * @returns A promise that resolves to the account asset information
     */
    getAccountAsset(address: Hex, assetId: Hex, option?: TesseractReferenceOption & IncludesParam<"moi.AccountAsset">): Promise<unknown>;
    /**
     * Retrieves information about an asset
     *
     * @param assetId The asset id that uniquely identifies the asset
     * @param option The options to include and reference
     *
     * @returns A promise that resolves to the asset information
     */
    getAsset(assetId: Hex, option?: TesseractReferenceOption): Promise<unknown>;
    /**
     * Retrieves information about a logic
     *
     * @param logicId A unique identifier for the logic
     * @param option The options for the tesseract reference
     *
     * @returns A promise that resolves to the logic information
     */
    getLogic(logicId: Hex, option?: TesseractReferenceOption): Promise<unknown>;
    /**
     * Retrieves the value of a storage key for a logic from persistent storage
     *
     * @param logicId The unique identifier for the logic
     * @param key The storage key to retrieve
     * @param option The options for the tesseract reference
     *
     * @returns A promise that resolves to the value of the storage key
     */
    getLogicStorage(logicId: Hex, key: Hex, option?: TesseractReferenceOption): Promise<Hex>;
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
    getLogicStorage(logicId: Hex, key: Hex, address: Hex, option?: TesseractReferenceOption): Promise<Hex>;
    /**
     * Processes a JSON-RPC response and returns the result.
     * If the response contains an error, it throws an error with the provided message, code, and data.
     *
     * @template T - The type of the result expected from the JSON-RPC response.
     * @param {JsonRpcResponse<T>} response - The JSON-RPC response to process.
     * @returns {T} - The result from the JSON-RPC response.
     * @throws Will throw an error if the response contains an error.
     */
    protected static processJsonRpcResponse<T>(response: JsonRpcResponse<T>): T;
    /**
     * Processes a Tesseract reference and returns a `ClientTesseractReference`.
     *
     * @param reference - The Tesseract reference to process. It can be either an absolute or relative reference.
     * @returns A `ClientTesseractReference` object containing either an absolute or relative reference.
     */
    protected static processTesseractReference(reference: TesseractReference): ClientTesseractReference;
}
//# sourceMappingURL=provider.d.ts.map