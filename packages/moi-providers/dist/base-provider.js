"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProvider = void 0;
const moi_utils_1 = require("moi-utils");
const abstract_provider_1 = require("./abstract-provider");
const event_1 = __importDefault(require("./event"));
// Default timeout value in seconds
const defaultTimeout = 120;
const defaultOptions = {
    tesseract_number: -1
};
/**
 * BaseProvider
 *
 * Class representing a base provider for interacting with the MOI protocol.
 * Extends the AbstractProvider class and provides implementations for
 * account operations, execution, and querying RPC methods.
 */
class BaseProvider extends abstract_provider_1.AbstractProvider {
    _events;
    constructor() {
        super();
        // Events being listened to
        this._events = [];
    }
    /**
     * processResponse
     *
     * Helper function to process the RPC response and extract the relevant data.
     * If the response has a result, it checks if the result has data and returns it.
     * Otherwise, it throws an error with the corresponding error message.
     *
     * @param response - The RPC response to be processed.
     * @returns The extracted data from the response.
     * @throws Error if the response does not have a result or if the result does not have data.
     */
    processResponse(response) {
        if (response.result) {
            if (response.result.data) {
                return response.result.data;
            }
            moi_utils_1.ErrorUtils.throwError(response.result.error.message, moi_utils_1.ErrorCode.SERVER_ERROR);
        }
        moi_utils_1.ErrorUtils.throwError(response.error.message, moi_utils_1.ErrorCode.SERVER_ERROR);
    }
    // Account Methods
    /**
     * getBalance
     *
     * Retrieves the balance of the specified address for the given asset id.
     *
     * @param address - The address for which to retrieve the balance.
     * @param assetId - The asset id for which to retrieve the balance.
     * @param options - The tesseract options. (optional)
     * @returns A Promise that resolves to the balance as a number or bigint.
     * @throws Error if there is an error executing the RPC call.
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
            return (0, moi_utils_1.hexToBN)(balance);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * getContextInfo
     *
     * Retrieves the context information for the specified address.
     *
     * @param address - The address for which to retrieve the context information.
     * @param options - The tesseract options. (optional)
     * @returns A Promise that resolves to the context information.
     * @throws Error if there is an error executing the RPC call.
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
     * getTDU
     *
     * Retrieves the TDU (Total Digital Utility) for the specified address.
     *
     * @param address - The address for which to retrieve the TDU.
     * @param options - The tesseract options. (optional)
     * @returns A Promise that resolves to the TDU object.
     * @throws Error if there is an error executing the RPC call.
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
                amount: (0, moi_utils_1.hexToBN)(asset.amount)
            }));
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * getInteractionByHash
     *
     * Retrieves the interaction information for the specified interaction hash.
     *
     * @param ixHash - The hash of the interaction to retrieve.
     * @returns A Promise that resolves to the interaction information.
     * @throws Error if there is an error executing the RPC call.
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
     * getInteractionByTesseract
     *
     * Retrieves the interaction information for the specified address and tesseract options.
     *
     * @param address - The address for which to retrieve the interaction.
     * @param options - The tesseract options. (optional)
     * @param ix_index - The index of the interaction to retrieve.
     * @returns A Promise that resolves to the interaction information.
     * @throws Error if there is an error executing the RPC call.
     */
    async getInteractionByTesseract(address, options, ix_index = (0, moi_utils_1.toQuantity)(1)) {
        try {
            const params = {
                address: address,
                options: options ? options : defaultOptions,
                ix_index: ix_index
            };
            const response = await this.execute("moi.InteractionByTesseract", params);
            return this.processResponse(response);
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * getInteractionCount
     *
     * Retrieves the total number of interactions for the specified address.
     *
     * @param address - The address for which to retrieve the interaction count.
     * @param options - The tesseract options. (optional)
     * @returns A Promise that resolves to the number of interactions as a number or bigint.
     * @throws Error if there is an error executing the RPC call.
     */
    async getInteractionCount(address, options) {
        try {
            const params = {
                address: address,
                options: options ? options : defaultOptions
            };
            const response = await this.execute("moi.InteractionCount", params);
            const ixCount = this.processResponse(response);
            return (0, moi_utils_1.hexToBN)(ixCount);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * getPendingInteractionCount
     *
     * Retrieves the total number of interactions for the specified address,
     * including the pending interactions in IxPool.
     *
     * @param address - The address for which to retrieve the pending interaction count.
     * @returns A Promise that resolves to the number of pending interactions
     *          as a number or bigint.
     * @throws Error if there is an error executing the RPC call.
     */
    async getPendingInteractionCount(address) {
        try {
            const params = {
                address: address
            };
            const response = await this.execute("moi.PendingInteractionCount", params);
            const ixCount = this.processResponse(response);
            return (0, moi_utils_1.hexToBN)(ixCount);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * getAccountState
     *
     * Retrieves the account state for the specified address.
     *
     * @param address - The address for which to retrieve the account state.
     * @param options - The tesseract options. (optional)
     * @returns A Promise that resolves to the account state.
     * @throws Error if there is an error executing the RPC call.
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
     * getAccountMetaInfo
     *
     * Retrieves the account meta information for the specified address.
     * @param address - The address for which to retrieve the account meta information.
     * @returns A Promise that resolves to the account meta information.
     * @throws Error if there is an error executing the RPC call.
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
     * getContentFrom
     *
     * Retrieves the content from a specific address.
     * @param address - The address for which to retrieve the content.
     * @returns A Promise that resolves to the content information.
     * @throws Error if there is an error executing the RPC call.
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
            Object.keys(content.pending).forEach(nonce => contentResponse.pending.set((0, moi_utils_1.hexToBN)(nonce), content.pending[nonce]));
            Object.keys(content.queued).forEach(nonce => contentResponse.queued.set((0, moi_utils_1.hexToBN)(nonce), content.queued[nonce]));
            return contentResponse;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * getWaitTime
     *
     * Retrieves the wait time for a specific account in ixpool.
     * @param address - The address for which to retrieve the wait time.
     * @returns A promise that resolves to the wait time (in seconds) as a number or bigint.
     * @throws Error if there is an error executing the RPC call.
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
     * getTesseract
     *
     * Retrieves a Tesseract for a specific address.
     * @param address - The address for which to retrieve the Tesseract.
     * @param with_interactions - A boolean value indicating whether to include interactions in the Tesseract.
     * @param options - The tesseract options. (optional)
     * @returns A promise that resolves to the Tesseract.
     * @throws Error if there is an error executing the RPC call.
     */
    async getTesseract(address, with_interactions, options) {
        try {
            const params = {
                address: address,
                with_interactions: with_interactions,
                options: options ? options : defaultOptions
            };
            const response = await this.execute("moi.Tesseract", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * getLogicIds
     *
     * Retrieves the logic id's associated with a specific address.
     * @param address - The address for which to retrieve the logic id's.
     * @param options - The tesseract options. (optional)
     * @returns A Promise that resolves to an array of logic id's.
     * @throws Error if there is an error executing the RPC call.
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
     * getRegistry
     *
     * Retrieves the registry for a specific address.
     * @param address - The address for which to retrieve the registry.
     * @param options - The tesseract options. (optional)
     * @returns A Promise that resolves to the registry.
     * @throws Error if there is an error executing the RPC call.
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
    // Execution Methods
    /**
     * sendInteraction
     *
     * Sends an interaction request.
     * @param ixObject - The interaction request object.
     * @returns A Promise that resolves to the interaction response.
     * @throws Error if there is an error executing the RPC call or processing the response.
     */
    async sendInteraction(ixObject) {
        const response = await this.execute("moi.SendInteractions", ixObject);
        try {
            if (response.result) {
                if (response.result.data) {
                    return {
                        hash: response.result.data,
                        wait: this.waitForInteraction.bind(this),
                        result: this.waitForResult.bind(this)
                    };
                }
                moi_utils_1.ErrorUtils.throwError(response.result.error.message, moi_utils_1.ErrorCode.SERVER_ERROR);
            }
            moi_utils_1.ErrorUtils.throwError(response.error.message, moi_utils_1.ErrorCode.SERVER_ERROR);
        }
        catch (error) {
            throw error;
        }
    }
    // Query Methods
    /**
     * getAssetInfoByAssetID
     *
     * Retrieves the asset information for a specific asset id.
     * @param assetId - The asset id for which to retrieve the asset information.
     * @returns A Promise that resolves to the asset information.
     * @throws Error if there is an error executing the RPC call.
     */
    async getAssetInfoByAssetID(assetId) {
        try {
            const params = {
                asset_id: assetId
            };
            const response = await this.execute("moi.AssetInfoByAssetID", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * getInteractionReceipt
     *
     * Retrieves the interaction receipt for a specific interaction hash.
     * @param ixHash - The hash of the interaction for which to retrieve the receipt.
     * @returns A Promise that resolves to the interaction receipt.
     * @throws Error if there is an error executing the RPC call.
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
     * getStorageAt
     *
     * Retrieves the storage value at a specific storage key for a logic id.
     * @param logicId - The logic id for which to retrieve the storage value.
     * @param storageKey - The storage key for which to retrieve the value.
     * @param options - The tesseract options. (optional)
     * @returns A Promise that resolves to the storage value as a string.
     * @throws Error if there is an error executing the RPC call.
     */
    async getStorageAt(logicId, storageKey, options) {
        try {
            const params = {
                logic_id: logicId,
                storage_key: storageKey,
                options: options ? options : defaultOptions
            };
            const response = await this.execute("moi.Storage", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * getLogicManifest
     *
     * Retrieves the logic manifest for a specific logic id.
     * @param logicId - The logic id for which to retrieve the logic manifest.
     * @param encoding - The encoding format of the manifest.
     * @param options - The tesseract options. (optional)
     * @returns A Promise that resolves to the logic manifest as a POLO encode string or
     * a parsed JSON object.
     * @throws Error if there is an error executing the RPC call or processing the response.
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
            const decodedManifest = (0, moi_utils_1.hexToBytes)(data);
            switch (encoding) {
                case "JSON":
                    return (0, moi_utils_1.unmarshal)(decodedManifest);
                case "POLO":
                    return (0, moi_utils_1.bytesToHex)(decodedManifest);
                default:
                    throw new Error("Unsupported encoding format!");
            }
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * getContent
     *
     * Retrieves all the interactions that are pending for inclusion in the next
     * Tesseract(s) or are scheduled for future execution.
     * @returns A Promise that resolves to the content of the interaction pool.
     * @throws Error if there is an error executing the RPC call or processing the response.
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
                Object.keys(content.pending[key]).forEach(nonce => contentResponse.pending.get(key).set((0, moi_utils_1.hexToBN)(nonce), content.pending[key][nonce]));
            });
            Object.keys(content.queued).forEach(key => {
                contentResponse.queued.set(key, new Map());
                Object.keys(content.queued[key]).forEach(nonce => contentResponse.queued.get(key).set((0, moi_utils_1.hexToBN)(nonce), content.queued[key][nonce]));
            });
            return contentResponse;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * getStatus
     *
     * Retrieves the total number of pending and queued interactions in
     * the interaction pool.
     * @returns A Promise that resolves to the status of the interaction pool.
     * @throws Error if there is an error executing the RPC call or processing the response.
     */
    async getStatus() {
        try {
            const response = await this.execute("ixpool.Status", null);
            const status = this.processResponse(response);
            return {
                pending: (0, moi_utils_1.hexToBN)(status.pending),
                queued: (0, moi_utils_1.hexToBN)(status.queued)
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * getInspect
     *
     * Retrieves all the interactions that are pending for inclusion in the next
     * Tesseract(s) or are scheduled for future execution. Additionally, it provides
     * a list of all the accounts in the ixpool with their respective wait times.
     * This method is particularly useful for developers, as it can help them
     * quickly review interactions in the pool and identify any potential issues.
     * @returns A Promise that resolves to the inspection data of the interaction pool.
     * @throws Error if there is an error executing the RPC call or processing the response.
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
                    time: (0, moi_utils_1.hexToBN)(inspectResponse.wait_time[key]["time"])
                });
            });
            return inspectResponse;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * getPeers
     *
     * Retrieves the list of peers connected to the specific moipod.
     * @returns A Promise that resolves to the list of peers.
     * @throws Error if there is an error executing the RPC call or processing the response.
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
     * getDBEntry
     *
     * Retrieves the value of a database entry with the specified key.
     * @param key - The key of the database entry.
     * @returns A Promise that resolves to the value of the database entry as a string.
     * @throws Error if there is an error executing the RPC call or processing the response.
     */
    async getDBEntry(key) {
        try {
            const params = {
                key: key
            };
            const response = await this.execute("debug.DBGet", params);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * getAccounts
     *
     * Retrieves the list of all registered accounts from a moipod.
     * @returns A Promise that resolves to the list of accounts.
     * @throws Error if there is an error executing the RPC call or processing the response.
     */
    async getAccounts() {
        try {
            const response = await this.execute("debug.Accounts", null);
            return this.processResponse(response);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * waitForInteraction
     *
     * Waits for the interaction with the specified hash to be included in a tesseract
     * and returns the interaction receipt.
     * @param interactionHash - The hash of the interaction.
     * @param timeout - The timeout duration in seconds (optional).
     * @returns A Promise that resolves to the interaction receipt.
     * @throws Error if there is an error executing the RPC call, processing the
     * response, or the timeout is reached.
     */
    async waitForInteraction(interactionHash, timeout) {
        if (timeout == undefined) {
            timeout = defaultTimeout;
        }
        return new Promise(async (resolve, reject) => {
            let intervalId;
            let timeoutId;
            const checkReceipt = async () => {
                try {
                    const receipt = await this.getInteractionReceipt(interactionHash);
                    if (receipt) {
                        resolve(receipt);
                        clearInterval(intervalId);
                        clearTimeout(timeoutId);
                    }
                }
                catch (err) {
                }
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
     * Waits for the interaction with the specified hash to be included in a
     * tesseract and returns the result based on the interaction type.
     * @param interactionHash - The hash of the interaction.
     * @param timeout - The timeout duration in seconds (optional).
     * @returns A Promise that resolves to the result of the interaction.
     * @throws Error if there is an error executing the RPC call, processing the
     * response, or the timeout is reached.
     */
    async waitForResult(interactionHash, timeout) {
        return new Promise(async (resolve, reject) => {
            try {
                const receipt = await this.waitForInteraction(interactionHash, timeout);
                switch ((0, moi_utils_1.hexToBN)(receipt.ix_type)) {
                    case moi_utils_1.IxType.VALUE_TRANSFER:
                        resolve(null);
                        break;
                    case moi_utils_1.IxType.ASSET_CREATE:
                        if (receipt.extra_data) {
                            receipt.extra_data = receipt.extra_data;
                            resolve(receipt.extra_data.asset_id);
                        }
                        reject({ message: "asset id not found" });
                        break;
                    case moi_utils_1.IxType.ASSET_MINT:
                    case moi_utils_1.IxType.ASSET_BURN:
                        if (receipt.extra_data) {
                            receipt.extra_data = receipt.extra_data;
                            resolve(receipt.extra_data["total_supply"]);
                        }
                        reject({ message: "total supply not found" });
                        break;
                    case moi_utils_1.IxType.LOGIC_DEPLOY:
                        if (receipt.extra_data) {
                            receipt.extra_data = receipt.extra_data;
                            resolve(receipt.extra_data);
                        }
                        reject({
                            message: "invalid logic deploy response",
                            error: null
                        });
                        break;
                    case moi_utils_1.IxType.LOGIC_INVOKE:
                        if (receipt.extra_data) {
                            receipt.extra_data = receipt.extra_data;
                            resolve(receipt.extra_data);
                        }
                        reject({
                            message: "invalid logic invoke response",
                            error: null
                        });
                        break;
                    default:
                        reject({
                            message: "unsupported interaction type",
                            error: null
                        });
                }
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * isServerError
     *
     * Checks if the error object represents a server error.
     * @param error - The AxiosError object.
     * @returns A boolean indicating whether the error is a server error.
     */
    isServerError(error) {
        return error.response && error.response.status >= 500 && error.response.status < 600;
    }
    /**
     * execute
     *
     * Executes an RPC method with the specified parameters.
     * @param method - The RPC method to execute.
     * @param params - The parameters to pass to the RPC method.
     * @returns A Promise that resolves to the response of the RPC call.
     * @throws Error if the method is not implemented.
     */
    execute(method, params) {
        throw new Error(method + " not implemented");
    }
    /**
     * _startEvent
     *
     * Starts the specified event by performing necessary actions.
     * @param event - The event to start.
     */
    _startEvent(event) {
    }
    /**
     * _stopEvent
     *
     * Stops the specified event by performing necessary actions.
     * @param event - The event to stop.
     */
    _stopEvent(event) {
    }
    /**
     * _addEventListener
     *
     * Adds an event listener for the specified event.
     * @param eventName - The name of the event to listen to.
     * @param listener - The listener function to be called when the event is emitted.
     * @param once - Indicates whether the listener should be called only once (true) or
     *  multiple times (false).
     * @returns The instance of the class to allow method chaining.
     */
    _addEventListener(eventName, listener, once) {
        const event = new event_1.default(getEventTag(eventName), listener, once);
        this._events.push(event);
        this._startEvent(event);
        return this;
    }
    /**
     * emit
     *
     * Emits the specified event and calls all the associated listeners.
     * @param eventName - The name of the event to emit.
     * @param args - The arguments to be passed to the event listeners.
     * @returns A boolean indicating whether any listeners were called for the event.
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
     * on
     *
     * Adds an event listener for the specified event.
     * @param eventName - The name of the event to listen to.
     * @param listener - The listener function to be called when the event is emitted.
     * @returns The instance of the class to allow method chaining.
     */
    on(eventName, listener) {
        return this._addEventListener(eventName, listener, false);
    }
    /**
     * once
     *
     * Adds a one-time event listener for the specified event.
     * @param eventName - The name of the event to listen to.
     * @param listener - The listener function to be called when the event is emitted.
     * @returns The instance of the class to allow method chaining.
     */
    once(eventName, listener) {
        return this._addEventListener(eventName, listener, true);
    }
    /**
     * listenerCount
     *
     * Returns the number of listeners for the specified event.
     * @param eventName - The name of the event.
     * @returns The number of listeners for the event.
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
     * listeners
     *
     * Returns an array of listeners for the specified event.
     * @param eventName - The name of the event.
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
     * off
     *
     * Removes an event listener for the specified event.
     * If no listener is specified, removes all listeners for the event.
     * @param eventName - The name of the event to remove the listener from.
     * @param listener - The listener function to remove. If not provided,
     * removes all listeners for the event.
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
     * removeAllListeners
     *
     * Removes all listeners for the specified event.
     * If no event is specified, removes all listeners for all events.
     * @param eventName - The name of the event to remove all listeners from.
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
exports.BaseProvider = BaseProvider;
// helper functions
/**
 * Retrieves the event tag based on the event name.
 * @param eventName - The name of the event.
 * @returns The event tag.
 * @throws Error if the event name is invalid.
 */
const getEventTag = (eventName) => {
    if (typeof (eventName) === "string") {
        eventName = eventName.toLowerCase();
        if ((0, moi_utils_1.hexDataLength)(eventName) === 32) {
            return "tesseract:" + eventName;
        }
        if (eventName.indexOf(":") === -1) {
            return eventName;
        }
    }
    throw new Error("invalid event - " + eventName);
};
