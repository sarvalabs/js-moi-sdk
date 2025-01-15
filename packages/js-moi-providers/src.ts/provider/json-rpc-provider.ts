import {
    AssetId,
    bytesToHex,
    ensureHexPrefix,
    ErrorCode,
    ErrorUtils,
    interaction,
    isHex,
    isValidAddress,
    LogicId,
    StorageKey,
    validateIxRequest,
    type Account,
    type AccountAsset,
    type AccountKey,
    type Address,
    type Asset,
    type Hex,
    type Interaction,
    type InteractionRequest,
    type JsonRpcResponse,
    type Logic,
    type LogicMessage,
    type NetworkInfo,
    type Simulate,
    type Tesseract,
    type TesseractReference,
    type Transport,
} from "js-moi-utils";

import { EventEmitter } from "events";
import type { MethodParams, MethodResponse, NetworkMethod } from "../types/moi-execution-api";
import type {
    AccountAssetRequestOption,
    AccountKeyRequestOption,
    AccountRequestOption,
    AssetRequestOption,
    ExecuteIx,
    GetNetworkInfoOption,
    InteractionRequestOption,
    LogicMessageRequestOption,
    LogicRequestOption,
    LogicStorageRequestOption,
    Provider,
    SelectFromResponseModifier,
    Signature,
    SimulateOption,
    TesseractRequestOption,
} from "../types/provider";
import { InteractionResponse } from "../utils/interaction-response";

export class JsonRpcProvider extends EventEmitter implements Provider {
    private readonly _transport: Transport;

    /**
     * Creates a new instance of the provider.
     *
     * @param transport - The transport to use for communication with the network.
     */
    public constructor(transport: Transport) {
        super();

        if (transport == null) {
            ErrorUtils.throwError("Transport is required", ErrorCode.INVALID_ARGUMENT);
        }

        this._transport = transport;
    }

    /**
     * The transport used to communicate with the network.
     */
    public get transport(): Transport {
        return this._transport;
    }

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
    protected async call<TMethod extends NetworkMethod, TResponse extends any = MethodResponse<TMethod>>(method: TMethod, ...params: MethodParams<TMethod>): Promise<TResponse> {
        const response = await this.request<TResponse>(method, params);
        return this.processJsonRpcResponse(response);
    }

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
    public async request<T>(method: string, params: unknown[] = []): Promise<JsonRpcResponse<T>> {
        return await this.transport.request<T>(method, params);
    }

    /**
     * Retrieves the version and chain id of the MOI protocol network.
     *
     * @returns A promise that resolves to the Moi client version.
     */
    public async getNetworkInfo<TOption extends GetNetworkInfoOption>(option?: TOption): Promise<SelectFromResponseModifier<NetworkInfo, TOption>> {
        return await this.call<"moi.Protocol", SelectFromResponseModifier<NetworkInfo, TOption>>("moi.Protocol", option);
    }

    public async simulate(interaction: Uint8Array | Hex, option?: SimulateOption): Promise<Simulate>;
    public async simulate(ix: InteractionRequest, option?: SimulateOption): Promise<Simulate>;
    public async simulate(ix: InteractionRequest | Uint8Array | Hex, option?: SimulateOption): Promise<Simulate> {
        let encodedIxArgs: Hex;

        switch (true) {
            case ix instanceof Uint8Array: {
                encodedIxArgs = bytesToHex(ix);
                break;
            }

            case typeof ix === "object": {
                const result = validateIxRequest(ix);

                if (result != null) {
                    ErrorUtils.throwError(`Invalid interaction request: ${result.message}`, ErrorCode.INVALID_ARGUMENT, { ...result });
                }

                encodedIxArgs = bytesToHex(interaction(<InteractionRequest>ix));
                break;
            }

            case typeof ix === "string": {
                if (!isHex(ix)) {
                    ErrorUtils.throwArgumentError("Must be a valid hex string", "interaction", ix);
                }

                encodedIxArgs = ix;
                break;
            }

            default: {
                ErrorUtils.throwError("Invalid argument for method signature", ErrorCode.INVALID_ARGUMENT);
            }
        }

        return await this.call("moi.Simulate", {
            interaction: encodedIxArgs,
            ...option,
        });
    }

