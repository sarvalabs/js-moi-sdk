"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonRpcProvider = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const events_1 = require("events");
class JsonRpcProvider extends events_1.EventEmitter {
    _transport;
    /**
     * Creates a new instance of the provider.
     *
     * @param transport - The transport to use for communication with the network.
     */
    constructor(transport) {
        super();
        if (transport == null) {
            js_moi_utils_1.ErrorUtils.throwError("Transport is required", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        this._transport = transport;
    }
    /**
     * The transport used to communicate with the network.
     */
    get transport() {
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
    async call(method, ...params) {
        const response = await this.request(method, params);
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
    async request(method, params = []) {
        return await this.transport.request(method, params);
    }
    /**
     * Retrieves the version and chain id of the MOI protocol network.
     *
     * @returns A promise that resolves to the Moi client version.
     */
    async getNetworkInfo(option) {
        return await this.call("moi.Protocol", option);
    }
    async simulate(ix, option) {
        let encodedIxArgs;
        switch (true) {
            case ix instanceof Uint8Array: {
                encodedIxArgs = (0, js_moi_utils_1.bytesToHex)(ix);
                break;
            }
            case typeof ix === "object": {
                const result = (0, js_moi_utils_1.validateIxRequest)(ix);
                if (result != null) {
                    js_moi_utils_1.ErrorUtils.throwError(`Invalid interaction request: ${result.message}`, js_moi_utils_1.ErrorCode.INVALID_ARGUMENT, { ...result });
                }
                encodedIxArgs = (0, js_moi_utils_1.bytesToHex)((0, js_moi_utils_1.interaction)(ix));
                break;
            }
            case typeof ix === "string": {
                if (!(0, js_moi_utils_1.isHex)(ix)) {
                    js_moi_utils_1.ErrorUtils.throwArgumentError("Must be a valid hex string", "interaction", ix);
                }
                encodedIxArgs = ix;
                break;
            }
            default: {
                js_moi_utils_1.ErrorUtils.throwError("Invalid argument for method signature", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
            }
        }
        return await this.call("moi.Simulate", { interaction: encodedIxArgs, ...option });
    }
    // private async getTesseractByReference(reference: TesseractReference): Promise<Tesseract> {
    //     return await this.call("moi.Tesseract", { reference });
    // }
    // private async getTesseractByHash(hash: Hex): Promise<Tesseract> {
    //     return await this.getTesseractByReference({ absolute: hash });
    // }
    // private async getTesseractByAddressAndHeight(address: Address, height: number): Promise<Tesseract> {
    //     if (height < -1) {
    //         ErrorUtils.throwError("Invalid height value", ErrorCode.INVALID_ARGUMENT);
    //     }
    //     return await this.getTesseractByReference({ relative: { identifier: address, height } });
    // }
    // /**
    //  * Retrieves a tesseract by its hash
    //  *
    //  * @param hash - The hash of the tesseract to retrieve.
    //  * @param include - The fields to include in the response.
    //  * @returns A promise that resolves to the tesseract.
    //  */
    // public getTesseract(hash: Hex, include?: TesseractIncludeFields): Promise<Tesseract>;
    // /**
    //  * Retrieves a tesseract by its address and height
    //  *
    //  * @param address - The address of the account that the tesseract is a part of.
    //  * @param height - The height of the tesseract on the account. The 0 & -1 values can be used to retrieve the oldest and latest tesseracts for the account respectively.
    //  * @param include - The fields to include in the response.
    //  *
    //  * @returns A promise that resolves to the tesseract.
    //  */
    // public getTesseract(address: Hex, height: number, include?: TesseractIncludeFields): Promise<Tesseract>;
    // /**
    //  * Retrieves a tesseract by its relative reference
    //  *
    //  * @param relativeRef - The relative reference of the tesseract to retrieve.
    //  * @param include - The fields to include in the response.
    //  *
    //  * @returns A promise that resolves to the tesseract.
    //  */
    // public getTesseract(relativeRef: RelativeTesseractOption, include?: TesseractIncludeFields): Promise<Tesseract>;
    // public async getTesseract(
    //     hashOrAddress: Hex | RelativeTesseractOption,
    //     heightOrInclude?: number | TesseractIncludeFields,
    //     include?: TesseractIncludeFields
    // ): Promise<Tesseract> {
    //     if (typeof hashOrAddress === "object" && (heightOrInclude == null || Array.isArray(heightOrInclude))) {
    //         return await this.getTesseractByAddressAndHeight(hashOrAddress.identifier, hashOrAddress.height);
    //     }
    //     if (isAddress(hashOrAddress) && typeof heightOrInclude === "number") {
    //         return await this.getTesseractByAddressAndHeight(hashOrAddress, heightOrInclude);
    //     }
    //     if (isHex(hashOrAddress) && (heightOrInclude == null || Array.isArray(heightOrInclude))) {
    //         return await this.getTesseractByHash(hashOrAddress);
    //     }
    //     ErrorUtils.throwError("Invalid argument for method signature", ErrorCode.INVALID_ARGUMENT);
    // }
    // /**
    //  * Retrieves an interaction by its hash.
    //  *
    //  * @param hash - The hash of the interaction to retrieve.
    //  * @returns A promise that resolves to the interaction.
    //  */
    // public async getInteraction(hash: Hex, options?: ResponseModifierParam): Promise<Partial<Interaction>> {
    //     return await this.call("moi.Interaction", { hash, ...options });
    // }
    // /**
    //  * Retrieves information about an account.
    //  *
    //  * @param address The address that uniquely identifies the account
    //  * @param option The options to include and reference
    //  * @returns A promise that resolves to the account information
    //  */
    // public async getAccount(address: Address, option?: Omit<RpcMethodParams<"moi.Account">[0], "identifier">): Promise<AccountInfo> {
    //     return await this.call("moi.Account", { identifier: address, ...option });
    // }
    // /**
    //  * Retrieves the account key for an account.
    //  *
    //  * @param address The address that uniquely identifies the account
    //  * @param keyId The key id that uniquely identifies the account key
    //  * @param pending Whether to include pending account keys
    //  *
    //  * @returns A promise that resolves to the account information for the provided key id
    //  */
    // public async getAccountKey(address: Address, keyId: number, pending?: boolean) {
    //     return await this.call("moi.AccountKey", {
    //         identifier: address,
    //         key_id: keyId,
    //         pending,
    //     });
    // }
    // /**
    //  * Retrieves the balances, mandates and deposits for a specific asset on an account
    //  *
    //  * @param address The address that uniquely identifies the account
    //  * @param assetId The asset id that uniquely identifies the asset
    //  * @param option The options to include and reference
    //  *
    //  * @returns A promise that resolves to the account asset information
    //  */
    // public async getAccountAsset(address: Address, assetId: Hex, option?: Omit<RpcMethodParams<"moi.AccountAsset">[0], "asset_id">): Promise<AccountAsset[]> {
    //     return await this.call("moi.AccountAsset", {
    //         identifier: address,
    //         asset_id: assetId,
    //         ...option,
    //     });
    // }
    // /**
    //  * Retrieves the interaction confirmation
    //  *
    //  * @param hash The hash of the interaction to retrieve the confirmation.
    //  * @returns A promise that resolves to object containing the confirmation information.
    //  */
    // public async getConfirmation(hash: Hex): Promise<Confirmation> {
    //     return await this.call("moi.Confirmation", { hash });
    // }
    // /**
    //  * Retrieves information about an asset
    //  *
    //  * @param assetId The asset id that uniquely identifies the asset
    //  * @param option The options to include and reference
    //  *
    //  * @returns A promise that resolves to the asset information
    //  */
    // public async getAsset(assetId: Hex, option?: Omit<RpcMethodParams<"moi.Asset">[0], "asset_id">): Promise<unknown> {
    //     return await this.call("moi.Asset", { asset_id: assetId, ...option });
    // }
    // /**
    //  * Retrieves information about a logic
    //  *
    //  * @param logicId A unique identifier for the logic
    //  * @param option The options for the tesseract reference
    //  *
    //  * @returns A promise that resolves to the logic information
    //  */
    // public async getLogic(logicId: Hex, option?: Omit<RpcMethodParams<"moi.Logic">[0], "logic_id">): Promise<unknown> {
    //     return await this.call("moi.Logic", { logic_id: logicId, ...option });
    // }
    // /**
    //  * Retrieves the value of a storage key for a logic from persistent storage
    //  *
    //  * @param logicId The unique identifier for the logic
    //  * @param key The storage key to retrieve
    //  * @param option The options for the tesseract reference
    //  *
    //  * @returns A promise that resolves to the value of the storage key
    //  */
    // public async getLogicStorage(logicId: Hex, key: Hex, option?: LogicStorageOption): Promise<Hex>;
    // /**
    //  * Retrieves the value of a storage key for a logic from ephemeral storage
    //  *
    //  * @param logicId The unique identifier for the logic
    //  * @param key The storage key to retrieve
    //  * @param address The address of the account to retrieve the storage key from
    //  * @param option The options for the tesseract reference
    //  *
    //  * @returns A promise that resolves to the value of the storage key
    //  */
    // public async getLogicStorage(logicId: Hex, key: Hex, address: Hex, option?: LogicStorageOption): Promise<Hex>;
    // public async getLogicStorage(logicId: Hex, key: Hex, addressOrOption?: Hex | LogicStorageOption, option?: LogicStorageOption): Promise<Hex> {
    //     let params: RpcMethodParams<"moi.LogicStorage"> | undefined;
    //     if (addressOrOption == null || typeof addressOrOption === "object") {
    //         params = [{ logic_id: logicId, storage_key: key, ...addressOrOption }];
    //     }
    //     if (isAddress(addressOrOption)) {
    //         params = [
    //             {
    //                 logic_id: logicId,
    //                 storage_key: key,
    //                 identifier: addressOrOption,
    //                 ...option,
    //             },
    //         ];
    //     }
    //     if (params == null) {
    //         ErrorUtils.throwError("Invalid argument for method signature", ErrorCode.INVALID_ARGUMENT);
    //     }
    //     return await this.call("moi.LogicStorage", ...params);
    // }
    // private static isSignedInteraction(ix: unknown): ix is SignedInteraction {
    //     if (typeof ix !== "object" || ix == null) {
    //         return false;
    //     }
    //     if (!("interaction" in ix) || typeof ix.interaction !== "string") {
    //         return false;
    //     }
    //     if (!("signatures" in ix) || !Array.isArray(ix.signatures)) {
    //         return false;
    //     }
    //     return true;
    // }
    // private ensureValidInteraction(interaction: InteractionRequest) {
    //     if (interaction.sender == null) {
    //         ErrorUtils.throwError("Sender is required in the interaction", ErrorCode.INVALID_ARGUMENT, {
    //             field: "sender",
    //         });
    //     }
    //     if (interaction.fuel_price == null) {
    //         ErrorUtils.throwError("Fuel price is required in the interaction", ErrorCode.INVALID_ARGUMENT, {
    //             field: "fuel_price",
    //         });
    //     }
    //     if (interaction.fuel_limit == null) {
    //         ErrorUtils.throwError("Fuel limit is required in the interaction", ErrorCode.INVALID_ARGUMENT, {
    //             field: "fuel_limit",
    //         });
    //     }
    //     if (interaction.fuel_price < 0) {
    //         ErrorUtils.throwError("Fuel price must be a unsigned number", ErrorCode.INVALID_ARGUMENT, {
    //             field: "fuel_price",
    //             value: interaction.fuel_price,
    //         });
    //     }
    //     if (interaction.fuel_limit < 0) {
    //         ErrorUtils.throwError("Fuel limit must be a unsigned number", ErrorCode.INVALID_ARGUMENT, {
    //             field: "fuel_limit",
    //             value: interaction.fuel_limit,
    //         });
    //     }
    //     if (interaction.operations == null || interaction.operations.length === 0) {
    //         ErrorUtils.throwError("At least one operation is required in the interaction", ErrorCode.INVALID_ARGUMENT);
    //     }
    // }
    // /**
    //  * Submits a signed interaction to the MOI protocol network.
    //  *
    //  * @param interaction - The signed interaction to submit.
    //  * @returns A promise that resolves to the hash of the submitted interaction.
    //  */
    // public async submit(interaction: SignedInteraction): Promise<Hex> {
    //     let ix: SignedInteraction | undefined;
    //     if (JsonRpcProvider.isSignedInteraction(interaction)) {
    //         ix = interaction;
    //     }
    //     if (ix == null) {
    //         ErrorUtils.throwError("Invalid argument for method signature", ErrorCode.INVALID_ARGUMENT);
    //     }
    //     if (!isHex(ix.interaction)) {
    //         ErrorUtils.throwArgumentError("Must be a valid hex string", "interaction", ix.interaction);
    //     }
    //     if (ix.signatures.length === 0) {
    //         ErrorUtils.throwError("Interaction must be have at least one signature", ErrorCode.INVALID_SIGNATURE);
    //     }
    //     return await this.call("moi.Submit", {
    //         interaction: ix.interaction,
    //         signatures: ix.signatures,
    //     });
    // }
    // public async subscribe(event: string, ...params: unknown[]): Promise<string> {
    //     return await this.call("moi.Subscribe", [event, ...params]);
    // }
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
    processJsonRpcResponse(response) {
        if ("error" in response) {
            const { data } = response.error;
            const params = data ? (typeof data === "object" ? data : { data }) : {};
            js_moi_utils_1.ErrorUtils.throwError(response.error.message, response.error.code, params);
        }
        return response.result;
    }
}
exports.JsonRpcProvider = JsonRpcProvider;
//# sourceMappingURL=json-rpc-provider.js.map