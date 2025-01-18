import { isPrimitiveType, ManifestCoder, ManifestCoderFormat, Schema } from "js-moi-manifest";
import { CustomError, ElementType, ErrorCode, ErrorUtils, generateStorageKey, hexToBytes, isHex, LogicId, LogicState, OpType, RoutineKind, RoutineType, StorageKey, } from "js-moi-utils";
import { Depolorizer } from "js-polo";
import { LogicDescriptor } from "./logic-descriptor";
import { SlotAccessorBuilder } from "./state/accessor-builder";
import { StateAccessorBuilder } from "./state/state-accessor-builder";
export class LogicDriver extends LogicDescriptor {
    signer;
    endpoint;
    deployIxResponse;
    constructor(option) {
        super(option.manifest, option.logicId);
        this.signer = option.signer;
        this.endpoint = this.setupEndpoint();
    }
    async isDeployed() {
        const logicId = await this.getLogicId().catch(() => null);
        return logicId != null;
    }
    getCallsiteType(callsite) {
        return this.getRoutineElement(callsite).data.kind;
    }
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
    async createIxOperation(callsite, args) {
        let operation;
        const calldata = this.getManifestCoder().encodeArguments(callsite, ...args);
        const callsiteType = this.getCallsiteType(callsite);
        switch (callsiteType) {
            case RoutineType.Deploy: {
                operation = {
                    type: OpType.LogicDeploy,
                    payload: { manifest: this.getManifest(ManifestCoderFormat.POLO), callsite, calldata },
                };
                break;
            }
            case RoutineType.Invoke:
            case RoutineType.Enlist: {
                operation = {
                    type: callsiteType === RoutineType.Invoke ? OpType.LogicInvoke : OpType.LogicEnlist,
                    payload: { logic_id: (await this.getLogicId()).value, callsite, calldata },
                };
                break;
            }
            default: {
                ErrorUtils.throwError("Invalid routine type.", ErrorCode.INVALID_ARGUMENT);
            }
        }
        return operation;
    }
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
    async persistent(accessor) {
        if (typeof accessor === "function") {
            return await this.getLogicStateValue(LogicState.Persistent, accessor);
        }
        return await this.getLogicStateValue(LogicState.Persistent, accessor);
    }
    async ephemeral(accessor) {
        if (typeof accessor === "function") {
            return await this.getLogicStateValue(LogicState.Ephemeral, accessor);
        }
        return await this.getLogicStateValue(LogicState.Ephemeral, accessor);
    }
}
//# sourceMappingURL=logic-driver.js.map