import { Identifier, isIdentifier, LogicId } from "js-moi-identifiers";
import { isPrimitiveType, ManifestCoder, ManifestCoderFormat, Schema } from "js-moi-manifest";
import type { InteractionResponse, LogicMessageRequestOption, SimulateInteractionRequest, WaitOption } from "js-moi-providers";
import type { Signer, SignerIx } from "js-moi-signer";
import {
    ElementType,
    ErrorCode,
    ErrorUtils,
    generateStorageKey,
    hexToBytes,
    isHex,
    LogicState,
    OpType,
    RoutineKind,
    RoutineType,
    StorageKey,
    type Hex,
    type InteractionRequest,
    type IxOperation,
    type LogicManifest,
    type LogicMessage,
} from "js-moi-utils";
import { Depolorizer } from "js-polo";
import { LogicDescriptor } from "./logic-descriptor";
import { SlotAccessorBuilder } from "./state/accessor-builder";
import { StateAccessorBuilder } from "./state/state-accessor-builder";
import type { LogicDriverOption, LogicRoutines, RoutineCallback, RoutineOption, StateAccessorFn } from "./types";

/**
 * It is class that is used to interact with the logic.
 *
 * It provides methods to interact with the logic, such
 * as invoking callsites, deploying the logic, and retrieving logic storage.
 *
 * Inherit from `LogicDescriptor` class.
 */
export class LogicDriver<TRoutines extends LogicRoutines = LogicRoutines> extends LogicDescriptor {
    private signer: Signer;

    public readonly endpoint: TRoutines;

    private deployIxResponse?: InteractionResponse;

    constructor(option: Omit<LogicDriverOption, "logicId"> & { logicId?: Identifier }) {
        if (option.signer == null) {
            ErrorUtils.throwError("Signer is required.", ErrorCode.INVALID_ARGUMENT);
        }

        super(option.manifest, option.logicId);

        this.signer = option.signer;
        this.endpoint = this.setupEndpoint();
    }

    /**
     * Checks if the logic has been deployed.
     *
     * This method attempts to retrieve the logic ID. If the logic ID is successfully
     * retrieved, it indicates that the logic has been deployed. If an error occurs
     * during the retrieval, it is assumed that the logic has not been deployed.
     *
     * @returns A promise that resolves to `true` if the logic is deployed, otherwise `false`.
     */
    public async isDeployed() {
        const logicId = await this.getLogicId().catch(() => null);
        return logicId != null;
    }

    /**
     * Retrieves the type of a routine.
     *
     * @param routine - The name of the routine.
     * @returns The type of the specified routine.
     */
    public getRoutineType(routine: string) {
        return this.getRoutineElement(routine).data.kind;
    }

    /**
     * Determines if the routine is mutable based on its routine kind.
     *
     * @param routine - The identifier of the routine to check.
     * @returns A boolean indicating whether the routine is mutable.
     */
    public isRoutineMutable(routine: string) {
        const kinds = [RoutineKind.Ephemeral, RoutineKind.Persistent];
        const element = this.getRoutineElement(routine);

        return kinds.includes(element.data.mode);
    }

    private extractArgsAndOption(routine: string, routineArguments: unknown[]) {
        const element = this.getRoutineElement(routine);
        if (routineArguments.length < element.data.accepts.length) {
            const routineSignature = `Invalid number of arguments: ${routine}(${element.data.accepts.map((accept) => `${accept.label} ${accept.type}`).join(", ")})`;
            ErrorUtils.throwArgumentError(routineSignature, "args", routineArguments);
        }

        const option = <RoutineOption | undefined>routineArguments.at(element.data.accepts.length);
        const args = routineArguments.slice(0, element.data.accepts.length);

        return { option, args };
    }

