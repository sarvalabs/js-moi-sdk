import { LogicManifest } from "js-moi-manifest";
import { LogicPayload, Signer } from "js-moi-signer";
import { IxType } from "js-moi-utils";
import { Options } from "js-moi-providers";
import { Routines } from "../types/logic";
import { EphemeralState, PersistentState } from "./state";
import { LogicDescriptor } from "./logic-descriptor";
import { LogicIxObject, LogicIxResponse, LogicIxResult } from "../types/interaction";
/**
 * Represents a logic driver that serves as an interface for interacting with logics.
 */
export declare class LogicDriver extends LogicDescriptor {
    readonly routines: Routines;
    readonly persistentState: PersistentState;
    readonly ephemeralState: EphemeralState;
    constructor(logicId: string, manifest: LogicManifest.Manifest, signer: Signer);
    /**
     * Creates the persistent and ephemeral states for the logic driver,
     if available in logic manifest.
     */
    private createState;
    /**
     * Creates an interface for executing routines defined in the logic manifest.
     */
    private createRoutines;
    /**
     * Checks if a routine is mutable based on its name.
     *
     * @param {string} routineName - The name of the routine.
     * @returns {boolean} True if the routine is mutable, false otherwise.
     */
    private isMutableRoutine;
    /**
     * Normalizes a routine name by removing the exclamation mark if present.
     *
     * @param {string} routineName - The routine name
     * @returns {string} The normalized routine name.
     */
    private normalizeRoutineName;
    /**
     * Returns the interaction type for the logic driver.
     *
     * @returns {IxType} The interaction type.
     */
    protected getIxType(): IxType;
    /**
     * Creates the logic payload from the given interaction object.
     *
     * @param {LogicIxObject} ixObject - The interaction object.
     * @returns {LogicPayload} The logic payload.
     */
    protected createPayload(ixObject: LogicIxObject): LogicPayload;
    /**
     * Processes the logic interaction result and returns the decoded data or
     error, if available.
     *
     * @param {LogicIxResponse} response - The logic interaction response.
     * @param {number} timeout - The custom timeout for processing the result. (optional)
     * @returns {Promise<LogicIxResult | null>} A promise that resolves to the
     logic interaction result or null.
     */
    protected processResult(response: LogicIxResponse, timeout?: number): Promise<LogicIxResult | null>;
}
/**
 * Returns a logic driver instance based on the given logic id.
 *
 * @param {string} logicId - The logic id of the logic.
 * @param {Signer} signer - The signer instance for signing the interactions.
 * @param {Options} options - The custom tesseract options for retrieving
 * logic manifest. (optional)
 * @returns {Promise<LogicDriver>} A promise that resolves to a LogicDriver instance.
 */
export declare const getLogicDriver: (logicId: string, signer: Signer, options?: Options) => Promise<LogicDriver>;
