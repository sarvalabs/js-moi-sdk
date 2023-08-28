import { LogicManifest } from "js-moi-manifest";
import { ErrorCode, ErrorUtils, IxType, AssetCreationReceipt, AssetMintOrBurnReceipt,
LogicDeployReceipt, LogicInvokeReceipt, Tesseract, Interaction, bytesToHex, hexDataLength, 
hexToBytes, unmarshal, hexToBN, toQuantity } from "js-moi-utils";
import { EventType, Listener } from "../types/event";
import { AccountMetaInfo, AccountParamsBase, AccountState, AssetInfo, 
AssetInfoParams, BalanceParams, ContextInfo, InteractionRequest, 
InteractionReceipt, InteractionParams, InteractionResponse, 
LogicManifestParams, Options, RpcResponse, StorageParams, TDU, TesseractParams, 
Content, AccountStateParams, DBEntryParams, ContentFrom, Status, 
Inspect, Encoding, AccountMetaInfoParams, InteractionByTesseractParams, 
Registry, TDUResponse, CallorEstimateIxObject, ConnectionsInfo, CallorEstimateOptions, NodeInfo } from "../types/jsonrpc";
import { processIxObject } from "./interaction";
import { AbstractProvider } from "./abstract-provider";
import Event from "./event";

// Default timeout value in seconds
const defaultTimeout: number = 120;

const defaultOptions: Options = {
    tesseract_number: -1
}

/**
 * Class representing a base provider for interacting with the MOI protocol.
 * Extends the AbstractProvider class and provides implementations for
 * account operations, execution, and querying RPC methods.
 */
