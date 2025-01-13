import { LogicId, StorageKey, type Account, type Address, type Hex, type InteractionRequest, type JsonRpcResponse, type Logic, type NetworkInfo, type Simulate, type Tesseract, type TesseractReference, type Transport } from "js-moi-utils";
import { EventEmitter } from "events";
import type { MethodParams, MethodResponse, NetworkMethod } from "../types/moi-execution-api";
import type { AccountRequestOption, GetNetworkInfoOption, LogicRequestOption, LogicStorageRequestOption, Provider, SelectFromResponseModifier, SimulateOption, TesseractRequestOption } from "../types/provider";
export declare class JsonRpcProvider extends EventEmitter implements Provider {
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
    protected call<TMethod extends NetworkMethod, TResponse extends any = MethodResponse<TMethod>>(method: TMethod, ...params: MethodParams<TMethod>): Promise<TResponse>;
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
    getNetworkInfo<TOption extends GetNetworkInfoOption>(option?: TOption): Promise<SelectFromResponseModifier<NetworkInfo, TOption>>;
    simulate(interaction: Uint8Array | Hex, option?: SimulateOption): Promise<Simulate>;
    simulate(ix: InteractionRequest, option?: SimulateOption): Promise<Simulate>;
    getAccount<TOption extends AccountRequestOption>(identifier: Address, option?: TOption): Promise<SelectFromResponseModifier<Account, TOption>>;
    private getTesseractByReference;
    getTesseract<TOption extends TesseractRequestOption>(identifier: Address, height: number, option?: TOption): Promise<SelectFromResponseModifier<Tesseract, TOption>>;
    getTesseract<TOption extends TesseractRequestOption>(tesseract: Hex, option?: TOption): Promise<SelectFromResponseModifier<Tesseract, TOption>>;
    getTesseract<TOption extends TesseractRequestOption>(reference: TesseractReference, option?: TOption): Promise<SelectFromResponseModifier<Tesseract, TOption>>;
    getLogic<TOption extends LogicRequestOption>(identifier: Address, option?: TOption): Promise<SelectFromResponseModifier<Logic, TOption>>;
    getLogic<TOption extends LogicRequestOption>(identifier: LogicId, option?: TOption): Promise<SelectFromResponseModifier<Logic, TOption>>;
    getLogicStorage(logicId: Hex | LogicId, storageId: Hex | StorageKey, option?: LogicStorageRequestOption): Promise<Hex>;
    getLogicStorage(logicId: Hex | LogicId, address: Address, storageKey: Hex | StorageKey, option?: LogicStorageRequestOption): Promise<Hex>;
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
//# sourceMappingURL=json-rpc-provider.d.ts.map