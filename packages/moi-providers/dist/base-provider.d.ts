import { AxiosError } from "axios";
import { LogicManifest, Tesseract, Interaction } from "moi-utils";
import { EventType, Listener } from "../types/event";
import { AccountMetaInfo, AccountState, AssetInfo, ContextInfo, InteractionRequest, InteractionReceipt, InteractionResponse, Options, RpcResponse, TDU, Content, ContentFrom, Status, Inspect, Encoding, Registry } from "../types/jsonrpc";
import { AbstractProvider } from "./abstract-provider";
import Event from "./event";
/**
 * BaseProvider
 *
 * Class representing a base provider for interacting with the MOI protocol.
 * Extends the AbstractProvider class and provides implementations for
 * account operations, execution, and querying RPC methods.
 */
export declare class BaseProvider extends AbstractProvider {
    protected _events: Event[];
    constructor();
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
    protected processResponse(response: RpcResponse): any;
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
    getBalance(address: string, assetId: string, options?: Options): Promise<number | bigint>;
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
    getContextInfo(address: string, options?: Options): Promise<ContextInfo>;
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
    getTDU(address: string, options?: Options): Promise<TDU>;
    /**
     * getInteractionByHash
     *
     * Retrieves the interaction information for the specified interaction hash.
     *
     * @param ixHash - The hash of the interaction to retrieve.
     * @returns A Promise that resolves to the interaction information.
     * @throws Error if there is an error executing the RPC call.
     */
    getInteractionByHash(ixHash: string): Promise<Interaction>;
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
    getInteractionByTesseract(address: string, options?: Options, ix_index?: string): Promise<Interaction>;
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
    getInteractionCount(address: string, options?: Options): Promise<number | bigint>;
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
    getPendingInteractionCount(address: string): Promise<number | bigint>;
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
    getAccountState(address: string, options?: Options): Promise<AccountState>;
    /**
     * getAccountMetaInfo
     *
     * Retrieves the account meta information for the specified address.
     * @param address - The address for which to retrieve the account meta information.
     * @returns A Promise that resolves to the account meta information.
     * @throws Error if there is an error executing the RPC call.
     */
    getAccountMetaInfo(address: string): Promise<AccountMetaInfo>;
    /**
     * getContentFrom
     *
     * Retrieves the content from a specific address.
     * @param address - The address for which to retrieve the content.
     * @returns A Promise that resolves to the content information.
     * @throws Error if there is an error executing the RPC call.
     */
    getContentFrom(address: string): Promise<ContentFrom>;
    /**
     * getWaitTime
     *
     * Retrieves the wait time for a specific account in ixpool.
     * @param address - The address for which to retrieve the wait time.
     * @returns A promise that resolves to the wait time (in seconds) as a number or bigint.
     * @throws Error if there is an error executing the RPC call.
     */
    getWaitTime(address: string): Promise<number | bigint>;
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
    getTesseract(address: string, with_interactions: boolean, options?: Options): Promise<Tesseract>;
    /**
     * getRegistry
     *
     * Retrieves the registry for a specific address.
     * @param address - The address for which to retrieve the registry.
     * @param options - The tesseract options. (optional)
     * @returns A Promise that resolves to the registry.
     * @throws Error if there is an error executing the RPC call.
     */
    getRegistry(address: string, options?: Options): Promise<Registry>;
    /**
     * sendInteraction
     *
     * Sends an interaction request.
     * @param ixObject - The interaction request object.
     * @returns A Promise that resolves to the interaction response.
     * @throws Error if there is an error executing the RPC call or processing the response.
     */
    sendInteraction(ixObject: InteractionRequest): Promise<InteractionResponse>;
    /**
     * getAssetInfoByAssetID
     *
     * Retrieves the asset information for a specific asset id.
     * @param assetId - The asset id for which to retrieve the asset information.
     * @returns A Promise that resolves to the asset information.
     * @throws Error if there is an error executing the RPC call.
     */
    getAssetInfoByAssetID(assetId: string): Promise<AssetInfo>;
    /**
     * getInteractionReceipt
     *
     * Retrieves the interaction receipt for a specific interaction hash.
     * @param ixHash - The hash of the interaction for which to retrieve the receipt.
     * @returns A Promise that resolves to the interaction receipt.
     * @throws Error if there is an error executing the RPC call.
     */
    getInteractionReceipt(ixHash: string): Promise<InteractionReceipt>;
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
    getStorageAt(logicId: string, storageKey: string, options?: Options): Promise<string>;
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
    getLogicManifest(logicId: string, encoding: Encoding, options?: Options): Promise<string | LogicManifest.Manifest>;
    /**
     * getContent
     *
     * Retrieves all the interactions that are pending for inclusion in the next
     * Tesseract(s) or are scheduled for future execution.
     * @returns A Promise that resolves to the content of the interaction pool.
     * @throws Error if there is an error executing the RPC call or processing the response.
     */
    getContent(): Promise<Content>;
    /**
     * getStatus
     *
     * Retrieves the total number of pending and queued interactions in
     * the interaction pool.
     * @returns A Promise that resolves to the status of the interaction pool.
     * @throws Error if there is an error executing the RPC call or processing the response.
     */
    getStatus(): Promise<Status>;
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
    getInspect(): Promise<Inspect>;
    /**
     * getPeers
     *
     * Retrieves the list of peers connected to the specific moipod.
     * @returns A Promise that resolves to the list of peers.
     * @throws Error if there is an error executing the RPC call or processing the response.
     */
    getPeers(): Promise<string[]>;
    /**
     * getDBEntry
     *
     * Retrieves the value of a database entry with the specified key.
     * @param key - The key of the database entry.
     * @returns A Promise that resolves to the value of the database entry as a string.
     * @throws Error if there is an error executing the RPC call or processing the response.
     */
    getDBEntry(key: string): Promise<string>;
    /**
     * getAccounts
     *
     * Retrieves the list of all registered accounts from a moipod.
     * @returns A Promise that resolves to the list of accounts.
     * @throws Error if there is an error executing the RPC call or processing the response.
     */
    getAccounts(): Promise<string[]>;
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
    protected waitForInteraction(interactionHash: string, timeout?: number): Promise<InteractionReceipt>;
    /**
     * Waits for the interaction with the specified hash to be included in a
     * tesseract and returns the result based on the interaction type.
     * @param interactionHash - The hash of the interaction.
     * @param timeout - The timeout duration in seconds (optional).
     * @returns A Promise that resolves to the result of the interaction.
     * @throws Error if there is an error executing the RPC call, processing the
     * response, or the timeout is reached.
     */
    protected waitForResult(interactionHash: string, timeout?: number): Promise<any>;
    /**
     * isServerError
     *
     * Checks if the error object represents a server error.
     * @param error - The AxiosError object.
     * @returns A boolean indicating whether the error is a server error.
     */
    protected isServerError(error: AxiosError): boolean;
    /**
     * execute
     *
     * Executes an RPC method with the specified parameters.
     * @param method - The RPC method to execute.
     * @param params - The parameters to pass to the RPC method.
     * @returns A Promise that resolves to the response of the RPC call.
     * @throws Error if the method is not implemented.
     */
    protected execute(method: string, params: any): Promise<any>;
    /**
     * _startEvent
     *
     * Starts the specified event by performing necessary actions.
     * @param event - The event to start.
     */
    protected _startEvent(event: Event): void;
    /**
     * _stopEvent
     *
     * Stops the specified event by performing necessary actions.
     * @param event - The event to stop.
     */
    protected _stopEvent(event: Event): void;
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
    protected _addEventListener(eventName: EventType, listener: Listener, once: boolean): this;
    /**
     * emit
     *
     * Emits the specified event and calls all the associated listeners.
     * @param eventName - The name of the event to emit.
     * @param args - The arguments to be passed to the event listeners.
     * @returns A boolean indicating whether any listeners were called for the event.
     */
    protected emit(eventName: EventType, ...args: Array<any>): boolean;
    /**
     * on
     *
     * Adds an event listener for the specified event.
     * @param eventName - The name of the event to listen to.
     * @param listener - The listener function to be called when the event is emitted.
     * @returns The instance of the class to allow method chaining.
     */
    on(eventName: EventType, listener: Listener): this;
    /**
     * once
     *
     * Adds a one-time event listener for the specified event.
     * @param eventName - The name of the event to listen to.
     * @param listener - The listener function to be called when the event is emitted.
     * @returns The instance of the class to allow method chaining.
     */
    once(eventName: EventType, listener: Listener): this;
    /**
     * listenerCount
     *
     * Returns the number of listeners for the specified event.
     * @param eventName - The name of the event.
     * @returns The number of listeners for the event.
     */
    listenerCount(eventName?: EventType): number;
    /**
     * listeners
     *
     * Returns an array of listeners for the specified event.
     * @param eventName - The name of the event.
     * @returns An array of listeners for the event.
     */
    listeners(eventName?: EventType): Array<Listener>;
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
    off(eventName: EventType, listener?: Listener): this;
    /**
     * removeAllListeners
     *
     * Removes all listeners for the specified event.
     * If no event is specified, removes all listeners for all events.
     * @param eventName - The name of the event to remove all listeners from.
     * @returns The instance of the class to allow method chaining.
     */
    removeAllListeners(eventName?: EventType): this;
}