export class BaseProvider extends AbstractProvider {
    protected _events: Event[];

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
    protected processResponse(response: RpcResponse): any {
        if(response.result) {
            if(response.result.data) {
                return response.result.data;
            }

            ErrorUtils.throwError(
                response.result.error.message, 
                ErrorCode.SERVER_ERROR,
            );
        }

        ErrorUtils.throwError(
            response.error.message, 
            ErrorCode.SERVER_ERROR,
        );
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
    public async getBalance(address: string, assetId: string, options?: Options): Promise<number | bigint> {
        try {
            const params: BalanceParams = {
                address: address,
                asset_id: assetId,
                options: options ? options : defaultOptions
            }
    
            const response: RpcResponse = await this.execute("moi.Balance", params);

            const balance = this.processResponse(response);

            return hexToBN(balance);
        } catch (error) {
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
    public async getContextInfo(address: string, options?: Options): Promise<ContextInfo> {
        try {
            const params: AccountParamsBase = {
                address: address,
                options: options ? options : defaultOptions
            }
    
            const response: RpcResponse = await this.execute("moi.ContextInfo", params);

            return this.processResponse(response);
        } catch (error) {
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
    public async getTDU(address: string, options?: Options): Promise<TDU[]> {
        try {
            const params: AccountParamsBase = {
                address: address,
                options: options ? options : defaultOptions
            }
    
            const response: RpcResponse = await this.execute("moi.TDU", params);

            const tdu = this.processResponse(response);

            return tdu.map((asset: TDUResponse) => ({
                asset_id: asset.asset_id,
                amount: hexToBN(asset.amount)
            }));
        } catch (error) {
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
    public async getInteractionByHash(ixHash: string): Promise<Interaction> {
        try {
            const params: InteractionParams = {
                hash: ixHash
            }
    
            const response: RpcResponse = await this.execute("moi.InteractionByHash", params)

            return this.processResponse(response)
        } catch(err) {
            throw err;
        }
    }

    /**
     * Retrieves the interaction information for the specified address and tesseract options.
     * 
     * @param address - The address for which to retrieve the interaction.
     * @param options - The tesseract options. (optional)
     * @param ix_index - The index of the interaction to retrieve.
     * @returns A Promise that resolves to the interaction information.
     * @throws Error if there is an error executing the RPC call.
     */
    public async getInteractionByTesseract(address: string, options?: Options, ix_index: string = toQuantity(1)): Promise<Interaction> {
        try {
            const params: InteractionByTesseractParams = {
                address: address,
                options: options ? options : defaultOptions,
                ix_index: ix_index
            }
    
            const response: RpcResponse = await this.execute("moi.InteractionByTesseract", params)

            return this.processResponse(response)
        } catch(err) {
            throw err;
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
    public async getInteractionCount(address: string, options?: Options): Promise<number | bigint> {
        try {
            const params: AccountParamsBase = {
                address: address,
                options: options ? options : defaultOptions
            }
    
            const response: RpcResponse = await this.execute("moi.InteractionCount", params);

            const ixCount = this.processResponse(response);

            return hexToBN(ixCount);
        } catch (error) {
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
    public async getPendingInteractionCount(address: string): Promise<number | bigint> {
        try {
            const params: AccountParamsBase = {
                address: address
            }
    
            const response: RpcResponse = await this.execute("moi.PendingInteractionCount", params);

            const ixCount = this.processResponse(response);

            return hexToBN(ixCount);
        } catch (error) {
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
    public async getAccountState(address: string, options?: Options): Promise<AccountState> {
        try {
            const params: AccountStateParams = {
                address: address,
                options: options ? options : defaultOptions
            }
    
            const response: RpcResponse = await this.execute("moi.AccountState", params)

            return this.processResponse(response)
        } catch (error) {
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
    public async getAccountMetaInfo(address: string): Promise<AccountMetaInfo> {
        try {
            const params: AccountMetaInfoParams = {
                address: address
            }
    
            const response: RpcResponse = await this.execute("moi.AccountMetaInfo", params)

            return this.processResponse(response)
        } catch (error) {
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
    public async getContentFrom(address: string): Promise<ContentFrom> {
        try {
            const params: AccountParamsBase = {
                address: address
            }
    
            const response: RpcResponse = await this.execute("ixpool.ContentFrom", params)

            const content = this.processResponse(response)

            const contentResponse = {
                pending: new Map(),
                queued: new Map(),
            }

            Object.keys(content.pending).forEach(nonce => 
                contentResponse.pending.set(
                    hexToBN(nonce),
                    content.pending[nonce]
                )
            )

            Object.keys(content.queued).forEach(nonce => 
                contentResponse.queued.set(
                    hexToBN(nonce),
                    content.queued[nonce]
                )
            )

            return contentResponse
        } catch (error) {
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
    public async getWaitTime(address: string): Promise<number | bigint> {
        try {
            const params: AccountParamsBase = {
                address: address
            }
    
            const response: RpcResponse = await this.execute("ixpool.WaitTime", params)

            return this.processResponse(response)
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves a Tesseract for a specific address.
     * 
     * @param {string} address - The address for which to retrieve the Tesseract.
     * @param {boolean} with_interactions - A boolean value indicating whether to include
     * interactions in the Tesseract.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<Tesseract>} A promise that resolves to the Tesseract.
     * @throws {Error} if there is an error executing the RPC call.
     */
    public async getTesseract(address: string, with_interactions: boolean, options?: Options): Promise<Tesseract> {
        try {
            const params: TesseractParams = {
                address: address,
                with_interactions: with_interactions,
                options: options ? options : defaultOptions
            }
    
            const response: RpcResponse = await this.execute("moi.Tesseract", params)

            return this.processResponse(response)
        } catch (error) {
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
    public async getLogicIds(address: string, options?: Options): Promise<string[]> {
        try {
            const params: AccountParamsBase = {
                address: address,
                options: options ? options : defaultOptions
            }
    
            const response: RpcResponse = await this.execute("moi.LogicIDs", params)

            return this.processResponse(response)
        } catch (error) {
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
    public async getRegistry(address: string, options?: Options): Promise<Registry> {
        try {
            const params: AccountParamsBase = {
                address: address,
                options: options ? options : defaultOptions
            }
    
            const response: RpcResponse = await this.execute("moi.Registry", params)

            return this.processResponse(response)
        } catch (error) {
            throw error;
        }
    }

    // Execution Methods

    /**
     * Handles the interaction without modifying the account's current state.
     * 
     * @param {CallorEstimateIxObject} ixObject - The interaction object.
     * @param {CallorEstimateOptions} options - The interaction options. (optional)
     * @returns {Promise<InteractionReceipt>} A Promise resolving to the 
     * interaction receipt.
     * @throws {Error} if there's an issue executing the RPC call or 
     * processing the response.
     */
    public async call(ixObject: CallorEstimateIxObject, options?: CallorEstimateOptions): Promise<InteractionReceipt> {
        try {
            const params = {
                ix_args: processIxObject(ixObject),
                options : options
            }

            const response: RpcResponse = await this.execute("moi.Call", params)

            return this.processResponse(response)
        } catch (error) {
            throw error
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
    public async estimateFuel(ixObject: CallorEstimateIxObject, options?: CallorEstimateOptions): Promise<number | bigint> {
        try {
            const params = {
                ix_args: processIxObject(ixObject),
                options : options
            }

            const response: RpcResponse = await this.execute("moi.FuelEstimate", params)

            const fuelPrice = this.processResponse(response)

            return  hexToBN(fuelPrice)
        } catch (error) {
            throw error
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
    public async sendInteraction(ixObject: InteractionRequest): Promise<InteractionResponse> {
        const response: RpcResponse = await this.execute("moi.SendInteractions", ixObject)

        try {
            if(response.result) {
                if(response.result.data) {
                    return {
                        hash: response.result.data,
                        wait: this.waitForInteraction.bind(this, response.result.data),
                        result: this.waitForResult.bind(this, response.result.data)
                    }
                }
    
                ErrorUtils.throwError(
                    response.result.error.message, 
                    ErrorCode.SERVER_ERROR,
                );
            }
    
            ErrorUtils.throwError(
                response.error.message, 
                ErrorCode.SERVER_ERROR,
            );
        } catch (error) {
            throw error
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
    public async getAssetInfoByAssetID(assetId: string, options?: Options): Promise<AssetInfo> {
        try {
            const params: AssetInfoParams = {
                asset_id: assetId,
                options: options ? options : defaultOptions,
            }
    
            const response: RpcResponse = await this.execute("moi.AssetInfoByAssetID", params)

            return this.processResponse(response)
        } catch (error) {
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
    public async getInteractionReceipt(ixHash: string): Promise<InteractionReceipt> {
        try {
            const params: InteractionParams = {
                hash: ixHash
            }
    
            const response: RpcResponse = await this.execute("moi.InteractionReceipt", params)

            return this.processResponse(response)
        } catch (error) {
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
    public async getStorageAt(logicId: string, storageKey: string, options?: Options): Promise<string> {
        try {
            const params: StorageParams = {
                logic_id: logicId,
                storage_key: storageKey,
                options: options ? options : defaultOptions
            }
    
            const response = await this.execute("moi.LogicStorage", params)

            return this.processResponse(response)
        } catch (error) {
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
    public async getLogicManifest(logicId: string, encoding: Encoding, options?: Options): Promise<string | LogicManifest.Manifest> {
        try {
            const params: LogicManifestParams = {
                logic_id: logicId,
                encoding: encoding,
                options: options ? options : defaultOptions
            }
    
            const response: RpcResponse = await this.execute("moi.LogicManifest", params)
            const data = this.processResponse(response);
            const decodedManifest = hexToBytes(data)

            switch(encoding) {
                case "JSON":
                    return unmarshal(decodedManifest);
                case "POLO":
                    return bytesToHex(decodedManifest);
                default:
                    throw new Error("Unsupported encoding format!");
            }
        } catch (error) {
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
    public async getContent(): Promise<Content> {
        try {
            const response: RpcResponse = await this.execute("ixpool.Content", null)
            const content = this.processResponse(response)
            const contentResponse = {
                pending: new Map(),
                queued: new Map(),
            }

            Object.keys(content.pending).forEach(key => {
                contentResponse.pending.set(key, new Map())
                Object.keys(content.pending[key]).forEach(nonce => 
                    contentResponse.pending.get(key).set(
                        hexToBN(nonce), 
                        content.pending[key][nonce]
                    )
                )
            })

            Object.keys(content.queued).forEach(key => {
                contentResponse.queued.set(key, new Map())
                Object.keys(content.queued[key]).forEach(nonce => 
                    contentResponse.queued.get(key).set(
                        hexToBN(nonce), 
                        content.queued[key][nonce]
                    )
                )
            })

            return contentResponse;
        } catch (error) {
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
    public async getStatus(): Promise<Status> {
        try {
            const response: RpcResponse = await this.execute("ixpool.Status", null)
            const status = this.processResponse(response)

            return {
                pending: hexToBN(status.pending),
                queued: hexToBN(status.queued)
            }
        } catch (error) {
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
    public async getInspect(): Promise<Inspect> {
        try {
            const response: RpcResponse = await this.execute("ixpool.Inspect", null)
            const inspect = this.processResponse(response)
            const inspectResponse = {
                pending: new Map(),
                queued: new Map(),
                wait_time: new Map()
            }

            Object.keys(inspect.pending).forEach(key => {
                inspectResponse.pending.set(key, new Map(Object.entries(inspect.pending[key])))
            })

            Object.keys(inspect.queued).forEach(key => {
                inspectResponse.queued.set(key, new Map(Object.entries(inspect.queued[key])))
            })

            Object.keys(inspectResponse.wait_time).forEach(key => {
                inspectResponse.wait_time.set(key, {
                    ...inspectResponse.wait_time[key],
                    time: hexToBN(inspectResponse.wait_time[key]["time"])
                })
            })

            return inspectResponse
        } catch (error) {
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
    public async getPeers(): Promise<string[]> {
        try {
            const response: RpcResponse = await this.execute("net.Peers", null)
            return this.processResponse(response)
        } catch (error) {
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
    public async getVersion(): Promise<string> {
        try {
            const response: RpcResponse = await this.execute("net.Version", null)
            return this.processResponse(response)
        } catch (error) {
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
    public async getNodeInfo(): Promise<NodeInfo> {
        try {
            const response: RpcResponse = await this.execute("net.Info", null)
            return this.processResponse(response)
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves the value of a database entry with the specified key.
     * 
     * @param {string} key - The key of the database entry.
     * @returns {Promise<string>} A Promise that resolves to the value of the 
     * database entry as a string.
     * @throws {Error} if there is an error executing the RPC call or processing 
     * the response.
     */
    public async getDBEntry(key: string): Promise<string> {
        try {
            const params: DBEntryParams = {
                key: key
            }
    
            const response: RpcResponse = await this.execute("debug.DBGet", params)

            return this.processResponse(response)
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves the list of all registered accounts from a moipod.
     * 
     * @returns {Promise<string[]>} A Promise that resolves to the list of 
     * accounts.
     * @throws {Error} if there is an error executing the RPC call or processing 
     * the response.
     */
    public async getAccounts(): Promise<string[]> {
        try {
            const response: RpcResponse = await this.execute("debug.Accounts", null)
            return this.processResponse(response)
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves information about active network connections.
     * 
     * @returns {Promise<ConnectionsInfo>} A Promise that resolves to an array of 
     * connection response object.
     * @throws {Error} if there is an error executing the RPC call or processing 
     * the response.
     */
    public async getConnections(): Promise<ConnectionsInfo> {
        try {
            const response: RpcResponse = await this.execute("debug.Connections", null)
            return this.processResponse(response)
        } catch (error) {
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
    protected async waitForInteraction(interactionHash: string, timeout?: number): Promise<InteractionReceipt> {
        if(timeout == undefined) {
            timeout = defaultTimeout
        }

        return new Promise(async (resolve, reject) => {
            let intervalId: ReturnType<typeof setInterval>;
            let timeoutId: ReturnType<typeof setTimeout>;

            const checkReceipt = async() => {
                try {
                    const receipt = await this.getInteractionReceipt(interactionHash);
    
                    if(receipt) {
                        resolve(receipt)
                        clearInterval(intervalId)
                        clearTimeout(timeoutId)
                    }
                } catch(err) {

                }
            }

            await checkReceipt();

            intervalId = setInterval(checkReceipt, 5000)

            timeoutId = setTimeout(() => {
                clearInterval(intervalId);
                reject({message: "failed to fetch receipt"})
            }, timeout * 1000)
        })
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
    protected async waitForResult(interactionHash: string, timeout?: number): Promise<any> {
        return new Promise(async(resolve, reject) => {
            try {
                const receipt = await this.waitForInteraction(interactionHash, timeout);

                switch(hexToBN(receipt.ix_type)) {
                    case IxType.VALUE_TRANSFER:
                        resolve(null);
                        
                        break;
                    case IxType.ASSET_CREATE:
                        if(receipt.extra_data) {
                            resolve(receipt.extra_data as AssetCreationReceipt);
                        }

                        reject(new Error("Failed to retrieve asset creation response"));

                        break;
                    case IxType.ASSET_MINT:
                    case IxType.ASSET_BURN:
                        if(receipt.extra_data) {
                            resolve(receipt.extra_data as AssetMintOrBurnReceipt);
                        }

                        reject(new Error("Failed to retrieve asset mint/burn response"));

                        break;
                    case IxType.LOGIC_DEPLOY:
                        if(receipt.extra_data) {
                            resolve(receipt.extra_data as LogicDeployReceipt);
                        }

                        reject(new Error("Failed to retrieve logic deploy response"));

                        break;
                    case IxType.LOGIC_INVOKE:
                        if(receipt.extra_data) {
                            resolve(receipt.extra_data as LogicInvokeReceipt);
                        }

                        reject(new Error("Failed to retrieve logic invoke response"));

                        break;
                    default:
                        reject(new Error("Unsupported interaction type encountered"));
                }
            } catch(err) {
                reject(new Error(`An error occurred while waiting for result: ${err.message}`));
            }
        })
    }

    /**
     * Checks if the response object represents a server error.
     * 
     * @param {Response} response - The Response object.
     * @returns {boolean} A boolean indicating whether the error is a server error.
     */
    protected isServerError(response: Response): boolean {
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
    protected execute(method: string, params: any): Promise<any> {
        throw new Error(method + " not implemented")
    }

    /**
     * Starts the specified event by performing necessary actions.
     * 
     * @param {Event} event - The event to start.
     */
    protected _startEvent(event: Event): void {
    }

    /** 
     * Stops the specified event by performing necessary actions.
     * 
     * @param {Event} event - The event to stop.
     */
    protected _stopEvent(event: Event): void {
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
    protected _addEventListener(eventName: EventType, listener: Listener, once: boolean): this {
        const event = new Event(getEventTag(eventName), listener, once)
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
    protected emit(eventName: EventType, ...args: Array<any>): boolean {
        let result = false;

        let stopped: Array<Event> = [ ];

        let eventTag = getEventTag(eventName);
        this._events = this._events.filter((event) => {
            if (event.tag !== eventTag) { return true; }

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
    public on(eventName: EventType, listener: Listener): this {
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
    public once(eventName: EventType, listener: Listener): this {
        return this._addEventListener(eventName, listener, true);
    }

    /**
     * Returns the number of listeners for the specified event.
     * 
     * @param {EventType} eventName - The name of the event.
     * @returns {number} The number of listeners for the event.
     */
    public listenerCount(eventName?: EventType): number {
        if (!eventName) { return this._events.length; }

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
    public listeners(eventName?: EventType): Array<Listener> {
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
    public off(eventName: EventType, listener?: Listener): this {
        if (listener == null) {
            return this.removeAllListeners(eventName);
        }

        const stopped: Array<Event> = [ ];

        let found = false;
        let eventTag = getEventTag(eventName);
        this._events = this._events.filter((event) => {
            if (event.tag !== eventTag || event.listener != listener) { return true; }
            if (found) { return true; }
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
    public removeAllListeners(eventName?: EventType): this {
        let stopped: Array<Event> = [ ];
        if (eventName == null) {
            stopped = this._events;

            this._events = [ ];
        } else {
            const eventTag = getEventTag(eventName);
            this._events = this._events.filter((event) => {
                if (event.tag !== eventTag) { return true; }
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
const getEventTag = (eventName: EventType): string => {
    if (typeof(eventName) === "string") {
        eventName = eventName.toLowerCase();

        if (hexDataLength(eventName) === 32) {
            return "tesseract:" + eventName;
        }

        if (eventName.indexOf(":") === -1) {
            return eventName;
        }
    }

    throw new Error("invalid event - " + eventName);
}
