import { EventEmitter } from "events";
import { Identifier } from "js-moi-identifiers";
import {
    AssetId,
    bytesToHex,
    ErrorCode,
    ErrorUtils,
    hexToHash,
    interaction,
    isAddress,
    isHex,
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
import { Polorizer } from "js-polo";
import type { MethodParams, MethodResponse, NestedArray, NetworkMethod } from "../types/moi-execution-api";
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
    SimulateInteractionRequest,
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
    public async simulate(ix: SimulateInteractionRequest, option?: SimulateOption): Promise<Simulate>;
    public async simulate(ix: SimulateInteractionRequest | Uint8Array | Hex, option?: SimulateOption): Promise<Simulate> {
        let encodedIxArgs: Hex;

        switch (true) {
            case ix instanceof Uint8Array: {
                encodedIxArgs = bytesToHex(ix);
                break;
            }

            case typeof ix === "object": {
                if (!("fuel_limit" in ix)) {
                    console.warn("Simulating interaction should not take a fuel limit.\nFor simulation, fuel limit not provided. Using default value 1.");
                    ix["fuel_limit"] = 1;
                }
                const result = validateIxRequest("moi.Simulate", ix);

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

    async getAccount<TOption extends AccountRequestOption>(identifier: Identifier, option?: TOption): Promise<SelectFromResponseModifier<Account, TOption>> {
        return await this.call("moi.Account", { identifier: identifier.toHex(), ...option });
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
            case isAddress(identifier) && typeof height === "number" && isValidOption(option): {
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

    getLogic<TOption extends LogicRequestOption>(identifier: Identifier, option?: TOption): Promise<SelectFromResponseModifier<Logic, TOption>> {
        return this.call("moi.Logic", { identifier: identifier.toHex(), ...option });
    }

    async getLogicStorage(logicId: Identifier, storageId: Hex | StorageKey, option?: LogicStorageRequestOption): Promise<Hex>;
    async getLogicStorage(logicId: Identifier, address: Identifier, storageKey: Hex | StorageKey, option?: LogicStorageRequestOption): Promise<Hex>;
    async getLogicStorage(
        logicId: Identifier,
        address: Hex | Identifier | StorageKey,
        storageId?: Hex | StorageKey | LogicStorageRequestOption,
        option?: LogicStorageRequestOption
    ): Promise<Hex> {
        let params: MethodParams<"moi.LogicStorage">;

        switch (true) {
            case isHex(address) || address instanceof StorageKey: {
                // getting value from persistent storage
                params = [{ logic_id: logicId.toHex(), storage_id: address instanceof StorageKey ? address.hex() : address, ...option }];
                break;
            }

            case address instanceof Identifier: {
                // getting value from ephemeral storage
                if (storageId == null) {
                    ErrorUtils.throwArgumentError("Storage key is required", "storageId", storageId);
                }

                if (!(storageId instanceof StorageKey) && !isHex(storageId)) {
                    ErrorUtils.throwArgumentError("Storage key must be a valid hex string or StorageKey instance", "storageId", storageId);
                }

                const storageIdHex = storageId instanceof StorageKey ? storageId.hex() : storageId;
                params = [{ logic_id: logicId.toHex(), address: address.toHex(), storage_id: storageIdHex, ...option }];
                break;
            }

            default: {
                ErrorUtils.throwError("Invalid arguments passed to get correct method signature", ErrorCode.INVALID_ARGUMENT);
            }
        }

        return await this.call("moi.LogicStorage", ...params);
    }

    async getAsset<TOption extends AssetRequestOption>(identifier: Identifier, option?: TOption): Promise<SelectFromResponseModifier<Asset, TOption>> {
        return await this.call("moi.Asset", { identifier: identifier.toHex(), ...option });
    }

    private encodeTopics(topics: NestedArray<string>): NestedArray<Hex> {
        const encodedTopics = Array.from<any>({ length: topics.length });

        for (let i = 0; i < topics.length; i++) {
            const topic = topics[i];

            if (typeof topic === "string") {
                const polorizer = new Polorizer();
                polorizer.polorizeString(topic);
                encodedTopics[i] = hexToHash(polorizer.bytes());
                continue;
            }

            encodedTopics[i] = this.encodeTopics(topic);
        }

        return encodedTopics;
    }

    async getLogicMessage(logicId: Identifier, options?: LogicMessageRequestOption): Promise<LogicMessage[]> {
        return await this.call("moi.LogicMessage", { logic_id: logicId.toHex(), ...options, topics: options?.topics == null ? undefined : this.encodeTopics(options.topics) });
    }

    async getAccountAsset<TOption extends AccountAssetRequestOption>(
        identifier: Address,
        assetId: Hex | AssetId,
        option?: TOption
    ): Promise<SelectFromResponseModifier<AccountAsset, TOption>> {
        if (!isAddress(identifier)) {
            ErrorUtils.throwArgumentError("Must be a valid address", "identifier", identifier);
        }

        const { value } = typeof assetId === "string" ? new AssetId(assetId) : assetId;

        return await this.call("moi.AccountAsset", { identifier, asset_id: value, ...option });
    }

    async getAccountKey(identifier: Identifier, index: number, option?: AccountKeyRequestOption): Promise<AccountKey> {
        if (Number.isNaN(index) || index < 0) {
            ErrorUtils.throwArgumentError("Must be a non-negative integer", "index", index);
        }

        return await this.call("moi.AccountKey", {
            identifier: identifier.toHex(),
            key_idx: index,
            ...option,
        });
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

    async subscribe(event: string, params?: unknown): Promise<void> {
        throw new Error("Method not implemented. Return type needs to be updated");
        // return await this.call("moi.Subscribe", event, params);
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
