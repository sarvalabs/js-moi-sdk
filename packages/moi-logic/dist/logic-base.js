"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicBase = void 0;
const moi_abi_1 = require("moi-abi");
const moi_utils_1 = require("moi-utils");
const element_descriptor_1 = __importDefault(require("./element-descriptor"));
/**
 * LogicBase Class
 *
 * This abstract class extends the ElementDescriptor class and serves as a base
 class for logic-related operations.
 * It defines common properties and abstract methods that subclasses should implement.
 */
class LogicBase extends element_descriptor_1.default {
    provider;
    abiCoder;
    constructor(manifest, provider) {
        super(manifest.elements);
        this.provider = provider;
        this.abiCoder = new moi_abi_1.ABICoder(this.elements, this.classDefs);
    }
    /**
     * getLogicId
     *
     * Returns the logic ID associated with the LogicBase instance.
     *
     * @returns {string} The logic ID.
     */
    getLogicId() {
        return "";
    }
    /**
     * executeRoutine
     *
     * Executes a routine with the given arguments and returns the interaction response.
     *
     * @param {any} ixObject - The interaction object.
     * @param {any[]} args - The arguments for the routine.
     * @returns {Promise<InteractionResponse>} A promise that resolves to the interaction response.
     * @throws {Error} Throws an error if the provider is not found or if the logic ID is not defined.
     */
    async executeRoutine(ixObject, ...args) {
        const processedArgs = this.processArguments(ixObject, args);
        if (!this.provider) {
            moi_utils_1.ErrorUtils.throwError("Provider not found!", moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        if (this.getIxType() !== moi_utils_1.IxType.LOGIC_DEPLOY && !this.getLogicId()) {
            moi_utils_1.ErrorUtils.throwError("This logic object doesn\'t have address set yet, please set an address first.", moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        switch (processedArgs.type) {
            case "call":
            case "estimate":
                break;
            case "send":
                return this.provider.sendInteraction(processedArgs.params)
                    .then((response) => {
                    return {
                        ...response,
                        result: this.processResult.bind(this, {
                            ...response,
                            routine_name: ixObject.routine.name
                        })
                    };
                }).catch((err) => {
                    throw err;
                });
            default:
                break;
        }
        moi_utils_1.ErrorUtils.throwError('Method "' + processedArgs.type + '" not supported.', moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
    }
    /**
     * processArguments
     *
     * Processes the interaction arguments and returns the processed arguments object.
     *
     * @param {LogicIxObject} ixObject - The interaction object.
     * @param {any[]} args - The interaction arguments.
     * @returns {any} The processed arguments object.
     * @throws {Error} Throws an error if there are missing arguments or missing fuel information.
     */
    processArguments(ixObject, args) {
        if (args.length < 2 || !args[1].sender) {
            moi_utils_1.ErrorUtils.throwError("One or more required arguments are missing.", moi_utils_1.ErrorCode.MISSING_ARGUMENT);
        }
        const processedArgs = {
            type: args[0],
            params: {
                sender: args[1].sender
            }
        };
        if (args[0] === "send") {
            if (args[1].fuelPrice === null || args[1].fuelPrice === undefined) {
                moi_utils_1.ErrorUtils.throwError("fuel price is required", moi_utils_1.ErrorCode.MISSING_ARGUMENT);
            }
            if (args[1].fuelLimit === null || args[1].fuelLimit === undefined) {
                moi_utils_1.ErrorUtils.throwError("fuel limit is requeired", moi_utils_1.ErrorCode.MISSING_ARGUMENT);
            }
            processedArgs.params.type = this.getIxType();
            processedArgs.params.fuel_price = args[1].fuelPrice;
            processedArgs.params.fuel_limit = args[1].fuelLimit;
        }
        processedArgs.params.payload = ixObject.createPayload();
        return processedArgs;
    }
    /**
     * createIxRequest
     *
     * Creates a logic execute request object based on the given interaction object.
     *
     * @param {LogicIxObject} ixObject - The interaction object.
     * @returns {LogicExecuteRequest} The logic execute request object.
     */
    createIxRequest(ixObject) {
        return {
            call: ixObject.call.bind(ixObject),
            send: ixObject.send.bind(ixObject),
            estimateGas: ixObject.estimateGas.bind(ixObject)
        };
    }
    /**
     * createIxObject
     *
     * Creates a logic execute request object with the specified routine and arguments.
     *
     * @param {LogicManifest.Routine} routine - The routine for the logic execute request.
     * @param {any[]} args - The arguments for the logic execute request.
     * @returns {LogicExecuteRequest} The logic execute request object.
     */
    createIxObject(routine, ...args) {
        const ixObject = {
            routine: routine,
            arguments: args
        };
        // Define call, send, estimateGas methods on ixObject
        ixObject.call = (...args) => {
            return this.executeRoutine(ixObject, "call", ...args);
        };
        ixObject.send = (...args) => {
            return this.executeRoutine(ixObject, "send", ...args);
        };
        ixObject.estimateGas = (...args) => {
            return this.executeRoutine(ixObject, "estimateGas", ...args);
        };
        ixObject.createPayload = () => {
            return this.createPayload(ixObject);
        };
        return this.createIxRequest(ixObject);
    }
}
exports.LogicBase = LogicBase;
