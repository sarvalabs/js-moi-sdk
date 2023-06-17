import { LogicPayload, Signer } from "moi-signer";
import { IxType, LogicManifest } from "moi-utils";
import { Options } from "moi-providers";
import { Routines } from "../types/logic";
import { EphemeralState, PersistentState } from "./state";
import { LogicDescriptor } from "./logic-descriptor";
import { LogicIxObject, LogicIxResponse, LogicIxResult } from "../types/interaction";
/**
 * LogicDriver
 *
 * Represents a logic driver that serves as an interface for interacting with logics.
 */
export declare class LogicDriver extends LogicDescriptor {
    routines: Routines;
    persistentState: PersistentState;
    ephemeralState: EphemeralState;
    constructor(logicId: string, manifest: LogicManifest.Manifest, signer: Signer);
    /**
     * createState
     *
     * Creates the persistent and ephemeral states for the logic driver,
     if available in logic manifest.
     */
    private createState;
    /**
     * createRoutines
     *
     * Creates an interface for executing routines defined in the logic manifest.
     */
    private createRoutines;
    /**
     * isMutableRoutine
     *
     * Checks if a routine is mutable based on its name.
     *
     * @param {string} routineName - The name of the routine.
     * @returns {boolean} True if the routine is mutable, false otherwise.
     */
    private isMutableRoutine;
    /**
     * normalizeRoutineName
     *
     * Normalizes a routine name by removing the exclamation mark if present.
     *
     * @param {string} routineName - The routine name
     * @returns {string} The normalized routine name.
     */
    private normalizeRoutineName;
    /**
     * getIxType
     *
     * Returns the interaction type for the logic driver.
     *
     * @returns {IxType} The interaction type.
     */
    protected getIxType(): IxType;
    /**
     * createPayload
     *
     * Creates the logic payload from the given interaction object.
     *
     * @param {LogicIxObject} ixObject - The interaction object.
     * @returns {LogicPayload} The logic payload.
     */
    protected createPayload(ixObject: LogicIxObject): LogicPayload;
    /**
     * processResult
     *
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
 * getLogicDriver
 *
 * Returns a logic driver instance based on the given logic id.
 *
 * @param {string} logicId - The logic id of the logic.
 * @param {Signer} signer - The signer instance for signing the interactions.
 * @param {Options} options - The custom tesseract options for retrieving
 * logic manifest. (optional)
 * @returns {Promise<LogicDriver>} A promise that resolves to a LogicDriver instance.
 */
export declare const getLogicDriver: (logicId: string, signer: Signer, options?: Options) => Promise<LogicDriver>;
