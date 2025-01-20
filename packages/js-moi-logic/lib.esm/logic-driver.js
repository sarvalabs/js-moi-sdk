import { isPrimitiveType, ManifestCoder, ManifestCoderFormat, Schema } from "js-moi-manifest";
import { CustomError, ElementType, ErrorCode, ErrorUtils, generateStorageKey, hexToBytes, isHex, LogicId, LogicState, OpType, RoutineKind, RoutineType, StorageKey, } from "js-moi-utils";
import { Depolorizer } from "js-polo";
import { LogicDescriptor } from "./logic-descriptor";
import { SlotAccessorBuilder } from "./state/accessor-builder";
import { StateAccessorBuilder } from "./state/state-accessor-builder";
/**
 * It is class that is used to interact with the logic.
 *
 * @class LogicDriver
 */
export class LogicDriver extends LogicDescriptor {
    signer;
    endpoint;
    deployIxResponse;
    constructor(option) {
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
    async isDeployed() {
        const logicId = await this.getLogicId().catch(() => null);
        return logicId != null;
    }
    /**
     * Retrieves the type of a callsite.
     *
     * @param callsite - The name of the callsite.
     * @returns The type of the specified callsite.
     */
    getCallsiteType(callsite) {
        return this.getRoutineElement(callsite).data.kind;
    }
    /**
     * Determines if the callsite is mutable based on its routine kind.
     *
     * @param callsite - The identifier of the callsite to check.
     * @returns A boolean indicating whether the callsite is mutable.
     */
    isCallsiteMutable(callsite) {
        const kinds = [RoutineKind.Ephemeral, RoutineKind.Persistent];
        const element = this.getRoutineElement(callsite);
        return kinds.includes(element.data.mode);
    }
    validateCallsiteOption(option) {
        if (option == null) {
            return null;
        }
        if ("sequence" in option && (typeof option.sequence !== "number" || Number.isNaN(option.sequence) || option.sequence < 0)) {
            return new CustomError("Invalid sequence number.", ErrorCode.INVALID_ARGUMENT);
        }
        if ("simulate" in option && typeof option.simulate !== "boolean") {
            return new CustomError("Invalid simulate flag.", ErrorCode.INVALID_ARGUMENT);
        }
        return null;
    }
    extractArgsAndOption(callsite, callsiteArguments) {
        const element = this.getRoutineElement(callsite);
        if (callsiteArguments.length < element.data.accepts.length) {
            const callsiteSignature = `Invalid number of arguments: ${callsite}(${element.data.accepts.map((accept) => `${accept.label} ${accept.type}`).join(", ")})`;
            ErrorUtils.throwArgumentError(callsiteSignature, "args", callsiteArguments);
        }
        const option = callsiteArguments.at(element.data.accepts.length + 1);
        const args = callsiteArguments.slice(0, element.data.accepts.length);
        const error = this.validateCallsiteOption(option);
        if (error != null) {
            throw error;
        }
        return { option, args };
    }
    /**
     * Creates an interaction operation for the specified callsite.
     *
     * @param callsite - The name of the callsite.
     * @param args - The arguments to pass to the callsite.
     * @returns A promise that resolves to an interaction operation.
     *
     * @throws an error if the callsite is not present.
     */
    async createIxOperation(callsite, args) {
        const calldata = this.getManifestCoder().encodeArguments(callsite, ...args);
        const callsiteType = this.getCallsiteType(callsite);
        switch (callsiteType) {
            case RoutineType.Deploy: {
                return {
                    type: OpType.LogicDeploy,
                    payload: { manifest: this.getManifest(ManifestCoderFormat.POLO), callsite, calldata },
                };
            }
            case RoutineType.Invoke:
            case RoutineType.Enlist: {
                return {
                    type: callsiteType === RoutineType.Invoke ? OpType.LogicInvoke : OpType.LogicEnlist,
                    payload: { logic_id: (await this.getLogicId()).value, callsite, calldata },
                };
            }
            default: {
                ErrorUtils.throwError("Invalid routine type.", ErrorCode.INVALID_ARGUMENT);
            }
        }
    }
    /**
     * Creates an interaction request for a given callsite and its arguments.
     *
     * @param callsite - The name of the callsite function to be invoked.
     * @param callsiteArguments - An array of arguments to be passed to the callsite function.
     * @param option - Optional parameters for the callsite, including fuel price and fuel limit.
     * @returns A promise that resolves to a SignerIx object, which can be either a SimulateInteractionRequest or an InteractionRequest.
     *
     * @throws Will throw an error if the provided fuel limit is less than the required simulation effort.
     */
    async createIxRequest(callsite, callsiteArguments, option) {
        const baseIxRequest = {
            fuel_price: option?.fuel_price ?? 1,
            operations: [await this.createIxOperation(callsite, callsiteArguments)],
        };
        if (!this.isCallsiteMutable(callsite)) {
            return baseIxRequest;
        }
        const simulation = await this.signer.simulate(baseIxRequest, option?.sequence);
        // TODO: SHOULD SDK handle this? that if fuel limit is provided and it is less than the effort, it should throw an error
        if (option?.fuel_limit != null && option.fuel_limit < simulation.effort) {
            ErrorUtils.throwError(`Minimum fuel limit required for interaction is ${simulation.effort} but got ${option.fuel_limit}.`);
        }
        const request = {
            ...baseIxRequest,
            fuel_limit: option?.fuel_limit ?? simulation.effort,
        };
        return request;
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
    async getLogicId(timer) {
        if (this.logicId != null) {
            return this.logicId;
        }
        if (this.deployIxResponse != null) {
            const results = await this.deployIxResponse.result(timer);
            const result = results.at(0);
            if (result?.type !== OpType.LogicDeploy) {
                ErrorUtils.throwError("Expected result of logic deploy got something else.", ErrorCode.UNKNOWN_ERROR);
            }
            const exception = ManifestCoder.decodeException(result.payload.error);
            if (exception != null) {
                ErrorUtils.throwError(exception.error, ErrorCode.CALL_EXCEPTION, exception);
            }
            this.setLogicId(new LogicId(result.payload.logic_id));
        }
        return super.getLogicId();
    }
    newCallsite(callsite) {
        const isDeployerCallsite = this.getCallsiteType(callsite) === RoutineType.Deploy;
        const callback = async (...args) => {
            if (isDeployerCallsite && (await this.isDeployed())) {
                ErrorUtils.throwError(`Logic is already deployed or deploying".`);
            }
            if (!isDeployerCallsite && !this.isDeployed()) {
                ErrorUtils.throwError(`Logic is not deployed, deploy it first using deployer callsites.`);
            }
            const { option, args: callsiteArgs } = this.extractArgsAndOption(callsite, args);
            const ixRequest = await this.createIxRequest(callsite, callsiteArgs, option);
            if (!this.isCallsiteMutable(callsite)) {
                const simulation = await this.signer.simulate(ixRequest);
                // TODO: remove any here
                const result = simulation.result.at(0);
                console.warn("Still the 'field' is op_type, should be type");
                // TODO: op_type should be type
                if (result?.op_type !== OpType.LogicInvoke) {
                    ErrorUtils.throwError("Expected LogicInvoke operation.", ErrorCode.UNKNOWN_ERROR);
                }
                // TODO: payload should be data
                const { error, outputs } = result.data;
                const exception = ManifestCoder.decodeException(error);
                if (exception != null) {
                    ErrorUtils.throwError(exception.error, ErrorCode.CALL_EXCEPTION, exception);
                }
                return this.getManifestCoder().decodeOutput(callsite, outputs);
            }
            if (!("fuel_limit" in ixRequest) || typeof ixRequest.fuel_limit !== "number") {
                ErrorUtils.throwError("Invalid interaction request. Fuel limit must be a number.", ErrorCode.INVALID_ARGUMENT);
            }
            const response = await this.signer.execute(ixRequest);
            if (isDeployerCallsite) {
                this.deployIxResponse = response;
            }
            return response;
        };
        return callback;
    }
    setupEndpoint() {
        const endpoint = {};
        for (const { ptr } of this.getCallsites().values()) {
            const element = this.getElement(ptr);
            if (element.kind !== ElementType.Routine) {
                ErrorUtils.throwError(`Element at "${ptr}" is not a valid callsite.`);
            }
            endpoint[element.data.name] = this.newCallsite(element.data.name);
        }
        return Object.freeze(endpoint);
    }
    /**
     * Retrieves the logic storage based on the provided state and storage key.
     *
     * @param state - The state of the logic storage, either Persistent or Ephemeral.
     * @param storageKey - The key used to access the storage, can be of type StorageKey or Hex.
     * @returns A promise that resolves to the logic storage data.
     *
     * @throws Will throw an error if the logic state is invalid.
     */
    async getLogicStorage(state, storageKey) {
        const logicId = await this.getLogicId();
        switch (state) {
            case LogicState.Persistent: {
                return await this.signer.getProvider().getLogicStorage(logicId, storageKey);
            }
            case LogicState.Ephemeral: {
                const address = await this.signer.getAddress();
                return await this.signer.getProvider().getLogicStorage(logicId, address, storageKey);
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
    getStorageKey(state, accessor) {
        const element = this.getStateElement(state);
        const builder = accessor(new StateAccessorBuilder(element.ptr, this));
        if (!(builder instanceof SlotAccessorBuilder)) {
            ErrorUtils.throwError("Invalid accessor builder.", ErrorCode.UNKNOWN_ERROR);
        }
        return generateStorageKey(builder.getBaseSlot(), builder.getAccessors());
    }
    async getLogicStateValue(state, accessor) {
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
            return new Depolorizer(hexToBytes(value)).depolorizeInteger();
        }
        const schema = Schema.parseDataType(builder.getStorageType(), this.getClassDefs(), this.getElements());
        return new Depolorizer(hexToBytes(value)).depolorize(schema);
    }
    /**
     * Retrieves the persistent storage value based on the provided accessor or storage key.
     *
     * @param accessor - This can storage key or accessor function.
     * @returns A promise that resolves to the persistent storage data in POLO encoding or decoded value.
     */
    async persistent(accessor) {
        if (typeof accessor === "function") {
            return await this.getLogicStateValue(LogicState.Persistent, accessor);
        }
        return await this.getLogicStateValue(LogicState.Persistent, accessor);
    }
    /**
     * Retrieves the ephemeral storage value based on the provided accessor or storage key.
     * @param accessor - This can storage key or accessor function.
     * @returns A promise that resolves to the ephemeral storage data in POLO encoding or decoded value.
     */
    async ephemeral(accessor) {
        if (typeof accessor === "function") {
            return await this.getLogicStateValue(LogicState.Ephemeral, accessor);
        }
        return await this.getLogicStateValue(LogicState.Ephemeral, accessor);
    }
}
/**
 * Retrieves a LogicDriver instance for the given logic ID.
 *
 * @param logicId - The ID of the logic to retrieve.
 * @param signer - The signer object used to interact with the logic.
 * @returns A promise that resolves to a LogicDriver instance.
 *
 * @throws Will throw an error if the provider fails to retrieve the logic.
 */
export const getLogicDriver = async (logicId, signer) => {
    if (typeof logicId === "string" || logicId instanceof LogicId) {
        const provider = signer.getProvider();
        const id = typeof logicId === "string" ? new LogicId(logicId) : logicId;
        const { manifest: encoded } = await provider.getLogic(id, {
            modifier: { include: ["manifest"] },
        });
        const manifest = ManifestCoder.decodeManifest(encoded, ManifestCoderFormat.JSON);
        return new LogicDriver({ manifest, logicId: id, signer });
    }
    return new LogicDriver({ manifest: logicId, signer });
};
//# sourceMappingURL=logic-driver.js.map