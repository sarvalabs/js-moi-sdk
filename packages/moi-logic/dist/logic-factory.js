"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicFactory = void 0;
const moi_abi_1 = require("moi-abi");
const moi_utils_1 = require("moi-utils");
const logic_base_1 = require("./logic-base");
/**
 * LogicFactory Class
 *
 * This class represents a factory for deploying logic.
 */
class LogicFactory extends logic_base_1.LogicBase {
    manifest;
    encodedManifest;
    constructor(manifest, signer) {
        super(manifest, signer);
        this.manifest = manifest;
        this.encodedManifest = moi_abi_1.ABICoder.encodeABI(manifest);
    }
    /**
     * getIxType
     *
     * Retrieves the interaction type associated with the LogicFactory.
     *
     * @returns {IxType} The interaction type.
     */
    getIxType() {
        return moi_utils_1.IxType.LOGIC_DEPLOY;
    }
    /**
     * createPayload
     *
     * Creates the payload for the logic interaction object.
     *
     * @param {LogicIxObject} ixObject - The logic interaction object.
     * @returns {LogicPayload} The logic payload.
     */
    createPayload(ixObject) {
        const payload = {
            manifest: this.encodedManifest,
            callsite: ixObject.routine.name
        };
        if (ixObject.routine.accepts && Object.keys(ixObject.routine.accepts).length > 0) {
            payload.calldata = this.abiCoder.encodeArguments(ixObject.routine.accepts, ixObject.arguments);
        }
        return payload;
    }
    /**
     * processResult
     *
     * Processes the result of a logic interaction response.
     *
     * @param {LogicIxResponse} response - The logic interaction response.
     * @param {number} timeout - The custom timeout for processing the result. (optional)
     * @returns {Promise<LogicIxResult>} The processed logic interaction result.
     */
    async processResult(response, timeout) {
        try {
            const result = await response.result(response.hash, timeout);
            return {
                logic_id: result.logic_id ? result.logic_id : "",
                error: moi_abi_1.ABICoder.decodeException(result.error)
            };
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * deploy
     *
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
                element.data = element.data;
                return element.data.kind === "deployer" &&
                    builderName === element.data.name;
            }
            return false;
        });
        if (builder) {
            builder.data = builder.data;
            if (builder.data.accepts && Object.keys(builder.data.accepts).length != args.length) {
                moi_utils_1.ErrorUtils.throwError("One or more required arguments are missing.", moi_utils_1.ErrorCode.MISSING_ARGUMENT);
            }
            return this.createIxObject(builder.data, ...args);
        }
        moi_utils_1.ErrorUtils.throwError("Invalid builder name, builder not found!", moi_utils_1.ErrorCode.INVALID_ARGUMENT);
    }
}
exports.LogicFactory = LogicFactory;