    async getAccount<TOption extends AccountRequestOption>(identifier: Address, option?: TOption): Promise<SelectFromResponseModifier<Account, TOption>> {
        if (!isValidAddress(identifier)) {
            ErrorUtils.throwArgumentError("Must be a valid address", "identifier", identifier);
        }

        return await this.call("moi.Account", { identifier, ...option });
    }

    private async getTesseractByReference<TOption extends TesseractRequestOption>(
        reference: TesseractReference,
        option?: TOption
    ): Promise<SelectFromResponseModifier<Tesseract, TOption>> {
        return await this.call("moi.Tesseract", {
            reference: reference,
            ...option,
        });
    }

    public getTesseract<TOption extends TesseractRequestOption>(identifier: Address, height: number, option?: TOption): Promise<SelectFromResponseModifier<Tesseract, TOption>>;
    public getTesseract<TOption extends TesseractRequestOption>(tesseract: Hex, option?: TOption): Promise<SelectFromResponseModifier<Tesseract, TOption>>;
    public getTesseract<TOption extends TesseractRequestOption>(reference: TesseractReference, option?: TOption): Promise<SelectFromResponseModifier<Tesseract, TOption>>;
    public async getTesseract<TOption extends TesseractRequestOption>(
        identifier: Hex | TesseractReference,
        height?: number | TOption,
        option?: TOption
    ): Promise<SelectFromResponseModifier<Tesseract, TOption>> {
        const isValidOption = (option: unknown): option is TOption => typeof option === "undefined" || typeof option === "object";

        switch (true) {
            case isValidAddress(identifier) && typeof height === "number" && isValidOption(option): {
                // Getting tesseract by address and height

                if (Number.isNaN(height) || height < -1) {
                    ErrorUtils.throwError("Invalid height value", ErrorCode.INVALID_ARGUMENT);
                }

                return await this.getTesseractByReference({ relative: { identifier: identifier, height } }, option);
            }

            case typeof identifier === "object" && isValidOption(height): {
                // Getting tesseract by reference

                return await this.getTesseractByReference(identifier, height);
            }

            case typeof identifier === "string" && isValidOption(height): {
                // Getting tesseract by hash

                return await this.getTesseractByReference({ absolute: identifier }, height);
            }
        }

        ErrorUtils.throwError("Invalid arguments passed to get correct method signature", ErrorCode.INVALID_ARGUMENT);
    }

    getLogic<TOption extends LogicRequestOption>(identifier: Address, option?: TOption): Promise<SelectFromResponseModifier<Logic, TOption>>;
    getLogic<TOption extends LogicRequestOption>(identifier: LogicId, option?: TOption): Promise<SelectFromResponseModifier<Logic, TOption>>;
    getLogic<TOption extends LogicRequestOption>(value: Address | LogicId, option?: TOption): Promise<SelectFromResponseModifier<Logic, TOption>> {
        const identifier = typeof value === "string" ? value : value.getAddress();

        if (!isValidAddress(identifier)) {
            ErrorUtils.throwArgumentError("Must be a valid address", "identifier", identifier);
        }

        return this.call("moi.Logic", { identifier, ...option });
    }

    async getLogicStorage(logicId: Hex | LogicId, storageId: Hex | StorageKey, option?: LogicStorageRequestOption): Promise<Hex>;
    async getLogicStorage(logicId: Hex | LogicId, address: Address, storageKey: Hex | StorageKey, option?: LogicStorageRequestOption): Promise<Hex>;
    async getLogicStorage(
        logicId: Hex | LogicId,
        address: Hex | Address | StorageKey,
        storageId?: Hex | StorageKey | LogicStorageRequestOption,
        option?: LogicStorageRequestOption
    ): Promise<Hex> {
        const logicID = typeof logicId === "string" ? new LogicId(logicId) : logicId;

        let params: MethodParams<"moi.LogicStorage">;

        switch (true) {
            case typeof storageId === "undefined" || (typeof storageId === "object" && !(storageId instanceof StorageKey)): {
                // Getting logic storage by logic id and storage key
                const id: Hex = typeof address === "string" ? address : address.hex();

                params = [{ storage_id: id, logic_id: logicID.value, ...storageId }];
                break;
            }

            case typeof storageId === "string":
            case storageId instanceof StorageKey: {
                // Getting logic storage by logic id, address, and storage key

                if (!isValidAddress(address)) {
                    ErrorUtils.throwArgumentError("Must be a valid address", "address", address);
                }
                const id: Hex = typeof storageId === "string" ? storageId : storageId.hex();

                params = [{ storage_id: id, logic_id: logicID.value, address, ...option }];
                break;
            }

            default: {
                ErrorUtils.throwError("Invalid arguments passed to get correct method signature", ErrorCode.INVALID_ARGUMENT);
            }
        }

        return ensureHexPrefix(await this.call("moi.LogicStorage", ...params));
    }

