import { Signer } from "js-moi-signer";
import { LogicId, OpType, type Hex, type IxOperation, type LogicManifest } from "js-moi-utils";
import { LogicDescriptor } from "./logic-descriptor";
import { EphemeralState, PersistentState } from "./state";
import type { Routine } from "./types/logic";
/**
 * Represents a logic driver that serves as an interface for interacting with logics.
 */
export declare class LogicDriver extends LogicDescriptor {
    routines: Record<string, Routine>;
    readonly persistentState?: PersistentState;
    readonly ephemeralState?: EphemeralState;
    constructor(logicId: Hex | LogicId, manifest: LogicManifest, arg: Signer);
    protected createOperationPayload(callsite: string, args: unknown[]): IxOperation<OpType.LogicInvoke>;
    /**
     * Creates the persistent and ephemeral states for the logic driver,
     if available in logic manifest.
     */
    private createState;
    private newRoutine;
    /**
     * Creates an interface for executing routines defined in the logic manifest.
     */
    private createRoutines;
}
/**
 * Returns a logic driver instance based on the given logic id.
 *
 * @param {string} logicId - The logic id of the logic.
 * @param {Signer} signer - The signer instance for the logic driver.
 *
 * @returns {Promise<LogicDriver>} A promise that resolves to a LogicDriver instance.
 */
export declare const getLogicDriver: (logicId: Hex | LogicId, signer: Signer) => Promise<LogicDriver>;
//# sourceMappingURL=logic-driver.d.ts.map