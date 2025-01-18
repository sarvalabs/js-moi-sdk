"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicDriver = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
const js_polo_1 = require("js-polo");
const logic_descriptor_1 = require("./logic-descriptor");
const accessor_builder_1 = require("./state/accessor-builder");
const state_accessor_builder_1 = require("./state/state-accessor-builder");
class LogicDriver extends logic_descriptor_1.LogicDescriptor {
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
        const kinds = [js_moi_utils_1.RoutineKind.Ephemeral, js_moi_utils_1.RoutineKind.Persistent];
        const element = this.getRoutineElement(callsite);
        return kinds.includes(element.data.mode);
    }
    validateCallsiteOption(option) {
        if (option == null) {
            return null;
        }
        if ("sequence" in option && (typeof option.sequence !== "number" || Number.isNaN(option.sequence) || option.sequence < 0)) {
            return new js_moi_utils_1.CustomError("Invalid sequence number.", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        if ("simulate" in option && typeof option.simulate !== "boolean") {
            return new js_moi_utils_1.CustomError("Invalid simulate flag.", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        return null;
    }
    extractArgsAndOption(callsite, callsiteArguments) {
        const element = this.getRoutineElement(callsite);
        if (callsiteArguments.length < element.data.accepts.length) {
            const callsiteSignature = `Invalid number of arguments: ${callsite}(${element.data.accepts.map((accept) => `${accept.label} ${accept.type}`).join(", ")})`;
            js_moi_utils_1.ErrorUtils.throwArgumentError(callsiteSignature, "args", callsiteArguments);
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
            case js_moi_utils_1.RoutineType.Deploy: {
                operation = {
                    type: js_moi_utils_1.OpType.LogicDeploy,
                    payload: { manifest: this.getManifest(js_moi_manifest_1.ManifestCoderFormat.POLO), callsite, calldata },
                };
                break;
            }
            case js_moi_utils_1.RoutineType.Invoke:
            case js_moi_utils_1.RoutineType.Enlist: {
                operation = {
                    type: callsiteType === js_moi_utils_1.RoutineType.Invoke ? js_moi_utils_1.OpType.LogicInvoke : js_moi_utils_1.OpType.LogicEnlist,
                    payload: { logic_id: (await this.getLogicId()).value, callsite, calldata },
                };
                break;
            }
            default: {
                js_moi_utils_1.ErrorUtils.throwError("Invalid routine type.", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
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
            js_moi_utils_1.ErrorUtils.throwError(`Minimum fuel limit required for interaction is ${simulation.effort} but got ${option.fuel_limit}.`);
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
            if (result?.type !== js_moi_utils_1.OpType.LogicDeploy) {
                js_moi_utils_1.ErrorUtils.throwError("Expected result of logic deploy got something else.", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR);
            }
            const exception = js_moi_manifest_1.ManifestCoder.decodeException(result.payload.error);
            if (exception != null) {
                js_moi_utils_1.ErrorUtils.throwError(exception.error, js_moi_utils_1.ErrorCode.CALL_EXCEPTION, exception);
            }
            this.setLogicId(new js_moi_utils_1.LogicId(result.payload.logic_id));
        }
        return super.getLogicId();
    }
    newCallsite(callsite) {
        const isDeployerCallsite = this.getCallsiteType(callsite) === js_moi_utils_1.RoutineType.Deploy;
        const callback = async (...args) => {
            if (isDeployerCallsite && (await this.isDeployed())) {
                js_moi_utils_1.ErrorUtils.throwError(`Logic is already deployed or deploying".`);
            }
            if (!isDeployerCallsite && !this.isDeployed()) {
                js_moi_utils_1.ErrorUtils.throwError(`Logic is not deployed, deploy it first using deployer callsites.`);
            }
            const { option, args: callsiteArgs } = this.extractArgsAndOption(callsite, args);
            const ixRequest = await this.createIxRequest(callsite, callsiteArgs, option);
            if (!this.isCallsiteMutable(callsite)) {
                const simulation = await this.signer.simulate(ixRequest);
                // TODO: remove any here
                const result = simulation.result.at(0);
                console.warn("Still the 'field' is op_type, should be type");
                // TODO: op_type should be type
                if (result?.op_type !== js_moi_utils_1.OpType.LogicInvoke) {
                    js_moi_utils_1.ErrorUtils.throwError("Expected LogicInvoke operation.", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR);
                }
                // TODO: payload should be data
                const { error, outputs } = result.data;
                const exception = js_moi_manifest_1.ManifestCoder.decodeException(error);
                if (exception != null) {
                    js_moi_utils_1.ErrorUtils.throwError(exception.error, js_moi_utils_1.ErrorCode.CALL_EXCEPTION, exception);
                }
                return this.getManifestCoder().decodeOutput(callsite, outputs);
            }
            if (!("fuel_limit" in ixRequest) || typeof ixRequest.fuel_limit !== "number") {
                js_moi_utils_1.ErrorUtils.throwError("Invalid interaction request. Fuel limit must be a number.", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
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
            if (element.kind !== js_moi_utils_1.ElementType.Routine) {
                js_moi_utils_1.ErrorUtils.throwError(`Element at "${ptr}" is not a valid callsite.`);
            }
            endpoint[element.data.name] = this.newCallsite(element.data.name);
        }
        return Object.freeze(endpoint);
    }
    async getLogicStorage(state, storageKey) {
        const logicId = await this.getLogicId();
        switch (state) {
            case js_moi_utils_1.LogicState.Persistent: {
                return await this.signer.getProvider().getLogicStorage(logicId, storageKey);
            }
            case js_moi_utils_1.LogicState.Ephemeral: {
                const address = await this.signer.getAddress();
                return await this.signer.getProvider().getLogicStorage(logicId, address, storageKey);
            }
            default:
                js_moi_utils_1.ErrorUtils.throwError("Invalid logic state.", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
    }
    getStorageKey(state, accessor) {
        const element = this.getStateElement(state);
        const builder = accessor(new state_accessor_builder_1.StateAccessorBuilder(element.ptr, this));
        if (!(builder instanceof accessor_builder_1.SlotAccessorBuilder)) {
            js_moi_utils_1.ErrorUtils.throwError("Invalid accessor builder.", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR);
        }
        return (0, js_moi_utils_1.generateStorageKey)(builder.getBaseSlot(), builder.getAccessors());
    }
    async getLogicStateValue(state, accessor) {
        if (accessor instanceof js_moi_utils_1.StorageKey || (0, js_moi_utils_1.isHex)(accessor)) {
            return await this.getLogicStorage(state, accessor);
        }
        const element = this.getStateElement(state);
        const builder = accessor(new state_accessor_builder_1.StateAccessorBuilder(element.ptr, this));
        if (!(builder instanceof accessor_builder_1.SlotAccessorBuilder)) {
            js_moi_utils_1.ErrorUtils.throwError("Invalid accessor builder.", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR);
        }
        const key = (0, js_moi_utils_1.generateStorageKey)(builder.getBaseSlot(), builder.getAccessors());
        const value = await this.getLogicStorage(state, key);
        if (!(0, js_moi_manifest_1.isPrimitiveType)(builder.getStorageType())) {
            return new js_polo_1.Depolorizer((0, js_moi_utils_1.hexToBytes)(value)).depolorizeInteger();
        }
        const schema = js_moi_manifest_1.Schema.parseDataType(builder.getStorageType(), this.getClassDefs(), this.getElements());
        return new js_polo_1.Depolorizer((0, js_moi_utils_1.hexToBytes)(value)).depolorize(schema);
    }
    async persistent(accessor) {
        if (typeof accessor === "function") {
            return await this.getLogicStateValue(js_moi_utils_1.LogicState.Persistent, accessor);
        }
        return await this.getLogicStateValue(js_moi_utils_1.LogicState.Persistent, accessor);
    }
    async ephemeral(accessor) {
        if (typeof accessor === "function") {
            return await this.getLogicStateValue(js_moi_utils_1.LogicState.Ephemeral, accessor);
        }
        return await this.getLogicStateValue(js_moi_utils_1.LogicState.Ephemeral, accessor);
    }
}
exports.LogicDriver = LogicDriver;
//# sourceMappingURL=logic-driver.js.map