    /**
     * Creates an interaction operation for the specified routine.
     *
     * @param routine - The name of the routine.
     * @param args - The arguments to pass to the routine.
     * @returns A promise that resolves to an interaction operation.
     *
     * @throws an error if the routine is not present.
     */
    public async createIxOperation(routine: string, args: unknown[]): Promise<IxOperation<OpType.LogicDeploy> | IxOperation<OpType.LogicInvoke> | IxOperation<OpType.LogicEnlist>> {
        const element = this.getRoutineElement(routine);

        if (element.data.accepts.length !== args.length) {
            ErrorUtils.throwError(`Invalid number of arguments for routine "${routine}".`, ErrorCode.INVALID_ARGUMENT);
        }

        const calldata = this.getManifestCoder().encodeArguments(routine, ...args);
        const type = this.getRoutineType(routine);

        switch (type) {
            case RoutineType.Deploy: {
                return {
                    type: OpType.LogicDeploy,
                    payload: { manifest: this.getManifest(ManifestCoderFormat.POLO), callsite: routine, calldata },
                };
            }

            case RoutineType.Invoke:
            case RoutineType.Enlist: {
                const logicId = await this.getLogicId();
                return {
                    type: type === RoutineType.Invoke ? OpType.LogicInvoke : OpType.LogicEnlist,
                    payload: { logic_id: logicId.toHex(), callsite: routine, calldata },
                };
            }

            default: {
                ErrorUtils.throwError("Invalid routine type.", ErrorCode.INVALID_ARGUMENT);
            }
        }
    }

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
    public async createIxRequest(
        method: "moi.Simulate",
        routine: string,
        routineArguments: unknown[],
        params?: Omit<Partial<SignerIx<SimulateInteractionRequest>>, "operations">
    ): Promise<SimulateInteractionRequest>;
    /**
     * Creates an interaction request for the specified callsite.
     *
     * @param method - name of the method to create the interaction request.
     * @param callsite - name of the callsite.
     * @param callsiteArguments - arguments to pass to the callsite.
     * @param params - interaction request parameters.
     */
    public async createIxRequest(
        method: "moi.Execute",
        routine: string,
        routineArguments: unknown[],
        params?: Omit<Partial<SignerIx<InteractionRequest>>, "operations">
    ): Promise<InteractionRequest>;
    /**
     * Creates an interaction request for the specified callsite.
     *
     * @param method - name of the method to create the interaction request.
     * @param callsite - name of the callsite.
     * @param callsiteArguments - arguments to pass to the callsite.
     * @param params - interaction request parameters.
     */
    public async createIxRequest(
        method: "moi.Simulate" | "moi.Execute",
        routine: string,
        routineArguments: unknown[],
        params?: Omit<Partial<SignerIx<InteractionRequest>> | Partial<SignerIx<SimulateInteractionRequest>>, "operations">
    ): Promise<SimulateInteractionRequest | InteractionRequest> {
        const operation = await this.createIxOperation(routine, routineArguments);
        if (method === "moi.Simulate") {
            return await this.signer.createIxRequest("moi.Simulate", {
                ...params,
                operations: [operation],
            });
        }

        return await this.signer.createIxRequest("moi.Execute", {
            ...params,
            operations: [operation],
        });
    }

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
    public async getLogicId(timer?: WaitOption): Promise<Identifier> {
        if (this.deployIxResponse != null) {
            // This is to handle the case where the logic id is not set but the deployIxResponse is available.
            // handleLogicDeployResponse uses `InteractionResponse` which caches the result on confirmation preventing multiple calls.
            await this.obtainLogicIdFromResponse(this.deployIxResponse, timer);
        }

        return super.getLogicId();
    }

    protected async obtainLogicIdFromResponse(response: InteractionResponse, timer?: WaitOption) {
        const results = await response.result(timer);
        const result = results.at(0);

        if (result?.type !== OpType.LogicDeploy) {
            ErrorUtils.throwError("Expected result of logic deploy got something else.", ErrorCode.UNKNOWN_ERROR);
        }

        const exception = ManifestCoder.decodeException(result.data.error);

        if (exception != null) {
            ErrorUtils.throwError(exception.error, ErrorCode.CALL_EXCEPTION, exception);
        }

        this.setLogicId(new LogicId(result.data.logic_id));
    }

