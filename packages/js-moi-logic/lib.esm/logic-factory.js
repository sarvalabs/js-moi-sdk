import { ManifestCoder } from "js-moi-manifest";
import { ErrorCode, ErrorUtils, IxType, hexToBytes } from "js-moi-utils";
import { LogicBase } from "./logic-base";
/**
 * This class represents a factory for deploying logic.
 */
export class LogicFactory extends LogicBase {
    manifest;
    encodedManifest;
    constructor(manifest, signer) {
        super(manifest, signer);
        this.manifest = manifest;
        this.encodedManifest = ManifestCoder.encodeManifest(manifest);
    }
    /**
     * Retrieves the interaction type associated with the LogicFactory.
     *
     * @returns {IxType} The interaction type.
     */
    getIxType() {
        return IxType.LOGIC_DEPLOY;
    }
    /**
     * Creates the payload for the logic interaction object.
     *
     * @param {LogicIxObject} ixObject - The logic interaction object.
     * @returns {LogicPayload} The logic payload.
     */
    createPayload(ixObject) {
        const payload = {
            manifest: hexToBytes(this.encodedManifest),
            callsite: ixObject.routine.name
        };
        if (ixObject.routine.accepts && Object.keys(ixObject.routine.accepts).length > 0) {
            const calldata = this.manifestCoder.encodeArguments(ixObject.routine.accepts, ixObject.arguments);
            payload.calldata = hexToBytes(calldata);
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
                error: ManifestCoder.decodeException(result.error)
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
     * @returns {LogicIxRequest} The logic interaction request object.
     * @throws {Error} If the builder routine is not found or if there are missing arguments.
     */
    deploy(builderName, ...args) {
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
            const argsLen = args.at(-1) && typeof args.at(-1) === "object" ? args.length - 1 : args.length;
            if (builderRoutine.accepts && (argsLen < Object.keys(builderRoutine.accepts).length)) {
                ErrorUtils.throwError("One or more required arguments are missing.", ErrorCode.MISSING_ARGUMENT);
            }
            return this.createIxObject(builderRoutine, ...args).send();
        }
        ErrorUtils.throwError("Invalid builder name, builder not found!", ErrorCode.INVALID_ARGUMENT);
    }
}
//# sourceMappingURL=logic-factory.js.map