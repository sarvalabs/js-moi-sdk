"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicBase = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_providers_1 = require("js-moi-providers");
const js_moi_utils_1 = require("js-moi-utils");
/**
 * The default fuel price used for logic interactions.
 */
const DEFAULT_FUEL_PRICE = 1;
/**
 * This abstract class extends the ElementDescriptor class and serves as a base
 * class for logic-related operations.
 * It defines common properties and abstract methods that subclasses should implement.
 */
class LogicBase extends js_moi_manifest_1.ElementDescriptor {
    signer;
    manifestCoder;
    constructor(manifest, signer) {
        super(manifest.elements);
        this.manifestCoder = new js_moi_manifest_1.ManifestCoder(manifest);
        this.signer = signer;
    }
    processLogicResult(callsite, result) {
        if (result instanceof js_moi_providers_1.InteractionResponse) {
            return result;
        }
        const exception = js_moi_manifest_1.ManifestCoder.decodeException(result.error);
        if (exception != null) {
            js_moi_utils_1.ErrorUtils.throwError(exception.error, js_moi_utils_1.ErrorCode.CALL_EXCEPTION, exception);
        }
        return this.manifestCoder.decodeOutput(callsite, result.outputs);
    }
    /**
     * Checks if a routine is mutable based on its name.
     *
     * @param {string} routineName - The name of the routine.
     * @returns {boolean} True if the routine is mutable, false otherwise.
     */
    isMutableRoutine(routine) {
        return [js_moi_utils_1.LogicState.Ephemeral, js_moi_utils_1.LogicState.Persistent].includes(routine.mode);
    }
    async triggerCallsite(callsite, args, option) {
        const routine = this.getRoutineElement(callsite);
        if (this.isMutableRoutine(routine.data) == false) {
            // TODO - implement simulation in wallet
            const ix = await this.signer.getProvider().simulate((0, js_moi_utils_1.interaction)({
                sender: await this.signer.getSender(option?.sequence),
                fuel_price: option?.fuel_price ?? DEFAULT_FUEL_PRICE,
                fuel_limit: option?.fuel_limit ?? 10000, // TODO: remove a hard-coded default value
                operations: [this.createOperationPayload(callsite, args)],
            }));
            const result = ix.result[0];
            switch (result.op_type) {
                case js_moi_utils_1.OpType.LogicInvoke:
                case js_moi_utils_1.OpType.LogicDeploy: {
                    return this.processLogicResult(callsite, result.data);
                }
                default: {
                    js_moi_utils_1.ErrorUtils.throwError("Expected LogicInvoke or LogicDeploy operation");
                }
            }
        }
        const ix = await this.signer.execute({
            fuel_price: option?.fuel_price ?? DEFAULT_FUEL_PRICE,
            fuel_limit: option?.fuel_limit ?? 10000, // TODO: remove a hard-coded default value
            operations: [this.createOperationPayload(callsite, args)],
        });
        return this.processLogicResult(callsite, ix);
    }
}
exports.LogicBase = LogicBase;
//# sourceMappingURL=logic-base.js.map