    async getAsset<TOption extends AssetRequestOption>(assetId: AssetId, option?: TOption): Promise<SelectFromResponseModifier<Asset, TOption>>;
    async getAsset<TOption extends AssetRequestOption>(identifier: Address, option?: TOption): Promise<SelectFromResponseModifier<Asset, TOption>>;
    async getAsset<TOption extends AssetRequestOption>(identifier: Address | AssetId, option?: TOption): Promise<SelectFromResponseModifier<Asset, TOption>> {
        if (typeof identifier === "string" && !isValidAddress(identifier)) {
            ErrorUtils.throwArgumentError("Must be a valid address", "identifier", identifier);
        }
        const address = typeof identifier === "string" ? identifier : identifier.getAddress();
        return await this.call("moi.Asset", { identifier: address, ...option });
    }

    async getLogicMessage(logicId: LogicId | Hex, options?: LogicMessageRequestOption): Promise<LogicMessage[]> {
        const id = typeof logicId === "string" ? new LogicId(logicId) : logicId;

        return await this.call("moi.LogicMessage", { logic_id: id.value, ...options });
    }

    async getAccountAsset<TOption extends AccountAssetRequestOption>(
        identifier: Address,
        assetId: Hex | AssetId,
        option?: TOption
    ): Promise<SelectFromResponseModifier<AccountAsset, TOption>> {
        if (!isValidAddress(identifier)) {
            ErrorUtils.throwArgumentError("Must be a valid address", "identifier", identifier);
        }

        const { value } = typeof assetId === "string" ? new AssetId(assetId) : assetId;

        return await this.call("moi.AccountAsset", { identifier, asset_id: value, ...option });
    }

    async getAccountKey(identifier: Address, index: number, option?: AccountKeyRequestOption): Promise<AccountKey> {
        if (!isValidAddress(identifier)) {
            ErrorUtils.throwArgumentError("Must be a valid address", "identifier", identifier);
        }

        if (Number.isNaN(index) || index < 0) {
            ErrorUtils.throwArgumentError("Must be a non-negative integer", "index", index);
        }

        return await this.call("moi.AccountKey", { identifier, key_idx: index, ...option });
    }

    execute(ix: Uint8Array | Hex, signatures: Signature[]): Promise<InteractionResponse>;
    execute(ix: ExecuteIx): Promise<InteractionResponse>;
    async execute(ix: Uint8Array | Hex | ExecuteIx, signatures?: Signature[]): Promise<InteractionResponse> {
        let params: MethodParams<"moi.Execute">;

        switch (true) {
            case ix instanceof Uint8Array: {
                if (!signatures || !Array.isArray(signatures)) {
                    ErrorUtils.throwError("No signatures provided", ErrorCode.INVALID_ARGUMENT);
                }

                params = [{ interaction: bytesToHex(ix), signatures }];
                break;
            }

            case typeof ix === "object": {
                if (ix.interaction == null) {
                    ErrorUtils.throwError("No interaction provided", ErrorCode.INVALID_ARGUMENT);
                }

                if (!ix.signatures || !Array.isArray(ix.signatures)) {
                    ErrorUtils.throwError("No signatures provided", ErrorCode.INVALID_ARGUMENT);
                }

                params = [ix];
                break;
            }

            default: {
                ErrorUtils.throwError("Invalid argument for method signature", ErrorCode.INVALID_ARGUMENT);
            }
        }

        const hash = await this.call("moi.Execute", ...params);
        return new InteractionResponse(hash, this);
    }

    getInteraction<TOption extends InteractionRequestOption>(hash: Hex, option?: TOption): Promise<SelectFromResponseModifier<Interaction, TOption>> {
        return this.call("moi.Interaction", { hash, ...option });
    }

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
    public processJsonRpcResponse<T>(response: JsonRpcResponse<T>): T {
        if ("error" in response) {
            const { data } = response.error;
            const params = data ? (typeof data === "object" ? data : { data }) : {};
            ErrorUtils.throwError(response.error.message, response.error.code, params);
        }

        return response.result;
    }
}
