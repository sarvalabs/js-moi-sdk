import { ErrorCode, ErrorUtils, isAddress, isHex, type Hex, type InteractionRequest } from "js-moi-utils";

import EventEmitter from "events";
import type { JsonRpcResponse } from "./types/json-rpc";
import type { AccountAsset, Confirmation, RpcMethod, RpcMethodParams, RpcMethodResponse } from "./types/moi-rpc-method";
import type { MoiClientInfo, RelativeTesseractOption, SignedInteraction, TesseractIncludeFields, TesseractReference } from "./types/shared";
import type { Transport } from "./types/transport";

type LogicStorageOption = Omit<RpcMethodParams<"moi.LogicStorage">[0], "logic_id" | "storage_key" | "address">;

export class Provider extends EventEmitter {
    private readonly _transport: Transport;

    public constructor(transport: Transport) {
        super();

        if (transport == null) {
            ErrorUtils.throwError("Transport is required", ErrorCode.INVALID_ARGUMENT);
        }

        this._transport = transport;
    }

    public get transport(): Transport {
        return this._transport;
    }

    protected async execute<T extends RpcMethod>(method: T, ...params: RpcMethodParams<T>): Promise<RpcMethodResponse<T>> {
        const response = await this._transport.request<RpcMethodResponse<T>>(method, params);
        return this.processJsonRpcResponse(response);
    }

    public async request<T>(method: string, params: unknown[] = []): Promise<JsonRpcResponse<T>> {
        return await this._transport.request<T>(method, params);
    }

    /**
     * Retrieves the version and chain id of the MOI protocol network.
     *
     * @returns A promise that resolves to the Moi client version.
     */
    public async getVersion(): Promise<MoiClientInfo> {
        return await this.execute("moi.Version");
    }

    private async getTesseractByReference(reference: TesseractReference, include: TesseractIncludeFields = []): Promise<unknown> {
        return await this.execute("moi.Tesseract", { reference, include });
    }

    private async getTesseractByHash(hash: Hex, include?: TesseractIncludeFields): Promise<unknown> {
        return await this.getTesseractByReference({ absolute: hash }, include);
    }

    private async getTesseractByAddressAndHeight(address: Hex, height: number, include?: TesseractIncludeFields): Promise<unknown> {
        if (height < -1) {
            ErrorUtils.throwError("Invalid height value", ErrorCode.INVALID_ARGUMENT);
        }

        return await this.getTesseractByReference({ relative: { address, height } }, include);
    }

    /**
     * Retrieves a tesseract by its hash
     *
     * @param hash - The hash of the tesseract to retrieve.
     * @param include - The fields to include in the response.
     * @returns A promise that resolves to the tesseract.
     */
    public getTesseract(hash: Hex, include?: TesseractIncludeFields): Promise<unknown>;
    /**
     * Retrieves a tesseract by its address and height
     *
     * @param address - The address of the account that the tesseract is a part of.
     * @param height - The height of the tesseract on the account. The 0 & -1 values can be used to retrieve the oldest and latest tesseracts for the account respectively.
     * @param include - The fields to include in the response.
     *
     * @returns A promise that resolves to the tesseract.
     */
    public getTesseract(address: Hex, height: number, include?: TesseractIncludeFields): Promise<unknown>;
    /**
     * Retrieves a tesseract by its relative reference
     *
     * @param relativeRef - The relative reference of the tesseract to retrieve.
     * @param include - The fields to include in the response.
     *
     * @returns A promise that resolves to the tesseract.
     */
    public getTesseract(relativeRef: RelativeTesseractOption, include?: TesseractIncludeFields): Promise<unknown>;
    public async getTesseract(hashOrAddress: Hex | RelativeTesseractOption, heightOrInclude?: number | TesseractIncludeFields, include?: TesseractIncludeFields): Promise<unknown> {
        if (typeof hashOrAddress === "object" && (heightOrInclude == null || Array.isArray(heightOrInclude))) {
            return await this.getTesseractByAddressAndHeight(hashOrAddress.address, hashOrAddress.height, heightOrInclude);
        }

        if (isAddress(hashOrAddress) && typeof heightOrInclude === "number") {
            return await this.getTesseractByAddressAndHeight(hashOrAddress, heightOrInclude, include);
        }

        if (isHex(hashOrAddress) && (heightOrInclude == null || Array.isArray(heightOrInclude))) {
            return await this.getTesseractByHash(hashOrAddress, heightOrInclude);
        }

        ErrorUtils.throwError("Invalid argument for method signature", ErrorCode.INVALID_ARGUMENT);
    }

    /**
     * Retrieves an interaction by its hash.
     *
     * @param hash - The hash of the interaction to retrieve.
     * @returns A promise that resolves to the interaction.
     */
    public async getInteraction(hash: Hex): Promise<unknown> {
        return await this.execute("moi.Interaction", { hash });
    }

    /**
     * Retrieves information about an account.
     *
     * @param address The address that uniquely identifies the account
     * @param option The options to include and reference
     * @returns A promise that resolves to the account information
     */
    public async getAccount(address: Hex, option?: Omit<RpcMethodParams<"moi.Account">[0], "address">): Promise<unknown> {
        return await this.execute("moi.Account", { address, ...option });
    }

