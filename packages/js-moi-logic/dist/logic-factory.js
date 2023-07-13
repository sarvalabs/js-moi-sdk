"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicFactory = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
const logic_base_1 = require("./logic-base");
/**
 * This class represents a factory for deploying logic.
 */
class LogicFactory extends logic_base_1.LogicBase {
    manifest;
    encodedManifest;
    constructor(manifest, signer) {
        super(manifest, signer);
        this.manifest = manifest;
        this.encodedManifest = js_moi_manifest_1.ManifestCoder.encodeManifest(manifest);
    }
    /**
     * Retrieves the interaction type associated with the LogicFactory.
     *
     * @returns {IxType} The interaction type.
     */
    getIxType() {
        return js_moi_utils_1.IxType.LOGIC_DEPLOY;
    }
    /**
     * Creates the payload for the logic interaction object.
     *
     * @param {LogicIxObject} ixObject - The logic interaction object.
     * @returns {LogicPayload} The logic payload.
     */
    createPayload(ixObject) {
        const payload = {
            manifest: (0, js_moi_utils_1.hexToBytes)(this.encodedManifest),
            callsite: ixObject.routine.name
        };
        if (ixObject.routine.accepts && Object.keys(ixObject.routine.accepts).length > 0) {
            const calldata = this.manifestCoder.encodeArguments(ixObject.routine.accepts, ixObject.arguments);
            payload.calldata = (0, js_moi_utils_1.hexToBytes)(calldata);
        }
        return payload;
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
                logic_id: result.logic_id ? result.logic_id : "",
                error: js_moi_manifest_1.ManifestCoder.decodeException(result.error)
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
     * @param {string} builderName - The name of the builder routine.
     * @param {any[]} args - Optional arguments for the deployment.
     * @returns {LogicDeployRequest} The logic deployment request object.
     * @throws {Error} If the builder routine is not found or if there are missing arguments.
     */
    deploy(builderName, args = []) {
        const builder = Object.values(this.manifest.elements)
            .find(element => {
            if (element.kind === "routine") {
                const routine = element.data;
                return routine.kind === "deployer" &&
                    builderName === routine.name;
            }
            return false;
        });
        if (builder) {
            const builderRoutine = builder.data;
            if (builderRoutine.accepts && Object.keys(builderRoutine.accepts).length != args.length) {
                js_moi_utils_1.ErrorUtils.throwError("One or more required arguments are missing.", js_moi_utils_1.ErrorCode.MISSING_ARGUMENT);
            }
            return this.createIxObject(builderRoutine, ...args);
        }
        js_moi_utils_1.ErrorUtils.throwError("Invalid builder name, builder not found!", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
    }
}
exports.LogicFactory = LogicFactory;
