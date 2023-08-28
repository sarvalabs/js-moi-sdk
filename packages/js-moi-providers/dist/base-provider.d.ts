import { LogicManifest } from "js-moi-manifest";
import { Tesseract, Interaction } from "js-moi-utils";
import { EventType, Listener } from "../types/event";
import { AccountMetaInfo, AccountState, AssetInfo, ContextInfo, InteractionRequest, InteractionReceipt, InteractionResponse, Options, RpcResponse, TDU, Content, ContentFrom, Status, Inspect, Encoding, Registry, CallorEstimateIxObject, ConnectionsInfo, CallorEstimateOptions, NodeInfo } from "../types/jsonrpc";
import { AbstractProvider } from "./abstract-provider";
import Event from "./event";
/**
 * Class representing a base provider for interacting with the MOI protocol.
 * Extends the AbstractProvider class and provides implementations for
 * account operations, execution, and querying RPC methods.
 */
export declare class BaseProvider extends AbstractProvider {
    protected _events: Event[];
    constructor();
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
    protected processResponse(response: RpcResponse): any;
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
    getBalance(address: string, assetId: string, options?: Options): Promise<number | bigint>;
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
    getContextInfo(address: string, options?: Options): Promise<ContextInfo>;
    /**
     * Retrieves the TDU (Total Digital Utility) for the specified address.
     *
     * @param {string} address - The address for which to retrieve the TDU.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<TDU[]>} A Promise that resolves to the TDU object.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getTDU(address: string, options?: Options): Promise<TDU[]>;
    /**
     * Retrieves the interaction information for the specified interaction hash.
     *
     * @param {string} ixHash - The hash of the interaction to retrieve.
     * @returns {Promise<Interaction>} A Promise that resolves to the interaction information.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getInteractionByHash(ixHash: string): Promise<Interaction>;
    /**
     * Retrieves the interaction information for the specified address and tesseract options.
     *
     * @param address - The address for which to retrieve the interaction.
     * @param options - The tesseract options. (optional)
     * @param ix_index - The index of the interaction to retrieve.
     * @returns A Promise that resolves to the interaction information.
     * @throws Error if there is an error executing the RPC call.
     */
    getInteractionByTesseract(address: string, options?: Options, ix_index?: string): Promise<Interaction>;
    /**
     * Retrieves the total number of interactions for the specified address.
     *
     * @param {string} address - The address for which to retrieve the interaction count.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<number | bigint>} A Promise that resolves to the number
     * of interactions as a number or bigint.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getInteractionCount(address: string, options?: Options): Promise<number | bigint>;
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
    getPendingInteractionCount(address: string): Promise<number | bigint>;
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
    getAccountState(address: string, options?: Options): Promise<AccountState>;
    /**
     * Retrieves the account meta information for the specified address.
     *
     * @param {string} address - The address for which to retrieve the account
     * meta information.
     * @returns {Promise<AccountMetaInfo>} A Promise that resolves to the
     * account meta information.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getAccountMetaInfo(address: string): Promise<AccountMetaInfo>;
    /**
     * Retrieves the content from a specific address.
     *
     * @param {string} address - The address for which to retrieve the content.
     * @returns {Promise<ContentFrom>} A Promise that resolves to the content
     * information.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getContentFrom(address: string): Promise<ContentFrom>;
    /**
     * Retrieves the wait time for a specific account in ixpool.
     *
     * @param {string} address - The address for which to retrieve the wait time.
     * @returns {Promise<number | bigint>} A promise that resolves to the wait
     * time (in seconds) as a number or bigint.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getWaitTime(address: string): Promise<number | bigint>;
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
    getTesseract(address: string, with_interactions: boolean, options?: Options): Promise<Tesseract>;
    /**
     * Retrieves the logic id's associated with a specific address.
     *
     * @param {string} address - The address for which to retrieve the logic id's.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<string[]>} A Promise that resolves to an array of logic id's.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getLogicIds(address: string, options?: Options): Promise<string[]>;
    /**
     * Retrieves the registry for a specific address.
     *
     * @param {string} address - The address for which to retrieve the registry.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<Registry>} A Promise that resolves to the registry.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getRegistry(address: string, options?: Options): Promise<Registry>;
    /**
     * Invokes a routine in logic using the provided interaction object.
     *
     * @param {CallorEstimateIxObject} ixObject - The interaction object.
     * @param {CallorEstimateOptions} options - The interaction options. (optional)
     * @returns {Promise<InteractionReceipt>} A Promise resolving to the
     * interaction receipt.
     * @throws {Error} if there's an issue executing the RPC call or
     * processing the response.
     */
    call(ixObject: CallorEstimateIxObject, options?: CallorEstimateOptions): Promise<InteractionReceipt>;
    /**
     * Estimates the amount of fuel required for a logic routine call.
     *
     * @param {CallorEstimateIxObject} ixObject - The interaction object.
     * @param {CallorEstimateOptions} options - The interaction options. (optional)
     * @returns {Promise<number | bigint>} A Promise resolving to the estimated
     * fuel amount.
     * @throws {Error} if there's an issue executing the RPC call or
     * processing the response.
     */
    estimateFuel(ixObject: CallorEstimateIxObject, options?: CallorEstimateOptions): Promise<number | bigint>;
    /**
     * Sends an interaction request.
     *
     * @param {InteractionRequest} ixObject - The interaction request object.
     * @returns {Promise<InteractionResponse>} A Promise that resolves to the
     * interaction response.
     * @throws {Error} if there is an error executing the RPC call or
     * processing the response.
     */
    sendInteraction(ixObject: InteractionRequest): Promise<InteractionResponse>;
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
    getAssetInfoByAssetID(assetId: string, options?: Options): Promise<AssetInfo>;
    /**
     * Retrieves the interaction receipt for a specific interaction hash.
     *
     * @param {string} ixHash - The hash of the interaction for which to
     * retrieve the receipt.
     * @returns {Promise<InteractionReceipt>} A Promise that resolves to the
     * interaction receipt.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getInteractionReceipt(ixHash: string): Promise<InteractionReceipt>;
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
    getStorageAt(logicId: string, storageKey: string, options?: Options): Promise<string>;
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
    getLogicManifest(logicId: string, encoding: Encoding, options?: Options): Promise<string | LogicManifest.Manifest>;
    /**
     * Retrieves all the interactions that are pending for inclusion in the next
     * Tesseract(s) or are scheduled for future execution.
     *
     * @returns {Promise<Content>} A Promise that resolves to the content of the
     * interaction pool.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    getContent(): Promise<Content>;
    /**
     * Retrieves the total number of pending and queued interactions in
     * the interaction pool.
     *
     * @returns {Promise<Status>} A Promise that resolves to the status of the
     * interaction pool.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    getStatus(): Promise<Status>;
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
    getInspect(): Promise<Inspect>;
    /**
     * Retrieves the list of peers connected to the specific moipod.
     *
     * @returns {Promise<string[]>} A Promise that resolves to the list of peers.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    getPeers(): Promise<string[]>;
    /**
     * Retrieves the version of the connected network.
     *
     * @returns {Promise<string>} A Promise that resolves to the network
     * version as a string.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    getVersion(): Promise<string>;
    /**
     * Retrieves detailed information about the connected node.
     *
     * @returns {Promise<NodeInfo>} A Promise that resolves to an object
     * containing node information.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    getNodeInfo(): Promise<NodeInfo>;
    /**
     * Retrieves the value of a database entry with the specified key.
     *
     * @param {string} key - The key of the database entry.
     * @returns {Promise<string>} A Promise that resolves to the value of the
     * database entry as a string.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    getDBEntry(key: string): Promise<string>;
    /**
     * Retrieves the list of all registered accounts from a moipod.
     *
     * @returns {Promise<string[]>} A Promise that resolves to the list of
     * accounts.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    getAccounts(): Promise<string[]>;
    /**
     * Retrieves information about active network connections.
     *
     * @returns {Promise<ConnectionsInfo>} A Promise that resolves to an array of
     * connection response object.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    getConnections(): Promise<ConnectionsInfo>;
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
    protected waitForInteraction(interactionHash: string, timeout?: number): Promise<InteractionReceipt>;
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
    protected waitForResult(interactionHash: string, timeout?: number): Promise<any>;
    /**
     * Checks if the response object represents a server error.
     *
     * @param {Response} response - The Response object.
     * @returns {boolean} A boolean indicating whether the error is a server error.
     */
    protected isServerError(response: Response): boolean;
    /**
     * Executes an RPC method with the specified parameters.
     *
     * @param {string} method - The RPC method to execute.
     * @param {any} params - The parameters to pass to the RPC method.
     * @returns {Promise<any>} A Promise that resolves to the response of the RPC call.
     * @throws {Error} if the method is not implemented.
     */
    protected execute(method: string, params: any): Promise<any>;
    /**
     * Starts the specified event by performing necessary actions.
     *
     * @param {Event} event - The event to start.
     */
    protected _startEvent(event: Event): void;
    /**
     * Stops the specified event by performing necessary actions.
     *
     * @param {Event} event - The event to stop.
     */
    protected _stopEvent(event: Event): void;
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
    protected _addEventListener(eventName: EventType, listener: Listener, once: boolean): this;
    /**
     * Emits the specified event and calls all the associated listeners.
     *
     * @param {EventType} eventName - The name of the event to emit.
     * @param {Array<any>} args - The arguments to be passed to the event listeners.
     * @returns {boolean} A boolean indicating whether any listeners were called
     * for the event.
     */
    protected emit(eventName: EventType, ...args: Array<any>): boolean;
    /**
     * Adds an event listener for the specified event.
     *
     * @param {EventType} eventName - The name of the event to listen to.
     * @param {Listener} listener - The listener function to be called when the event is emitted.
     * @returns The instance of the class to allow method chaining.
     */
    on(eventName: EventType, listener: Listener): this;
    /**
     * Adds a one-time event listener for the specified event.
     *
     * @param {EventType} eventName - The name of the event to listen to.
     * @param {Listener} listener - The listener function to be called when the
     * event is emitted.
     * @returns The instance of the class to allow method chaining.
     */
    once(eventName: EventType, listener: Listener): this;
    /**
     * Returns the number of listeners for the specified event.
     *
     * @param {EventType} eventName - The name of the event.
     * @returns {number} The number of listeners for the event.
     */
    listenerCount(eventName?: EventType): number;
    /**
     * Returns an array of listeners for the specified event.
     *
     * @param {EventType} eventName - The name of the event.
     * @returns An array of listeners for the event.
     */
    listeners(eventName?: EventType): Array<Listener>;
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
    off(eventName: EventType, listener?: Listener): this;
    /**
     * Removes all listeners for the specified event. If no event is specified,
     * removes all listeners for all events.
     *
     * @param {EventType} eventName - The name of the event to remove all
     * listeners from.
     * @returns The instance of the class to allow method chaining.
     */
    removeAllListeners(eventName?: EventType): this;
}
