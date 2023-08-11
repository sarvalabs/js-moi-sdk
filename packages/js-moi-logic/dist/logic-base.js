"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicBase = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
const element_descriptor_1 = __importDefault(require("./element-descriptor"));
/**
 * This abstract class extends the ElementDescriptor class and serves as a base
 class for logic-related operations.
 * It defines common properties and abstract methods that subclasses should implement.
 */
class LogicBase extends element_descriptor_1.default {
    signer;
    manifestCoder;
    constructor(manifest, signer) {
        super(manifest.elements);
        this.signer = signer;
        this.manifestCoder = new js_moi_manifest_1.ManifestCoder(this.elements, this.classDefs);
    }
    /**
     * Returns the logic ID associated with the LogicBase instance.
     *
     * @returns {string} The logic ID.
     */
    getLogicId() {
        return "";
    }
    /**
     * Updates the signer or establishes a connection with a new signer.
     *
     * @param {Signer} signer - The updated signer object or the new signer object to connect.
     */
    connect(signer) {
        this.signer = signer;
    }
    /**
     * Executes a routine with the given arguments and returns the interaction response.
     *
     * @param {any} ixObject - The interaction object.
     * @param {any[]} args - The arguments for the routine.
     * @returns {Promise<InteractionResponse>} A promise that resolves to the
     * interaction response.
     * @throws {Error} if the provider is not initialized within the signer,
     * if the logic id is not defined, if the method type is unsupported,
     * or if the sendInteraction operation fails.
     */
    async executeRoutine(ixObject, ...args) {
        const processedArgs = this.processArguments(ixObject, args);
        if (this.getIxType() !== js_moi_utils_1.IxType.LOGIC_DEPLOY && !this.getLogicId()) {
            js_moi_utils_1.ErrorUtils.throwError("This logic object doesn\'t have address set yet, please set an address first.", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        switch (processedArgs.type) {
            case "call":
            case "estimate":
                break;
            case "send":
                return this.signer.sendInteraction(processedArgs.params)
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
        js_moi_utils_1.ErrorUtils.throwError('Method "' + processedArgs.type + '" not supported.', js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
    }
    /**
     * Processes the interaction arguments and returns the processed arguments object.
     *
     * @param {LogicIxObject} ixObject - The interaction object.
     * @param {any[]} args - The interaction arguments.
     * @returns {any} The processed arguments object.
     * @throws {Error} Throws an error if there are missing arguments or missing fuel information.
     */
    processArguments(ixObject, args) {
        if (args.length < 2) {
            js_moi_utils_1.ErrorUtils.throwError("One or more required arguments are missing.", js_moi_utils_1.ErrorCode.MISSING_ARGUMENT);
        }
        const processedArgs = {
            type: args[0],
            params: {
                sender: this.signer.getAddress()
            }
        };
        if (args[0] === "send") {
            processedArgs.params.type = this.getIxType();
            processedArgs.params.fuel_price = args[1].fuelPrice;
            processedArgs.params.fuel_limit = args[1].fuelLimit;
        }
        processedArgs.params.payload = ixObject.createPayload();
        return processedArgs;
    }
    /**
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
