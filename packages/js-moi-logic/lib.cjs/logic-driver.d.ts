import { LogicManifest } from "js-moi-manifest";
import { LogicPayload, Options, type AbstractProvider } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { LogicIxObject, LogicIxResponse } from "../types/interaction";
import { Routines } from "../types/logic";
import { LogicDescriptor } from "./logic-descriptor";
import { EphemeralState, PersistentState } from "./state";
/**
 * Represents a logic driver that serves as an interface for interacting with logics.
 */
export declare class LogicDriver<T extends Record<string, (...args: any) => any> = any> extends LogicDescriptor {
    readonly routines: Routines<T>;
    readonly persistentState: PersistentState;
    readonly ephemeralState: EphemeralState;
    constructor(logicId: string, manifest: LogicManifest.Manifest, signer: Signer);
    constructor(logicId: string, manifest: LogicManifest.Manifest, provider: AbstractProvider);
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
    protected processResult(response: LogicIxResponse, timeout?: number): Promise<unknown | null>;
}
type LogicRoutines = Record<string, (...args: any) => any>;
interface GetLogicDriver {
    /**
     * Returns a logic driver instance based on the given logic id.
     *
     * @param {string} logicId - The logic id of the logic.
     * @param {Signer} signer - The signer instance.
     * @param {Options} options - The custom tesseract options for retrieving
     * logic manifest. (optional)
     * @returns {Promise<LogicDriver>} A promise that resolves to a LogicDriver instance.
     */
    <TLogic extends LogicRoutines>(logicId: string, signer: Signer, options?: Options): Promise<LogicDriver<TLogic>>;
    /**
     * Returns a logic driver instance based on the given logic id.
     *
     * @param {string} logicId - The logic id of the logic.
     * @param {AbstractProvider} provider - The provider instance.
     * @param {Options} options - The custom tesseract options for retrieving
     * logic manifest. (optional)
     * @returns {Promise<LogicDriver>} A promise that resolves to a LogicDriver instance.
     */
    <TLogic extends LogicRoutines>(logicId: string, provider: AbstractProvider, options?: Options): Promise<LogicDriver<TLogic>>;
}
/**
 * Returns a logic driver instance based on the given logic id.
 *
 * @param {string} logicId - The logic id of the logic.
 * @param {Signer | AbstractProvider} signerOrProvider - The instance of the `Signer` or `AbstractProvider`.
 * @param {Options} options - The custom tesseract options for retrieving
 *
 * @returns {Promise<LogicDriver>} A promise that resolves to a LogicDriver instance.
 */
export declare const getLogicDriver: GetLogicDriver;
export {};
//# sourceMappingURL=logic-driver.d.ts.map