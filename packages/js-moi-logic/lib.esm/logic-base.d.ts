import { ElementDescriptor, ManifestCoder } from "js-moi-manifest";
import { InteractionResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { OpType, type IxOperation, type LogicActionResult, type LogicManifest } from "js-moi-utils";
import type { RoutineOption } from "./routine-options";
/**
 * This abstract class extends the ElementDescriptor class and serves as a base
 * class for logic-related operations.
 * It defines common properties and abstract methods that subclasses should implement.
 */
export declare abstract class LogicBase extends ElementDescriptor {
    protected signer: Signer;
    protected readonly manifestCoder: ManifestCoder;
    constructor(manifest: LogicManifest, signer: Signer);
    protected abstract createOperationPayload(callsite: string, args: unknown[]): IxOperation<OpType.LogicInvoke> | IxOperation<OpType.LogicDeploy> | IxOperation<OpType.LogicInvoke>;
    protected processLogicResult(callsite: string, result: LogicActionResult | InteractionResponse): unknown;
    /**
     * Checks if a routine is mutable based on its name.
     *
     * @param {string} routineName - The name of the routine.
     * @returns {boolean} True if the routine is mutable, false otherwise.
     */
    private isMutableRoutine;
    protected triggerCallsite(callsite: string, args: unknown[], option?: RoutineOption): Promise<unknown>;
}
//# sourceMappingURL=logic-base.d.ts.map