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
     * Creates the payload for the logic interaction object.
     *
     * @param {LogicIxObject} ixObject - The logic interaction object.
     * @returns {LogicDeployPayload} The logic deploy payload.
     */
    createPayload(ixObject) {
        const payload = {
            manifest: this.encodedManifest,
            callsite: ixObject.routine != null ? ixObject.routine.name : "",
        };
        if (ixObject.routine.accepts && Object.keys(ixObject.routine.accepts).length > 0) {
            payload.calldata = this.manifestCoder.encodeArguments(payload.callsite, ...ixObject.arguments);
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
        const result = await response.result(timeout);
        return {
            logic_id: result[0].logic_id ?? "",
            error: js_moi_manifest_1.ManifestCoder.decodeException(result[0].error),
        };
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
     * @param {string} builderName - The name of the builder routine. (optional)
     * @param {any[]} args - Arguments for the builder routine. (optional)
     * @returns {LogicContext<LogicOps>} The logic interaction context.
     * @throws {Error} If the builder routine is not found or required arguments are missing.
     */
    deploy(builderName, ...args) {
        if (builderName == null) {
            const deployRoutine = { name: "", kind: "deploy" };
            return this.createIxObject(deployRoutine, ...args);
        }
        const builder = Object.values(this.manifest.elements).find(element => {
            if (element.kind === "callable") {
                const routine = element.data;
                return routine.kind === "deploy" && routine.name === builderName;
            }
            return false;
        });
        if (builder) {
            const builderRoutine = builder.data;
            if (builderRoutine.accepts && args.length < Object.keys(builderRoutine.accepts).length) {
                js_moi_utils_1.ErrorUtils.throwError("One or more required arguments are missing.", js_moi_utils_1.ErrorCode.MISSING_ARGUMENT);
            }
            return this.createIxObject(builderRoutine, ...args);
        }
        js_moi_utils_1.ErrorUtils.throwError("Invalid builder name, builder not found!", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
    }
}
exports.LogicFactory = LogicFactory;
//# sourceMappingURL=logic-factory.js.map