    private newRoutine(routine: string) {
        const isDeployerRoutine = this.getRoutineType(routine) === RoutineType.Deploy;

        const callback = async (...args) => {
            const isDeployed = await this.isDeployed();

            if (isDeployerRoutine && isDeployed) {
                ErrorUtils.throwError(`Logic is already deployed or deploying.`);
            }

            if (!isDeployerRoutine && !isDeployed) {
                ErrorUtils.throwError(`Logic is not deployed, deploy it first using deployer routine.`);
            }

            const { option, args: routineArgs } = this.extractArgsAndOption(routine, args);
            if (!this.isRoutineMutable(routine)) {
                const simulateIxRequest = await this.createIxRequest("moi.Simulate", routine, routineArgs, option);
                const simulation = await this.signer.simulate(simulateIxRequest);
                const result = simulation.results.at(0);

                if (result?.type !== OpType.LogicInvoke) {
                    ErrorUtils.throwError("Expected LogicInvoke operation.", ErrorCode.UNKNOWN_ERROR);
                }

                const { error, outputs } = result.data;
                const exception = ManifestCoder.decodeException(error);

                if (exception != null) {
                    ErrorUtils.throwError(exception.error, ErrorCode.CALL_EXCEPTION, exception);
                }

                return this.getManifestCoder().decodeOutput(routine, outputs);
            }

            const request = await this.createIxRequest("moi.Execute", routine, routineArgs, option);
            const response = await this.signer.execute(request);

            if (isDeployerRoutine) {
                this.deployIxResponse = response;
            }

            return response;
        };

        return callback as RoutineCallback;
    }

    private setupEndpoint() {
        const endpoint = {};

        for (const { ptr } of this.getCallsites().values()) {
            const element = this.getElement(ptr);

            if (element.kind !== ElementType.Routine) {
                ErrorUtils.throwError(`Element at "${ptr}" is not a valid routine.`);
            }

            endpoint[element.data.name] = this.newRoutine(element.data.name);
        }

        return Object.freeze(endpoint as TRoutines);
    }

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
    public async getLogicStorage(state: LogicState.Persistent, storageKey: StorageKey | Hex): Promise<Hex>;
    /**
     * Retrieves the logic storage based on the provided state, storage key, and identifier.
     *
     * @param state The state of the logic storage, either Persistent or Ephemeral.
     * @param storageKey The key used to access the storage, can be of type StorageKey or Hex.
     * @param identifier The identifier for which the storage is being accessed.
     */
    public async getLogicStorage(state: LogicState.Ephemeral, storageKey: StorageKey | Hex, identifier: Identifier): Promise<Hex>;
    /**
     * Retrieves the logic storage based on the provided state and storage key.
     *
     * @param state - The state of the logic storage, either Persistent or Ephemeral.
     * @param storageKey - The key used to access the storage, can be of type StorageKey or Hex.
     * @returns A promise that resolves to the logic storage data.
     *
     * @throws Will throw an error if the logic state is invalid.
     */
    public async getLogicStorage(state: LogicState, storageKey: StorageKey | Hex, identifier?: Identifier): Promise<Hex> {
        const logicId = await this.getLogicId();

        switch (state) {
            case LogicState.Persistent: {
                return await this.signer.getProvider().getLogicStorage(logicId, storageKey);
            }
            case LogicState.Ephemeral: {
                if (identifier == null) {
                    ErrorUtils.throwError("Identifier is required for reading ephemeral storage.", ErrorCode.INVALID_ARGUMENT);
                }

                return await this.signer.getProvider().getLogicStorage(logicId, identifier, storageKey);
            }
            default:
                ErrorUtils.throwError("Invalid logic state.", ErrorCode.INVALID_ARGUMENT);
        }
    }

    /**
     * Retrieves the storage key for the provided state and accessor.
     *
     * @param state - The state of the logic storage, either Persistent or Ephemeral.
     * @param accessor - The accessor used to generate the storage key.
     * @returns The storage key for the provided state and accessor.
     */
    public getStorageKey(state: LogicState, accessor: StateAccessorFn): StorageKey {
        const element = this.getStateElement(state);
        const builder = accessor(new StateAccessorBuilder(element.ptr, this));

        if (!(builder instanceof SlotAccessorBuilder)) {
            ErrorUtils.throwError("Invalid accessor builder.", ErrorCode.UNKNOWN_ERROR);
        }

        return generateStorageKey(builder.getBaseSlot(), builder.getAccessors());
    }

