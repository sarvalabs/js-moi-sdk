"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicFactory = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
const logic_base_1 = require("./logic-base");
const routine_options_1 = require("./routine-options");
/**
 * This class represents a factory for deploying logic.
 */
class LogicFactory extends logic_base_1.LogicBase {
    encodedManifest;
    constructor(manifest, signer) {
        super(manifest, signer);
        this.encodedManifest = js_moi_manifest_1.ManifestCoder.encodeManifest(manifest);
    }
    /**
     * Creates the payload for the logic interaction object.
     *
     * @param {LogicIxObject} ixObject - The logic interaction object.
     * @returns {LogicDeployPayload} The logic deploy payload.
     */
    createPayload(ixObject) {
        const payload = {
            manifest: this.encodedManifest,
            callsite: ixObject.routine.name,
            calldata: "",
        };
        if (ixObject.routine.accepts && Object.keys(ixObject.routine.accepts).length > 0) {
            payload.calldata = this.manifestCoder.encodeArguments(payload.callsite, ...ixObject.arguments);
        }
        return payload;
    }
    createOperationPayload(callsite, args) {
        throw new Error("Method not implemented.");
    }
    /**
     * Processes the result of a logic interaction response.
     *
     * @param {LogicIxResponse} response - The logic interaction response.
     * @param {number} timeout - The custom timeout for processing the result. (optional)
     * @returns {Promise<LogicIxResult>} The processed logic interaction result.
     */
    async processResult(response, timeout) {
        try {
            const result = await response.result(timeout);
            return {
                logic_id: result[0].logic_id ? result[0].logic_id : "",
                error: js_moi_manifest_1.ManifestCoder.decodeException(result[0].error),
            };
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * Returns the POLO encoded manifest in hexadecimal format.
     *
     * @returns {string} The encoded manifest.
     */
    getEncodedManifest() {
        return this.encodedManifest;
    }
    /**
     * Deploys a logic.
     *
     * @param {string} callsite - The name of the builder routine.
     * @param {any[]} args - Optional arguments for the deployment.
     * @returns {LogicIxRequest} The logic interaction request object.
     * @throws {Error} If the builder routine is not found or if there are missing arguments.
     */
    deploy(callsite, ...args) {
        const element = this.getRoutineElement(callsite);
        if (element.data.kind !== js_moi_utils_1.RoutineType.Deploy) {
            js_moi_utils_1.ErrorUtils.throwError("The specified routine is not a deploy routine.", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        const hasOption = args.at(-1) instanceof routine_options_1.RoutineOption;
        const callsiteArgs = hasOption ? args.slice(0, -1) : args;
        const option = hasOption ? args.at(-1) : undefined;
        if (element.data.accepts.length !== callsiteArgs.length) {
            const sign = `${element.data.name}(${element.data.accepts.map((arg) => arg.label + ": " + arg.type).join(", ")})`;
            js_moi_utils_1.ErrorUtils.throwArgumentError(`Invalid number of arguments for routine: ${sign}`, "args", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        return this.createIxObject(element.data, callsiteArgs, option);
    }
    createIxObject(data, arg1, option) {
        throw new Error("Method not implemented.");
    }
}
exports.LogicFactory = LogicFactory;
//# sourceMappingURL=logic-factory.js.map