    /**
     * Retrieves the account key for an account.
     *
     * @param address The address that uniquely identifies the account
     * @param keyId The key id that uniquely identifies the account key
     * @param pending Whether to include pending account keys
     *
     * @returns A promise that resolves to the account information for the provided key id
     */
    public async getAccountKey(address: Hex, keyId: number, pending?: boolean) {
        return await this.execute("moi.AccountKey", {
            address,
            key_id: keyId,
            pending,
        });
    }

    /**
     * Retrieves the balances, mandates and deposits for a specific asset on an account
     *
     * @param address The address that uniquely identifies the account
     * @param assetId The asset id that uniquely identifies the asset
     * @param option The options to include and reference
     *
     * @returns A promise that resolves to the account asset information
     */
    public async getAccountAsset(address: Hex, assetId: Hex, option?: Omit<RpcMethodParams<"moi.AccountAsset">[0], "asset_id">): Promise<AccountAsset[]> {
        return await this.execute("moi.AccountAsset", {
            address,
            asset_id: assetId,
            ...option,
        });
    }

    /**
     * Retrieves the interaction confirmation
     *
     * @param hash The hash of the interaction to retrieve the confirmation.
     * @returns A promise that resolves to object containing the confirmation information.
     */
    public async getConfirmation(hash: Hex): Promise<Confirmation> {
        return await this.execute("moi.Confirmation", { hash });
    }

    /**
     * Retrieves information about an asset
     *
     * @param assetId The asset id that uniquely identifies the asset
     * @param option The options to include and reference
     *
     * @returns A promise that resolves to the asset information
     */
    public async getAsset(assetId: Hex, option?: Omit<RpcMethodParams<"moi.Asset">[0], "asset_id">): Promise<unknown> {
        return await this.execute("moi.Asset", { asset_id: assetId, ...option });
    }

    /**
     * Retrieves information about a logic
     *
     * @param logicId A unique identifier for the logic
     * @param option The options for the tesseract reference
     *
     * @returns A promise that resolves to the logic information
     */
    public async getLogic(logicId: Hex, option?: Omit<RpcMethodParams<"moi.Logic">[0], "logic_id">): Promise<unknown> {
        return await this.execute("moi.Logic", { logic_id: logicId, ...option });
    }

    /**
     * Retrieves the value of a storage key for a logic from persistent storage
     *
     * @param logicId The unique identifier for the logic
     * @param key The storage key to retrieve
     * @param option The options for the tesseract reference
     *
     * @returns A promise that resolves to the value of the storage key
     */
    public async getLogicStorage(logicId: Hex, key: Hex, option?: LogicStorageOption): Promise<Hex>;
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
    public async getLogicStorage(logicId: Hex, key: Hex, address: Hex, option?: LogicStorageOption): Promise<Hex>;
    public async getLogicStorage(logicId: Hex, key: Hex, addressOrOption?: Hex | LogicStorageOption, option?: LogicStorageOption): Promise<Hex> {
        let params: RpcMethodParams<"moi.LogicStorage"> | undefined;

        if (addressOrOption == null || typeof addressOrOption === "object") {
            params = [{ logic_id: logicId, storage_key: key, ...addressOrOption }];
        }

        if (isAddress(addressOrOption)) {
            params = [
                {
                    logic_id: logicId,
                    storage_key: key,
                    address: addressOrOption,
                    ...option,
                },
            ];
        }

        if (params == null) {
            ErrorUtils.throwError("Invalid argument for method signature", ErrorCode.INVALID_ARGUMENT);
        }

        return await this.execute("moi.LogicStorage", ...params);
    }

    private static isSignedInteraction(ix: unknown): ix is SignedInteraction {
        if (typeof ix !== "object" || ix == null) {
            return false;
        }

        if (!("interaction" in ix) || typeof ix.interaction !== "string") {
            return false;
        }

        if (!("signatures" in ix) || !Array.isArray(ix.signatures)) {
            return false;
        }

        return true;
    }

    public async simulate(interaction: InteractionRequest) {
        throw new Error("Method not implemented.");
    }

    /**
     * Submits a signed interaction to the MOI protocol network.
     *
     * @param interaction - The signed interaction to submit.
     * @returns A promise that resolves to the hash of the submitted interaction.
     */
    public async submit(interaction: SignedInteraction): Promise<Hex> {
        let ix: SignedInteraction | undefined;

        if (Provider.isSignedInteraction(interaction)) {
            ix = interaction;
        }

        if (ix == null) {
            ErrorUtils.throwError("Invalid argument for method signature", ErrorCode.INVALID_ARGUMENT);
        }

        if (!isHex(ix.interaction)) {
            ErrorUtils.throwArgumentError("Must be a valid hex string", "interaction", ix.interaction);
        }

        if (ix.signatures.length === 0) {
            ErrorUtils.throwError("Interaction must be have at least one signature", ErrorCode.INVALID_SIGNATURE);
        }

        return await this.execute("moi.Submit", {
            interaction: ix.interaction,
            signatures: ix.signatures,
        });
    }

    public async subscribe(event: string, ...params: unknown[]): Promise<string> {
        return await this.execute("moi.Subscribe", [event, ...params]);
    }

    /**
     * Processes a JSON-RPC response and returns the result.
     * If the response contains an error, it throws an error with the provided message, code, and data.
     *
     * @template T - The type of the result expected from the JSON-RPC response.
     * @param {JsonRpcResponse<T>} response - The JSON-RPC response to process.
     * @returns {T} - The result from the JSON-RPC response.
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
