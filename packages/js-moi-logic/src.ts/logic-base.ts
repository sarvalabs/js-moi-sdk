import { ElementDescriptor, ManifestCoder } from "js-moi-manifest";
import { InteractionResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { ErrorCode, ErrorUtils, LogicState, OpType, type ElementData, type ElementType, type IxOperation, type LogicManifest, type OperationResult } from "js-moi-utils";
import type { RoutineOption } from "./routine-options";

/**
 * The default fuel price used for logic interactions.
 */
const DEFAULT_FUEL_PRICE = 1;

/**
 * This abstract class extends the ElementDescriptor class and serves as a base
 * class for logic-related operations.
 * It defines common properties and abstract methods that subclasses should implement.
 */
export abstract class LogicBase extends ElementDescriptor {
    protected signer: Signer;
    protected readonly manifestCoder: ManifestCoder;

    constructor(manifest: LogicManifest, signer: Signer) {
        super(manifest.elements);

        this.manifestCoder = new ManifestCoder(manifest);
        this.signer = signer;
    }

    protected abstract createOperationPayload(
        callsite: string,
        args: unknown[]
    ): IxOperation<OpType.LogicInvoke> | IxOperation<OpType.LogicDeploy> | IxOperation<OpType.LogicInvoke>;

    protected processLogicResult(callsite: string, result: OperationResult<OpType.LogicEnlist | OpType.LogicInvoke> | InteractionResponse) {
        if (result instanceof InteractionResponse) {
            return result;
        }

        const exception = ManifestCoder.decodeException(result.error);

        if (exception != null) {
            ErrorUtils.throwError(exception.error, ErrorCode.CALL_EXCEPTION, exception);
        }

        return this.manifestCoder.decodeOutput(callsite, result.outputs);
    }

    /**
     * Checks if a routine is mutable based on its name.
     *
     * @param {string} routineName - The name of the routine.
     * @returns {boolean} True if the routine is mutable, false otherwise.
     */
    private isMutableRoutine(routine: ElementData<ElementType.Routine>): boolean {
        return [LogicState.Ephemeral, LogicState.Persistent].includes(routine.mode);
    }

    protected async triggerCallsite(callsite: string, args: unknown[], option?: RoutineOption) {
        const routine = this.getRoutineElement(callsite);
        const request = {
            fuel_price: option?.fuel_price ?? DEFAULT_FUEL_PRICE,
            fuel_limit: option?.fuel_limit ?? 10000, // TODO: remove a hard-coded default value
            operations: [this.createOperationPayload(callsite, args)],
        };

        if (this.isMutableRoutine(routine.data) == false) {
            const { result } = await this.signer.simulate(request, option?.sequence);

            switch (result[0]?.op_type) {
                case OpType.LogicInvoke:
                case OpType.LogicEnlist: {
                    return this.processLogicResult(callsite, result[0].data);
                }
                default: {
                    ErrorUtils.throwError("Expected LogicInvoke or LogicDeploy operation");
                }
            }
        }

        const ix = await this.signer.execute(request);
        return this.processLogicResult(callsite, ix);
    }

    // abstract methods to be implemented by subclasses
}
