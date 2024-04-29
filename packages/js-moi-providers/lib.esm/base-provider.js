import { ManifestCoder } from "js-moi-manifest";
import { CustomError, ErrorCode, ErrorUtils, IxType, bytesToHex, hexDataLength, hexToBN, hexToBytes, toQuantity, unmarshal } from "js-moi-utils";
import { AbstractProvider } from "./abstract-provider";
import Event from "./event";
import { processIxObject } from "./interaction";
// Default timeout value in seconds
const defaultTimeout = 120;
const defaultOptions = {
    tesseract_number: -1
};
/**
 * Class representing a base provider for interacting with the MOI protocol.
 * Extends the AbstractProvider class and provides implementations for
 * account operations, execution, and querying RPC methods.
 */
export class BaseProvider extends AbstractProvider {
    _events;
    constructor() {
        super();
        // Events being listened to
        this._events = [];
    }
    /**
     * Helper function to process the RPC response and extract the relevant data.
     * If the response has a result, it checks if the result has data and returns it.
     * Otherwise, it throws an error with the corresponding error message.
     *
     * @param {RpcResponse} response - The RPC response to be processed.
     * @returns {any} The extracted data from the response.
     * @throws {Error} if the response does not have a result or if the result
     * does not have data.
     */
    processResponse(response) {
        if (response.result) {
            if (response.result.data) {
                return response.result.data;
            }
            ErrorUtils.throwError(response.result.error.message, ErrorCode.SERVER_ERROR);
        }
        ErrorUtils.throwError(response.error.message, ErrorCode.SERVER_ERROR);
    }
    // Account Methods
    /**
     * Retrieves the balance of the specified address for the given asset id.
     *
     * @param {string} address - The address for which to retrieve the balance.
     * @param {string} assetId - The asset id for which to retrieve the balance.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<number | bigint>} A Promise that resolves to the balance
     * as a number or bigint.
     * @throws {Error} if there is an error executing the RPC call.
     */
    async getBalance(address, assetId, options) {
        try {
            const params = {
                address: address,
                asset_id: assetId,
                options: options ? options : defaultOptions
            };
            const response = await this.execute("moi.Balance", params);
            const balance = this.processResponse(response);
            return hexToBN(balance);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves the context information for the specified address.
     *
     * @param {string} address - The address for which to retrieve the context
     * information.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<ContextInfo>} A Promise that resolves to the context
     * information.
     * @throws {Error} if there is an error executing the RPC call.
     */
    async getContextInfo(address, options) {
        try {
            const params = {
                address: address,
                options: options ? options : defaultOptions
            };
            const response = await this.execute("moi.ContextInfo", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves the TDU (Total Digital Utility) for the specified address.
     *
     * @param {string} address - The address for which to retrieve the TDU.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<TDU[]>} A Promise that resolves to the TDU object.
     * @throws {Error} if there is an error executing the RPC call.
     */
    async getTDU(address, options) {
        try {
            const params = {
                address: address,
                options: options ? options : defaultOptions
            };
            const response = await this.execute("moi.TDU", params);
            const tdu = this.processResponse(response);
            return tdu.map((asset) => ({
                asset_id: asset.asset_id,
                amount: hexToBN(asset.amount)
            }));
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves the interaction information for the specified interaction hash.
     *
     * @param {string} ixHash - The hash of the interaction to retrieve.
     * @returns {Promise<Interaction>} A Promise that resolves to the interaction information.
     * @throws {Error} if there is an error executing the RPC call.
     */
    async getInteractionByHash(ixHash) {
        try {
            const params = {
                hash: ixHash
            };
            const response = await this.execute("moi.InteractionByHash", params);
            return this.processResponse(response);
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * Retrieves the interaction information for the specified address and tesseract options.
     *
     * If only tesseract options are provided, the address parameter can be omitted.
     *
     * @param {string} address - The address for which to retrieve the interaction. Omit if using only tesseract options.
     * @param {Object} options - The tesseract options. Should be an object with either 'tesseract_number' or 'tesseract_hash'. (optional)
     * @param {number | undefined} [ix_index] - The index of the interaction to retrieve. (optional)
     * @returns {Promise<Interaction>} A Promise that resolves to the interaction information.
     * @throws {Error} if there is an error executing the RPC call.
     *
     * @example
     * // Retrieve interaction by address and tesseract options
     * provider.getInteractionByTesseract('0x55425876a7bdad21068d629e290b22b564c4f596fdf008db47c037da0cb146db', { tesseract_number: 0 }, 1)
    *
     * @example
     * // Retrieve interaction by tesseract options only
     * provider.getInteractionByTesseract({ tesseract_hash: '0xf1e6274efa43da9fecbb7e970be4b37e6f8f4e66eea7e323a671f02ef7a5e001' }, 2)
     */
    async getInteractionByTesseract(arg1, arg2, ix_index) {
        try {
            const params = {};
            if (typeof arg1 === "string") {
                params['address'] = arg1;
                params['options'] = arg2 ? arg2 : defaultOptions;
                params['ix_index'] = ix_index != null ? toQuantity(ix_index) : toQuantity(1);
            }
            if (typeof arg1 === "object") {
                params['options'] = arg1 ? arg1 : defaultOptions;
                params['ix_index'] = arg2 != null ? toQuantity(arg2) : toQuantity(1);
            }
            const response = await this.execute("moi.InteractionByTesseract", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves the total number of interactions for the specified address.
     *
     * @param {string} address - The address for which to retrieve the interaction count.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<number | bigint>} A Promise that resolves to the number
     * of interactions as a number or bigint.
     * @throws {Error} if there is an error executing the RPC call.
     */
    async getInteractionCount(address, options) {
        try {
            const params = {
                address: address,
                options: options ? options : defaultOptions
            };
            const response = await this.execute("moi.InteractionCount", params);
            const ixCount = this.processResponse(response);
            return hexToBN(ixCount);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves the total number of interactions for the specified address,
     * including the pending interactions in IxPool.
     *
     * @param {string} address - The address for which to retrieve the pending
     * interaction count.
     * @returns {Promise<number | bigint>} A Promise that resolves to the number
     * of pending interactions
     * as a number or bigint.
     * @throws Error if there is an error executing the RPC call.
     */
    async getPendingInteractionCount(address) {
        try {
            const params = {
                address: address
            };
            const response = await this.execute("moi.PendingInteractionCount", params);
            const ixCount = this.processResponse(response);
            return hexToBN(ixCount);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves the account state for the specified address.
     *
     * @param {string} address - The address for which to retrieve the account
     * state.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<AccountState>} A Promise that resolves to the account
     * state.
     * @throws {Error} if there is an error executing the RPC call.
     */
    async getAccountState(address, options) {
        try {
            const params = {
                address: address,
                options: options ? options : defaultOptions
            };
            const response = await this.execute("moi.AccountState", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves the account meta information for the specified address.
     *
     * @param {string} address - The address for which to retrieve the account
     * meta information.
     * @returns {Promise<AccountMetaInfo>} A Promise that resolves to the
     * account meta information.
     * @throws {Error} if there is an error executing the RPC call.
     */
    async getAccountMetaInfo(address) {
        try {
            const params = {
                address: address
            };
            const response = await this.execute("moi.AccountMetaInfo", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves the content from a specific address.
     *
     * @param {string} address - The address for which to retrieve the content.
     * @returns {Promise<ContentFrom>} A Promise that resolves to the content
     * information.
     * @throws {Error} if there is an error executing the RPC call.
     */
    async getContentFrom(address) {
        try {
            const params = {
                address: address
            };
            const response = await this.execute("ixpool.ContentFrom", params);
            const content = this.processResponse(response);
            const contentResponse = {
                pending: new Map(),
                queued: new Map(),
            };
            Object.keys(content.pending).forEach(nonce => contentResponse.pending.set(hexToBN(nonce), content.pending[nonce]));
            Object.keys(content.queued).forEach(nonce => contentResponse.queued.set(hexToBN(nonce), content.queued[nonce]));
            return contentResponse;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves the wait time for a specific account in ixpool.
     *
     * @param {string} address - The address for which to retrieve the wait time.
     * @returns {Promise<number | bigint>} A promise that resolves to the wait
     * time (in seconds) as a number or bigint.
     * @throws {Error} if there is an error executing the RPC call.
     */
    async getWaitTime(address) {
        try {
            const params = {
                address: address
            };
            const response = await this.execute("ixpool.WaitTime", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Initializes a filter for retrieving newly detected terreracts.
     * The filter setup triggers a 1-minute timeout period, and with each subsequent query,
     * the timeout is reset to 1 minute.
     *
     * @returns {Promise<Filter>} An object containing the filter id for the NewTesseractFilter.
     * @throws {Error} Throws an error if there is an issue executing the RPC call.
     */
    async getNewTesseractFilter() {
        try {
            const response = await this.execute("moi.NewTesseractFilter", null);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Initiates a filtering mechanism to fetch recently identified tesseracts
     * associated with a specific account. The filter setup triggers a 1-minute
     * timeout period, and with each subsequent request, the timeout is reset to 1 minute.
     *
     * @param {string} address - The address of the target account for which new tesseracts are filtered.
     * @returns {Promise<Filter>} An object containing the filter id for the NewTesseractFilter.
     * @throws {Error} Throws an error if there is an error executing the RPC call.
     */
    async getNewTesseractsByAccountFilter(address) {
        try {
            const params = {
                address: address
            };
            const response = await this.execute("moi.NewTesseractsByAccountFilter", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Initiates a filtering mechanism to fetch recently identified pending interaction.
     * The filter setup triggers a 1-minute timeout period, and with each subsequent request,
     * the timeout is reset to 1 minute.
     *
     * @returns {Promise<Filter>} A object containing the Filter ID for PendingIxnsFilter
     * @throws {Error} Throws an error if there is an error executing the RPC call.
     */
    async getPendingInteractionFilter() {
        try {
            const params = null;
            const response = await this.execute('moi.PendingIxnsFilter', params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Asynchronously removes the filter and returns a Promise that resolves to a
     * object.
     * The object has a `status` property, which is true if the filter is successfully removed, otherwise false.
     *
     * @returns {Promise<FilterDeletionResult>} A Promise that resolves to an object with a `status` property indicating the success of the filter removal.
     * @throws {Error} Throws an error if there is an error executing the RPC call.
     */
    async removeFilter(filter) {
        try {
            const params = {
                id: filter.id
            };
            const response = await this.execute("moi.RemoveFilter", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves all filter changes since the last poll.
     *
     * The specific result varies depending on the type of filter used.
     *
     * @param {Filter} filter - The filter object for which changes are to be retrieved.
     *
     * @returns {Promise<T>} A promise that resolves to an object containing information about the changes made to the specified filter since the last poll. The structure of the object is determined by the type of filter provided.
     * @throws {Error} Throws an error if there is an issue executing the RPC call.
     *
     * @template T - The type of the object returned, dependent on the provided filter.
     */
    async getFilterChanges(filter) {
        try {
            const params = {
                id: filter.id
            };
            const response = await this.execute("moi.GetFilterChanges", params);
            if (response.result.data == null) {
                return null;
            }
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
      * Retrieves a Tesseract for a specific address or tesseract hash.
      *
      * @param {string | boolean} address - The address for which to retrieve the Tesseract or a boolean indicating whether to include interactions.
      * @param {boolean | Options} with_interactions - A boolean value indicating whether to include interactions in the Tesseract.
      * @param {Options | undefined} [options] - The tesseract options. (optional)
      * @returns {Promise<Tesseract>} A promise that resolves to the Tesseract.
      * @throws {Error} if there is an error executing the RPC call.
      *
      * @example
      * // Retrieve Tesseract by address with interactions and options
      * provider.getTesseract('0x55425876a7bdad21068d629e290b22b564c4f596fdf008db47c037da0cb146db', true, { tesseract_number: '0' })
      *
      * @example
      * // Retrieve Tesseract by tesseract hash with interactions and options
      * provider.getTesseract(true, { tesseract_hash: '0xf1e6274efa43da9fecbb7e970be4b37e6f8f4e66eea7e323a671f02ef7a5e001' })
      */
    async getTesseract(arg1, arg2, arg3) {
        try {
            const params = {};
            if (typeof arg1 === 'string') {
                params['address'] = arg1;
                params['with_interactions'] = arg2;
                params['options'] = arg3 ?? defaultOptions;
            }
            if (typeof arg1 === 'boolean') {
                params['with_interactions'] = arg1;
                params['options'] = arg2 ?? defaultOptions;
            }
            const response = await this.execute("moi.Tesseract", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves the logic id's associated with a specific address.
     *
     * @param {string} address - The address for which to retrieve the logic id's.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<string[]>} A Promise that resolves to an array of logic id's.
     * @throws {Error} if there is an error executing the RPC call.
     */
    async getLogicIds(address, options) {
        try {
            const params = {
                address: address,
                options: options ? options : defaultOptions
            };
            const response = await this.execute("moi.LogicIDs", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves the registry for a specific address.
     *
     * @param {string} address - The address for which to retrieve the registry.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<Registry>} A Promise that resolves to the registry.
     * @throws {Error} if there is an error executing the RPC call.
     */
    async getRegistry(address, options) {
        try {
            const params = {
                address: address,
                options: options ? options : defaultOptions
            };
            const response = await this.execute("moi.Registry", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves the synchronization status for a specific account.
     *
     * @param {string | undefined} address - The address for which to retrieve the synchronization status.
     * @returns {Promise<SyncStatus>} A Promise that resolves to the synchronization status.
     * @throws {Error} if there is an error executing the RPC call.
     */
    async getSyncStatus(address) {
        try {
            const params = {
                address: address
            };
            const response = await this.execute("moi.Syncing", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    // Execution Methods
    /**
     * Handles the interaction without modifying the account's current state.
     *
     * @param {CallorEstimateIxObject} ixObject - The interaction object.
     * @param {CallorEstimateOptions} options - The interaction options. (optional)
     * @returns {Promise<InteractionCallResponse>} A Promise resolving to the
     * interaction call response.
     * @throws {Error} if there's an issue executing the RPC call or
     * processing the response.
     */
    async call(ixObject, options) {
        try {
            const params = {
                ix_args: processIxObject(ixObject),
                options: options
            };
            const response = await this.execute("moi.Call", params);
            const receipt = this.processResponse(response);
            // TODO: overwritten ix_type has to be removed once the interaction 
            // call receipt bug is resolved in the protocol.
            return {
                receipt: receipt,
                result: this.processReceipt.bind(this, { ...receipt, ix_type: toQuantity(ixObject.type) })
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Estimates the amount of fuel required for processing the interaction.
     *
     * @param {CallorEstimateIxObject} ixObject - The interaction object.
     * @param {CallorEstimateOptions} options - The interaction options. (optional)
     * @returns {Promise<number | bigint>} A Promise resolving to the estimated
     * fuel amount.
     * @throws {Error} if there's an issue executing the RPC call or
     * processing the response.
     */
    async estimateFuel(ixObject, options) {
        try {
            const params = {
                ix_args: processIxObject(ixObject),
                options: options
            };
            const response = await this.execute("moi.FuelEstimate", params);
            const fuelPrice = this.processResponse(response);
            return hexToBN(fuelPrice);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Sends an interaction request.
     *
     * @param {InteractionRequest} ixObject - The interaction request object.
     * @returns {Promise<InteractionResponse>} A Promise that resolves to the
     * interaction response.
     * @throws {Error} if there is an error executing the RPC call or
     * processing the response.
     */
    async sendInteraction(ixObject) {
        const response = await this.execute("moi.SendInteractions", ixObject);
        try {
            if (response.result) {
                if (response.result.data) {
                    return {
                        hash: response.result.data,
                        wait: this.waitForInteraction.bind(this, response.result.data),
                        result: this.waitForResult.bind(this, response.result.data)
                    };
                }
                ErrorUtils.throwError(response.result.error.message, ErrorCode.SERVER_ERROR);
            }
            ErrorUtils.throwError(response.error.message, ErrorCode.SERVER_ERROR);
        }
        catch (error) {
            throw error;
        }
    }
    // Query Methods
    /**
     * Retrieves the asset information for a specific asset id.
     *
     * @param {string} assetId - The asset id for which to retrieve the
     * asset information.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<AssetInfo>} A Promise that resolves to the asset
     * information.
     * @throws {Error} if there is an error executing the RPC call.
     */
    async getAssetInfoByAssetID(assetId, options) {
        try {
            const params = {
                asset_id: assetId,
                options: options ? options : defaultOptions,
            };
            const response = await this.execute("moi.AssetInfoByAssetID", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves the interaction receipt for a specific interaction hash.
     *
     * @param {string} ixHash - The hash of the interaction for which to
     * retrieve the receipt.
     * @returns {Promise<InteractionReceipt>} A Promise that resolves to the
     * interaction receipt.
     * @throws {Error} if there is an error executing the RPC call.
     */
    async getInteractionReceipt(ixHash) {
        try {
            const params = {
                hash: ixHash
            };
            const response = await this.execute("moi.InteractionReceipt", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves the storage value at a specific storage key for a logic id.
     *
     * @param {string} logicId - The logic id for which to retrieve the
     * storage value.
     * @param {string} storageKey - The storage key for which to retrieve
     * the value.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<string>} A Promise that resolves to the storage value
     * as a string.
     * @throws {Error} if there is an error executing the RPC call.
     */
    async getStorageAt(logicId, storageKey, options) {
        try {
            const params = {
                logic_id: logicId,
                storage_key: storageKey,
                options: options ? options : defaultOptions
            };
            const response = await this.execute("moi.LogicStorage", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves the logic manifest for a specific logic id.
     *
     * @param {string} logicId - The logic id for which to retrieve the logic manifest.
     * @param {Encoding} encoding - The encoding format of the manifest.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<string | LogicManifest.Manifest>} A Promise that
     * resolves to the logic manifest as a POLO encode string or a parsed JSON object.
     * @throws {Error} if there is an error executing the RPC call or processing the response.
     */
    async getLogicManifest(logicId, encoding, options) {
        try {
            const params = {
                logic_id: logicId,
                encoding: encoding,
                options: options ? options : defaultOptions
            };
            const response = await this.execute("moi.LogicManifest", params);
            const data = this.processResponse(response);
            const decodedManifest = hexToBytes(data);
            switch (encoding) {
                case "JSON":
                    return unmarshal(decodedManifest);
                case "POLO":
                    return bytesToHex(decodedManifest);
                default:
                    throw new Error("Unsupported encoding format!");
            }
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves all the interactions that are pending for inclusion in the next
     * Tesseract(s) or are scheduled for future execution.
     *
     * @returns {Promise<Content>} A Promise that resolves to the content of the
     * interaction pool.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    async getContent() {
        try {
            const response = await this.execute("ixpool.Content", null);
            const content = this.processResponse(response);
            const contentResponse = {
                pending: new Map(),
                queued: new Map(),
            };
            Object.keys(content.pending).forEach(key => {
                contentResponse.pending.set(key, new Map());
                Object.keys(content.pending[key]).forEach(nonce => contentResponse.pending.get(key).set(hexToBN(nonce), content.pending[key][nonce]));
            });
            Object.keys(content.queued).forEach(key => {
                contentResponse.queued.set(key, new Map());
                Object.keys(content.queued[key]).forEach(nonce => contentResponse.queued.get(key).set(hexToBN(nonce), content.queued[key][nonce]));
            });
            return contentResponse;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves the total number of pending and queued interactions in
     * the interaction pool.
     *
     * @returns {Promise<Status>} A Promise that resolves to the status of the
     * interaction pool.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    async getStatus() {
        try {
            const response = await this.execute("ixpool.Status", null);
            const status = this.processResponse(response);
            return {
                pending: hexToBN(status.pending),
                queued: hexToBN(status.queued)
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves all the interactions that are pending for inclusion in the next
     * Tesseract(s) or are scheduled for future execution. Additionally, it provides
     * a list of all the accounts in the ixpool with their respective wait times.
     * This method is particularly useful for developers, as it can help them
     * quickly review interactions in the pool and identify any potential issues.
     *
     * @returns {Promise<Inspect>} A Promise that resolves to the inspection
     * data of the interaction pool.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    async getInspect() {
        try {
            const response = await this.execute("ixpool.Inspect", null);
            const inspect = this.processResponse(response);
            const inspectResponse = {
                pending: new Map(),
                queued: new Map(),
                wait_time: new Map()
            };
            Object.keys(inspect.pending).forEach(key => {
                inspectResponse.pending.set(key, new Map(Object.entries(inspect.pending[key])));
            });
            Object.keys(inspect.queued).forEach(key => {
                inspectResponse.queued.set(key, new Map(Object.entries(inspect.queued[key])));
            });
            Object.keys(inspectResponse.wait_time).forEach(key => {
                inspectResponse.wait_time.set(key, {
                    ...inspectResponse.wait_time[key],
                    time: hexToBN(inspectResponse.wait_time[key]["time"])
                });
            });
            return inspectResponse;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves the list of peers connected to the specific moipod.
     *
     * @returns {Promise<string[]>} A Promise that resolves to the list of peers.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    async getPeers() {
        try {
            const response = await this.execute("net.Peers", null);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves the version of the connected network.
     *
     * @returns {Promise<string>} A Promise that resolves to the network
     * version as a string.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    async getVersion() {
        try {
            const response = await this.execute("net.Version", null);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Retrieves detailed information about the connected node.
     *
     * @returns {Promise<NodeInfo>} A Promise that resolves to an object
     * containing node information.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    async getNodeInfo() {
        try {
            const response = await this.execute("net.Info", null);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Waits for the interaction with the specified hash to be included in a tesseract
     * and returns the interaction receipt.
     *
     * @param {string} interactionHash - The hash of the interaction.
     * @param {number} timeout - The timeout duration in seconds (optional).
     * @returns {Promise<InteractionReceipt>} A Promise that resolves to the
     * interaction receipt.
     * @throws {Error} if there is an error executing the RPC call, processing
     * the response, or the timeout is reached.
     */
    async waitForInteraction(interactionHash, timeout) {
        if (timeout == undefined) {
            timeout = defaultTimeout;
        }
        return new Promise(async (resolve, reject) => {
            let intervalId;
            let timeoutId;
            const clearTimers = () => {
                clearInterval(intervalId);
                clearTimeout(timeoutId);
            };
            const checkReceipt = async () => {
                const receipt = await this.getInteractionReceipt(interactionHash).catch(() => null);
                if (receipt == null) {
                    return;
                }
                clearTimers();
                const result = this.processReceipt(receipt);
                if (result == null) {
                    resolve(receipt);
                    return;
                }
                const error = ManifestCoder.decodeException(result.error);
                if (error == null) {
                    resolve(receipt);
                    return;
                }
                const err = new CustomError(error.error, ErrorCode.ACTION_REJECTED, {
                    ...error,
                    receipt,
                });
                reject(err);
            };
            await checkReceipt();
            intervalId = setInterval(checkReceipt, 5000);
            timeoutId = setTimeout(() => {
                clearInterval(intervalId);
                reject({ message: "failed to fetch receipt" });
            }, timeout * 1000);
        });
    }
    /**
     * Process the interaction receipt to determine the appropriate result based on the
     * interaction type.
     *
     * @param {InteractionReceipt} receipt - The interaction receipt to be processed.
     * @returns {any} The processed result based on the interaction type.
     * @throws {Error} If the interaction type is unsupported or the expected response
     * data is missing.
     */
    processReceipt(receipt) {
        switch (hexToBN(receipt.ix_type)) {
            case IxType.VALUE_TRANSFER:
                return null;
            case IxType.ASSET_CREATE:
                if (receipt.extra_data) {
                    return receipt.extra_data;
                }
                throw new Error("Failed to retrieve asset creation response");
            case IxType.ASSET_MINT:
            case IxType.ASSET_BURN:
                if (receipt.extra_data) {
                    return receipt.extra_data;
                }
                throw new Error("Failed to retrieve asset mint/burn response");
            case IxType.LOGIC_DEPLOY:
                if (receipt.extra_data) {
                    return receipt.extra_data;
                }
                throw new Error("Failed to retrieve logic deploy response");
            case IxType.LOGIC_INVOKE:
                if (receipt.extra_data) {
                    return receipt.extra_data;
                }
                throw new Error("Failed to retrieve logic invoke response");
            default:
                throw new Error("Unsupported interaction type encountered");
        }
    }
    /**
     * Waits for the interaction with the specified hash to be included in a
     * tesseract and returns the result based on the interaction type.
     *
     * @param {string} interactionHash - The hash of the interaction.
     * @param {number} timeout - The timeout duration in seconds (optional).
     * @returns {Promise<any>} A Promise that resolves to the result of the
     * interaction.
     * @throws {Error} if there is an error executing the RPC call, processing the
     * response, or the timeout is reached.
     */
    async waitForResult(interactionHash, timeout) {
        const receipt = await this.waitForInteraction(interactionHash, timeout);
        return await this.processReceipt(receipt);
    }
    /**
     * Checks if the response object represents a server error.
     *
     * @param {Response} response - The Response object.
     * @returns {boolean} A boolean indicating whether the error is a server error.
     */
    isServerError(response) {
        return response && response.status >= 500 && response.status < 600;
    }
    /**
     * Executes an RPC method with the specified parameters.
     *
     * @param {string} method - The RPC method to execute.
     * @param {any} params - The parameters to pass to the RPC method.
     * @returns {Promise<any>} A Promise that resolves to the response of the RPC call.
     * @throws {Error} if the method is not implemented.
     */
    execute(method, params) {
        throw new Error(method + " not implemented");
    }
    /**
     * Starts the specified event by performing necessary actions.
     *
     * @param {Event} event - The event to start.
     */
    _startEvent(event) {
    }
    /**
     * Stops the specified event by performing necessary actions.
     *
     * @param {Event} event - The event to stop.
     */
    _stopEvent(event) {
    }
    /**
     * Adds an event listener for the specified event.
     *
     * @param {EventType} eventName - The name of the event to listen to.
     * @param {Listener} listener - The listener function to be called when the
     * event is emitted.
     * @param {boolean} once - Indicates whether the listener should be called
     * only once (true) or multiple times (false).
     * @returns The instance of the class to allow method chaining.
     */
    _addEventListener(eventName, listener, once) {
        const event = new Event(getEventTag(eventName), listener, once);
        this._events.push(event);
        this._startEvent(event);
        return this;
    }
    /**
     * Emits the specified event and calls all the associated listeners.
     *
     * @param {EventType} eventName - The name of the event to emit.
     * @param {Array<any>} args - The arguments to be passed to the event listeners.
     * @returns {boolean} A boolean indicating whether any listeners were called
     * for the event.
     */
    emit(eventName, ...args) {
        let result = false;
        let stopped = [];
        let eventTag = getEventTag(eventName);
        this._events = this._events.filter((event) => {
            if (event.tag !== eventTag) {
                return true;
            }
            setTimeout(() => {
                event.listener.apply(this, args);
            }, 0);
            result = true;
            if (event.once) {
                stopped.push(event);
                return false;
            }
            return true;
        });
        stopped.forEach((event) => { this._stopEvent(event); });
        return result;
    }
    /**
     * Adds an event listener for the specified event.
     *
     * @param {EventType} eventName - The name of the event to listen to.
     * @param {Listener} listener - The listener function to be called when the event is emitted.
     * @returns The instance of the class to allow method chaining.
     */
    on(eventName, listener) {
        return this._addEventListener(eventName, listener, false);
    }
    /**
     * Adds a one-time event listener for the specified event.
     *
     * @param {EventType} eventName - The name of the event to listen to.
     * @param {Listener} listener - The listener function to be called when the
     * event is emitted.
     * @returns The instance of the class to allow method chaining.
     */
    once(eventName, listener) {
        return this._addEventListener(eventName, listener, true);
    }
    /**
     * Returns the number of listeners for the specified event.
     *
     * @param {EventType} eventName - The name of the event.
     * @returns {number} The number of listeners for the event.
     */
    listenerCount(eventName) {
        if (!eventName) {
            return this._events.length;
        }
        let eventTag = getEventTag(eventName);
        return this._events.filter((event) => {
            return (event.tag === eventTag);
        }).length;
    }
    /**
     * Returns an array of listeners for the specified event.
     *
     * @param {EventType} eventName - The name of the event.
     * @returns An array of listeners for the event.
     */
    listeners(eventName) {
        if (eventName == null) {
            return this._events.map((event) => event.listener);
        }
        let eventTag = getEventTag(eventName);
        return this._events
            .filter((event) => (event.tag === eventTag))
            .map((event) => event.listener);
    }
    /**
     * Removes an event listener for the specified event. If no listener is
     * specified, removes all listeners for the event.
     *
     * @param {EventType} eventName - The name of the event to remove the
     * listener from.
     * @param {Listener} listener - The listener function to remove. If not
     * provided, removes all listeners for the event.
     * @returns The instance of the class to allow method chaining.
     */
    off(eventName, listener) {
        if (listener == null) {
            return this.removeAllListeners(eventName);
        }
        const stopped = [];
        let found = false;
        let eventTag = getEventTag(eventName);
        this._events = this._events.filter((event) => {
            if (event.tag !== eventTag || event.listener != listener) {
                return true;
            }
            if (found) {
                return true;
            }
            found = true;
            stopped.push(event);
            return false;
        });
        stopped.forEach((event) => { this._stopEvent(event); });
        return this;
    }
    /**
     * Removes all listeners for the specified event. If no event is specified,
     * removes all listeners for all events.
     *
     * @param {EventType} eventName - The name of the event to remove all
     * listeners from.
     * @returns The instance of the class to allow method chaining.
     */
    removeAllListeners(eventName) {
        let stopped = [];
        if (eventName == null) {
            stopped = this._events;
            this._events = [];
        }
        else {
            const eventTag = getEventTag(eventName);
            this._events = this._events.filter((event) => {
                if (event.tag !== eventTag) {
                    return true;
                }
                stopped.push(event);
                return false;
            });
        }
        stopped.forEach((event) => { this._stopEvent(event); });
        return this;
    }
}
// helper functions
/**
 * Retrieves the event tag based on the event name.
 *
 * @param {EventType} eventName - The name of the event.
 * @returns {string} The event tag.
 * @throws {Error} if the event name is invalid.
 */
const getEventTag = (eventName) => {
    if (typeof (eventName) === "string") {
        eventName = eventName.toLowerCase();
        if (hexDataLength(eventName) === 32) {
            return "tesseract:" + eventName;
        }
        if (eventName.indexOf(":") === -1) {
            return eventName;
        }
    }
    throw new Error("invalid event - " + eventName);
};
//# sourceMappingURL=base-provider.js.map