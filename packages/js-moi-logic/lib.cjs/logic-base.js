"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicBase = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_signer_1 = require("js-moi-signer");
const js_moi_utils_1 = require("js-moi-utils");
const element_descriptor_1 = __importDefault(require("./element-descriptor"));
const logic_id_1 = require("./logic-id");
const DEFAULT_FUEL_PRICE = 1;
/**
 * This abstract class extends the ElementDescriptor class and serves as a base
 * class for logic-related operations.
 * It defines common properties and abstract methods that subclasses should implement.
 */
class LogicBase extends element_descriptor_1.default {
    signer;
    provider;
    manifestCoder;
    constructor(manifest, arg) {
        super(manifest.elements);
        this.manifestCoder = new js_moi_manifest_1.ManifestCoder(this.elements, this.classDefs);
        this.connect(arg);
    }
    /**
     * Returns the logic ID associated with the LogicBase instance.
     *
     * @returns {string} The logic ID.
     */
    getLogicId() {
        return new logic_id_1.LogicId("");
    }
    /**
     * Returns the interaction type based on the routine kind.
     *
     * @returns {IxType} The interaction type.
     */
    getIxType(kind) {
        switch (kind) {
            case "deploy":
                return js_moi_utils_1.IxType.LOGIC_DEPLOY;
            case "invoke":
                return js_moi_utils_1.IxType.LOGIC_INVOKE;
            case "enlist":
                return js_moi_utils_1.IxType.LOGIC_ENLIST;
            default:
                throw new Error("Unsupported routine kind!");
        }
    }
    /**
     * Updates the signer and provider instances for the LogicBase instance.
     *
     * @param {Signer | AbstractProvider} arg -  The signer or provider instance.
     */
    connect(arg) {
        if (arg instanceof js_moi_signer_1.Signer) {
            this.signer = arg;
            this.provider = arg.getProvider();
            return;
        }
        this.provider = arg;
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
    async executeRoutine(ixObject, method, option) {
        if (this.getIxType(ixObject.routine.kind) !== js_moi_utils_1.IxType.LOGIC_DEPLOY && !this.getLogicId()) {
            js_moi_utils_1.ErrorUtils.throwError("This logic object doesn't have address set yet, please set an address first.", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        const { type, params } = this.processArguments(ixObject, method, option);
        switch (type) {
            case "call": {
                const response = await this.provider.call(params);
                return {
                    ...response,
                    result: this.processResult.bind(this, {
                        ...response,
                        routine_name: ixObject.routine.name,
                    }),
                };
            }
            case "estimate": {
                if (!this.signer?.isInitialized()) {
                    js_moi_utils_1.ErrorUtils.throwError("Mutating routine calls require a signer to be initialized.", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
                }
                return this.provider.estimateFuel(params);
            }
            case "send": {
                if (!this.signer?.isInitialized()) {
                    js_moi_utils_1.ErrorUtils.throwError("Mutating routine calls require a signer to be initialized.", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
                }
                const response = await this.signer.sendInteraction(params);
                return {
                    ...response,
                    result: this.processResult.bind(this, {
                        ...response,
                        routine_name: ixObject.routine.name,
                    }),
                };
            }
            default:
                break;
        }
        js_moi_utils_1.ErrorUtils.throwError('Method "' + type + '" not supported.', js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
    }
    /**
     * Processes the interaction arguments and returns the processed arguments object.
     *
     * @param {LogicIxObject} ixObject - The interaction object.
     * @param {any[]} args - The interaction arguments.
     * @returns {any} The processed arguments object.
     * @throws {Error} Throws an error if there are missing arguments or missing fuel information.
     */
    processArguments(ixObject, type, option) {
        const params = {
            type: this.getIxType(ixObject.routine.kind),
            payload: ixObject.createPayload(),
        };
        if (option.sender != null) {
            params.sender = option.sender;
        }
        else {
            if (this.signer?.isInitialized()) {
                params.sender = this.signer.getAddress();
            }
        }
        if (option.fuelPrice != null) {
            params.fuel_price = option.fuelPrice;
        }
        if (option.fuelLimit != null) {
            params.fuel_limit = option.fuelLimit;
        }
        return { type, params: { ...params, ...option } };
    }
    /**
     * Creates a logic interaction request object based on the given interaction object.
     *
     * @param {LogicIxObject} ixObject - The interaction object.
     * @returns {LogicIxRequest} The logic interaction request object.
     */
    createIxRequest(ixObject) {
        const unwrap = async () => {
            const ix = await ixObject.call();
            return await ix.result();
        };
        return {
            unwrap,
            call: ixObject.call.bind(ixObject),
            send: ixObject.send.bind(ixObject),
            estimateFuel: ixObject.estimateFuel.bind(ixObject)
        };
    }
    /**
     * Creates a logic interaction request object with the specified routine and arguments.
     *
     * @param {LogicManifest.Routine} routine - The routine for the logic interaction request.
     * @param {any[]} args - The arguments for the logic interaction request.
     * @returns {LogicIxRequest} The logic interaction request object.
     */
    createIxObject(routine, ...args) {
        const option = args.at(-1) && typeof args.at(-1) === "object" ? args.pop() : {};
        const ixObject = {
            routine: routine,
            arguments: args
        };
        ixObject.call = async () => {
            return this.executeRoutine(ixObject, "call", option);
        };
        ixObject.send = async () => {
            option.fuelLimit = option.fuelLimit != null ? option.fuelLimit : await ixObject.estimateFuel();
            option.fuelPrice = option.fuelPrice != null ? option.fuelPrice : DEFAULT_FUEL_PRICE;
            return this.executeRoutine(ixObject, "send", option);
        };
        ixObject.estimateFuel = () => {
            return this.executeRoutine(ixObject, "estimate", option);
        };
        ixObject.createPayload = () => {
            return this.createPayload(ixObject);
        };
        return this.createIxRequest(ixObject);
    }
}
exports.LogicBase = LogicBase;
//# sourceMappingURL=logic-base.js.map