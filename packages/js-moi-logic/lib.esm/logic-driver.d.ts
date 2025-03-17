import { Identifier } from "js-moi-identifiers";
import type { InteractionResponse, LogicMessageRequestOption, SimulateInteractionRequest, TimerOption } from "js-moi-providers";
import type { Signer, SignerIx } from "js-moi-signer";
import { LogicState, OpType, RoutineType, StorageKey, type Hex, type InteractionRequest, type IxOperation, type LogicManifest, type LogicMessage } from "js-moi-utils";
import { LogicDescriptor } from "./logic-descriptor";
import type { LogicDriverOption, LogicRoutines, StateAccessorFn } from "./types";
/**
 * It is class that is used to interact with the logic.
 *
 * It provides methods to interact with the logic, such
 * as invoking callsites, deploying the logic, and retrieving logic storage.
 *
 * Inherit from `LogicDescriptor` class.
 */
export declare class LogicDriver<TRoutines extends LogicRoutines = LogicRoutines> extends LogicDescriptor {
    private signer;
    readonly endpoint: TRoutines;
    private deployIxResponse?;
    constructor(option: Omit<LogicDriverOption, "logicId"> & {
        logicId?: Identifier;
    });
    /**
     * Checks if the logic has been deployed.
     *
     * This method attempts to retrieve the logic ID. If the logic ID is successfully
     * retrieved, it indicates that the logic has been deployed. If an error occurs
     * during the retrieval, it is assumed that the logic has not been deployed.
     *
     * @returns A promise that resolves to `true` if the logic is deployed, otherwise `false`.
     */
    isDeployed(): Promise<boolean>;
    /**
     * Retrieves the type of a routine.
     *
     * @param routine - The name of the routine.
     * @returns The type of the specified routine.
     */
    getRoutineType(routine: string): RoutineType;
    /**
     * Determines if the routine is mutable based on its routine kind.
     *
     * @param routine - The identifier of the routine to check.
     * @returns A boolean indicating whether the routine is mutable.
     */
    isRoutineMutable(routine: string): boolean;
    private extractArgsAndOption;
    /**
     * Creates an interaction operation for the specified routine.
     *
     * @param routine - The name of the routine.
     * @param args - The arguments to pass to the routine.
     * @returns A promise that resolves to an interaction operation.
     *
     * @throws an error if the routine is not present.
     */
    createIxOperation(routine: string, args: unknown[]): Promise<IxOperation<OpType.LogicDeploy> | IxOperation<OpType.LogicInvoke> | IxOperation<OpType.LogicEnlist>>;
    /**
     * Creates an interaction request for a given routine and its arguments.
     *
     * @param routine - The name of the routine function to be invoked.
     * @param routineArguments - An array of arguments to be passed to the routine function.
     * @param option - Optional parameters for the routine, including fuel price and fuel limit.
     * @returns A promise that resolves to a SignerIx object, which can be either a SimulateInteractionRequest or an InteractionRequest.
     *
     * @throws Will throw an error if the provided fuel limit is less than the required simulation effort.
     */
    createIxRequest(method: "moi.Simulate", routine: string, routineArguments: unknown[], params?: Omit<Partial<SignerIx<SimulateInteractionRequest>>, "operations">): Promise<SimulateInteractionRequest>;
    /**
     * Creates an interaction request for the specified callsite.
     *
     * @param method - name of the method to create the interaction request.
     * @param callsite - name of the callsite.
     * @param callsiteArguments - arguments to pass to the callsite.
     * @param params - interaction request parameters.
     */
    createIxRequest(method: "moi.Execute", routine: string, routineArguments: unknown[], params?: Omit<Partial<SignerIx<InteractionRequest>>, "operations">): Promise<InteractionRequest>;
    /**
     * Retrieves the logic ID associated with this instance. If the logic ID is already set, it returns the existing logic ID.
     *
     * - If the logic ID is not set but a deployment response is available, it processes the deployment response to extract and set the logic ID.
     * - If the deployment response contains an error or an unexpected result type, it throws an appropriate error.
     *
     * @param timer a optional timer to wait for the result.
     * @returns A promise that resolves to the logic ID.
     *
     * @throws If the logic id not deployed.
     * @throws If error occurs during the deployment process.
     */
    getLogicId(timer?: TimerOption): Promise<Identifier>;
    protected obtainLogicIdFromResponse(response: InteractionResponse, timer?: TimerOption): Promise<void>;
    private newRoutine;
    private setupEndpoint;
    /**
     * Retrieves the logic storage based on the provided state and storage key.
     *
     * @param state - The state of the logic storage, either Persistent or Ephemeral.
     * @param storageKey - The key used to access the storage, can be of type StorageKey or Hex.
     *
     * @returns A promise that resolves to the logic storage data.
     *
     * @throws Will throw an error if the logic state is invalid.
     */
    getLogicStorage(state: LogicState.Persistent, storageKey: StorageKey | Hex): Promise<Hex>;
    /**
     * Retrieves the logic storage based on the provided state, storage key, and identifier.
     *
     * @param state The state of the logic storage, either Persistent or Ephemeral.
     * @param storageKey The key used to access the storage, can be of type StorageKey or Hex.
     * @param identifier The identifier for which the storage is being accessed.
     */
    getLogicStorage(state: LogicState.Ephemeral, storageKey: StorageKey | Hex, identifier: Identifier): Promise<Hex>;
    /**
     * Retrieves the storage key for the provided state and accessor.
     *
     * @param state - The state of the logic storage, either Persistent or Ephemeral.
     * @param accessor - The accessor used to generate the storage key.
     * @returns The storage key for the provided state and accessor.
     */
    getStorageKey(state: LogicState, accessor: StateAccessorFn): StorageKey;
    /**
     * Retrieves the persistent storage value based on the provided accessor.
     *
     * @param storageKey - The storage key used to access the persistent storage.
     * @returns A promise that resolves to the persistent storage data in POLO encoding.
     */
    persistent(storageKey: StorageKey | Hex): Promise<Hex>;
    /**
     * Retrieves the persistent storage value based on the provided accessor.
     *
     * @param accessor - The accessor used to generate the storage key.
     * @returns A promise that resolves to the persistent storage decoded value.
     */
    persistent<T>(accessor: StateAccessorFn): Promise<T>;
    /**
     * Retrieves the ephemeral storage value based on the provided accessor.
     *
     * @param storageKey - The storage key used to access the ephemeral storage.
     * @returns A promise that resolves to the ephemeral storage data in POLO encoding.
     */
    ephemeral(identifier: Identifier | Hex, storageKey: StorageKey | Hex): Promise<Hex>;
    /**
     * Retrieves the ephemeral storage value based on the provided accessor.
     *
     * @param accessor - The accessor used to generate the storage key.
     * @returns A promise that resolves to the ephemeral storage decoded value.
     */
    ephemeral<T>(identifier: Identifier | Hex, accessor: StateAccessorFn): Promise<T>;
    /**
     * Retrieves logic messages based on the provided options.
     *
     * @param {LogicMessageRequestOption} [option] - Optional parameter to specify the request options for logic messages.
     * @returns {Promise<LogicMessage[]>} A promise that resolves to an array of logic messages.
     */
    getLogicMessages(option?: LogicMessageRequestOption): Promise<LogicMessage[]>;
}
/**
 * Retrieves a LogicDriver instance for the given logic ID.
 *
 * @param source - The source of the logic, either an logic identifier or a logic manifest.
 * @param signer - The signer object used to interact with the logic.
 * @returns A promise that resolves to a LogicDriver instance.
 *
 * @throws Will throw an error if the provider fails to retrieve the logic.
 *
 * @example
 * // Creating a LogicDriver instance using a logic manifest
 *
 * import { getLogicDriver, Wallet } from "js-moi-sdk";
 * import { provider } from "./provider";
 * import manifest from "./token-ledger.json";
 *
 * const wallet = await Wallet.fromMnemonic("...", { provider });
 * const driver = await getLogicDriver(manifest, wallet);
 *
 * console.log(driver);
 *
 * >> LogicDriver {  }
 *
 * @example
 * // Creating a LogicDriver instance using a logic id
 *
 * import { getLogicDriver, Wallet } from "js-moi-sdk";
 * import { provider } from "./provider";
 *
 * const logicId = "0x1234567890abcdef...";
 * const wallet = await Wallet.fromMnemonic("...", { provider });
 * const driver = await getLogicDriver(logicId, wallet);
 *
 * console.log(driver);
 *
 * >> LogicDriver {  }
 */
export declare const getLogicDriver: <TRoutines extends LogicRoutines = LogicRoutines>(source: Identifier | LogicManifest, signer: Signer) => Promise<LogicDriver<TRoutines>>;
//# sourceMappingURL=logic-driver.d.ts.map