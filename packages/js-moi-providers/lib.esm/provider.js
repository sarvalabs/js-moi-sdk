import { ErrorCode, ErrorUtils, isAddress, isHex } from "js-moi-utils";
export class Provider {
    transport;
    constructor(transport) {
        if (transport == null) {
            ErrorUtils.throwError("Transport is required", ErrorCode.INVALID_ARGUMENT);
        }
        this.transport = transport;
    }
    async execute(method, ...params) {
        const response = await this.transport.request(method, ...params);
        return Provider.processJsonRpcResponse(response);
    }
    async request(method, ...params) {
        return await this.transport.request(method, params);
    }
    /**
     * Retrieves the version and chain id of the MOI protocol network.
     *
     * @returns A promise that resolves to the Moi client version.
     */
    async getVersion() {
        return await this.execute("moi.Version");
    }
    async getTesseractByReference(reference, includes = []) {
        return await this.execute("moi.Tesseract", {
            include: includes,
            reference: Provider.processTesseractReference(reference),
        });
    }
    async getTesseractByHash(tesseractHash, include) {
        return await this.getTesseractByReference(tesseractHash, include);
    }
    async getTesseractByAddressAndHeight(address, height, include) {
        if (height < -1) {
            ErrorUtils.throwError("Invalid height value", ErrorCode.INVALID_ARGUMENT);
        }
        const ref = { address, height };
        return await this.getTesseractByReference(ref, include);
    }
    async getTesseract(hashOrAddress, heightOrInclude, include) {
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
    async getInteraction(hash) {
        return await this.execute("moi.Interaction", { hash });
    }
    /**
     * Retrieves information about an account.
     *
     * @param address The address that uniquely identifies the account
     * @param option The options to include and reference
     * @returns A promise that resolves to the account information
     */
    async getAccount(address, option) {
        return await this.execute("moi.Account", {
            address,
            include: option?.include,
            reference: option?.reference ? Provider.processTesseractReference(option.reference) : undefined,
        });
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
    async getAccountKey(address, keyId, pending) {
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
    async getAccountAsset(address, assetId, option) {
        return await this.execute("moi.AccountAsset", {
            address,
            asset_id: assetId,
            include: option?.include,
            reference: option?.reference ? Provider.processTesseractReference(option.reference) : undefined,
        });
    }
    /**
     * Retrieves information about an asset
     *
     * @param assetId The asset id that uniquely identifies the asset
     * @param option The options to include and reference
     *
     * @returns A promise that resolves to the asset information
     */
    async getAsset(assetId, option) {
        return await this.execute("moi.Asset", {
            asset_id: assetId,
            reference: option?.reference ? Provider.processTesseractReference(option.reference) : undefined,
        });
    }
    /**
     * Retrieves information about a logic
     *
     * @param logicId A unique identifier for the logic
     * @param option The options for the tesseract reference
     *
     * @returns A promise that resolves to the logic information
     */
    async getLogic(logicId, option) {
        return await this.execute("moi.Logic", {
            logic_id: logicId,
            reference: option?.reference ? Provider.processTesseractReference(option.reference) : undefined,
        });
    }
    async getLogicStorage(logicId, key, addressOrOption, option) {
        let params;
        if (addressOrOption == null || typeof addressOrOption === "object") {
            params = [
                {
                    logic_id: logicId,
                    storage_key: key,
                    reference: addressOrOption?.reference ? Provider.processTesseractReference(addressOrOption.reference) : undefined,
                },
            ];
        }
        if (isAddress(addressOrOption)) {
            params = [
                {
                    logic_id: logicId,
                    storage_key: key,
                    address: addressOrOption,
                    reference: option?.reference ? Provider.processTesseractReference(option.reference) : undefined,
                },
            ];
        }
        if (params == null) {
            ErrorUtils.throwError("Invalid argument for method signature", ErrorCode.INVALID_ARGUMENT);
        }
        return await this.execute("moi.LogicStorage", ...params);
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
    static processJsonRpcResponse(response) {
        if ("error" in response) {
            const { data } = response.error;
            const params = data ? (typeof data === "object" ? data : { data }) : {};
            ErrorUtils.throwError(response.error.message, response.error.code, params);
        }
        return response.result;
    }
    /**
     * Processes a Tesseract reference and returns a `ClientTesseractReference`.
     *
     * @param reference - The Tesseract reference to process. It can be either an absolute or relative reference.
     * @returns A `ClientTesseractReference` object containing either an absolute or relative reference.
     */
    static processTesseractReference(reference) {
        if (isHex(reference)) {
            return { absolute: reference };
        }
        return { relative: reference };
    }
}
//# sourceMappingURL=provider.js.map