    /**
     * Retrieves the persistent storage value based on the provided accessor.
     *
     * @param storageKey - The storage key used to access the persistent storage.
     * @returns A promise that resolves to the persistent storage data in POLO encoding.
     */
    public async persistent(storageKey: StorageKey | Hex): Promise<Hex>;
    /**
     * Retrieves the persistent storage value based on the provided accessor.
     *
     * @param accessor - The accessor used to generate the storage key.
     * @returns A promise that resolves to the persistent storage decoded value.
     */
    public async persistent<T>(accessor: StateAccessorFn): Promise<T>;
    /**
     * Retrieves the persistent storage value based on the provided accessor or storage key.
     *
     * @param accessor - This can storage key or accessor function.
     * @returns A promise that resolves to the persistent storage data in POLO encoding or decoded value.
     */
    public async persistent<T>(accessor: StateAccessorFn | StorageKey | Hex): Promise<T | Hex> {
        const state = LogicState.Persistent;

        if (accessor instanceof StorageKey || isHex(accessor)) {
            return await this.getLogicStorage(state, accessor);
        }

        const element = this.getStateElement(state);
        const builder = accessor(new StateAccessorBuilder(element.ptr, this));

        if (!(builder instanceof SlotAccessorBuilder)) {
            ErrorUtils.throwError("Invalid accessor builder.", ErrorCode.UNKNOWN_ERROR);
        }

        const key = generateStorageKey(builder.getBaseSlot(), builder.getAccessors());
        const value = await this.getLogicStorage(state, key);

        if (!isPrimitiveType(builder.getStorageType())) {
            return new Depolorizer(hexToBytes(value)).depolorizeInteger() as T;
        }

        const schema = Schema.parseDataType(builder.getStorageType(), this.getClassDefs(), this.getElements());
        return new Depolorizer(hexToBytes(value)).depolorize(schema) as T;
    }

    /**
     * Retrieves the ephemeral storage value based on the provided accessor.
     *
     * @param storageKey - The storage key used to access the ephemeral storage.
     * @returns A promise that resolves to the ephemeral storage data in POLO encoding.
     */
    public async ephemeral(identifier: Identifier | Hex, storageKey: StorageKey | Hex): Promise<Hex>;
    /**
     * Retrieves the ephemeral storage value based on the provided accessor.
     *
     * @param accessor - The accessor used to generate the storage key.
     * @returns A promise that resolves to the ephemeral storage decoded value.
     */
    public async ephemeral<T>(identifier: Identifier | Hex, accessor: StateAccessorFn): Promise<T>;
    /**
     * Retrieves the ephemeral storage value based on the provided accessor or storage key.
     * @param accessor - This can storage key or accessor function.
     * @returns A promise that resolves to the ephemeral storage data in POLO encoding or decoded value.
     */
    public async ephemeral<T>(identifier: Identifier | Hex, accessor: StateAccessorFn | StorageKey | Hex): Promise<T | Hex> {
        const state = LogicState.Ephemeral;

        if (accessor instanceof StorageKey || isHex(accessor)) {
            return await this.getLogicStorage(state, accessor, new Identifier(identifier));
        }

        const element = this.getStateElement(state);
        const builder = accessor(new StateAccessorBuilder(element.ptr, this));

        if (!(builder instanceof SlotAccessorBuilder)) {
            ErrorUtils.throwError("Invalid accessor builder.", ErrorCode.UNKNOWN_ERROR);
        }

        const key = generateStorageKey(builder.getBaseSlot(), builder.getAccessors());
        const value = await this.getLogicStorage(state, key, new Identifier(identifier));

        if (!isPrimitiveType(builder.getStorageType())) {
            return new Depolorizer(hexToBytes(value)).depolorizeInteger() as T;
        }

        const schema = Schema.parseDataType(builder.getStorageType(), this.getClassDefs(), this.getElements());
        return new Depolorizer(hexToBytes(value)).depolorize(schema) as T;
    }

    /**
     * Retrieves logic messages based on the provided options.
     *
     * @param {LogicMessageRequestOption} [option] - Optional parameter to specify the request options for logic messages.
     * @returns {Promise<LogicMessage[]>} A promise that resolves to an array of logic messages.
     */
    public async getLogicMessages(option?: LogicMessageRequestOption): Promise<LogicMessage[]> {
        const provider = this.signer.getProvider();
        return await provider.getLogicMessage(await this.getLogicId(), option);
    }
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
export const getLogicDriver = async <TRoutines extends LogicRoutines = LogicRoutines>(source: Identifier | LogicManifest, signer: Signer): Promise<LogicDriver<TRoutines>> => {
    if (isIdentifier(source)) {
        const provider = signer.getProvider();
        const manifestInPolo = await provider.getLogic(source, {
            modifier: { extract: "manifest" },
        });
        const manifest = ManifestCoder.decodeManifest(manifestInPolo, ManifestCoderFormat.JSON);

        return new LogicDriver({ manifest, logicId: source, signer });
    }

    return new LogicDriver<TRoutines>({ manifest: source, signer });
};
