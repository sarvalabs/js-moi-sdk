import { LogicManifest, ManifestCoder } from "js-moi-manifest";
import { LogicPayload, Options } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { ErrorCode, ErrorUtils, IxType, defineReadOnly, hexToBytes } from "js-moi-utils";
import { LogicIxObject, LogicIxResponse, LogicIxResult } from "../types/interaction";
import { Routines } from "../types/logic";
import { LogicDescriptor } from "./logic-descriptor";
import { EphemeralState, PersistentState } from "./state";

/**
 * Represents a logic driver that serves as an interface for interacting with logics.
 */
export class LogicDriver<T extends Record<string, (...args: any) => any> = any> extends LogicDescriptor {
    public readonly routines: Routines<T> = {} as Routines<T>;
    public readonly persistentState: PersistentState;
    public readonly ephemeralState: EphemeralState;

    constructor(logicId: string, manifest: LogicManifest.Manifest, value: Signer) {
        super(logicId, manifest, value)
        this.createState();
        this.createRoutines();
    }

    /**
     * Creates the persistent and ephemeral states for the logic driver, 
     if available in logic manifest.
     */
    private createState() {
        const [persistentStatePtr, persistentStateExists] = this.hasPersistentState()

        if(persistentStateExists) {
            const persistentState = new PersistentState(
                this.logicId.hex(),
                this.elements.get(persistentStatePtr),
                this.manifestCoder,
                this.signer.getProvider()
            )

            defineReadOnly(this, "persistentState", persistentState)
        }
    }

    /**
     * Creates an interface for executing routines defined in the logic manifest.
     */
    private createRoutines() {
        const routines = {};

        this.manifest.elements.forEach((element: LogicManifest.Element) => {
            if (element.kind !== "routine") {
                return;
            }

            const routine = element.data as LogicManifest.Routine;

            if (routine.kind !== "invokable") {
                return;
            }

            const name = this.normalizeRoutineName(routine.name);

            routines[name] = async (...params: any[]) => {
                const argsLen =
                    params.at(-1) && typeof params.at(-1) === "object"
                        ? params.length - 1
                        : params.length;

                if (routine.accepts && argsLen < routine.accepts.length) {
                    ErrorUtils.throwError(
                        "One or more required arguments are missing.",
                        ErrorCode.INVALID_ARGUMENT
                    );
                }

                const ixObject = this.createIxObject(routine, ...params);

                if (!this.isMutableRoutine(routine.name)) {
                    return await ixObject.unwrap();
                }

                return await ixObject.send();
            };

            routines[name].isMutable = (): boolean => {
                return this.isMutableRoutine(routine.name)
            }

            routines[name].accepts = (): LogicManifest.TypeField[] | null => {
                return routine.accepts ? routine.accepts : null
            }

            routines[name].returns = (): LogicManifest.TypeField[] | null => {
                return routine.returns ? routine.returns : null
            }
        })

        defineReadOnly(this, "routines", routines as Routines<T>);
    }

    /**
     * Checks if a routine is mutable based on its name.
     * 
     * @param {string} routineName - The name of the routine.
     * @returns {boolean} True if the routine is mutable, false otherwise.
     */
    private isMutableRoutine(routineName: string): boolean {
        return routineName.endsWith("!");
    }

    /**
     * Normalizes a routine name by removing the exclamation mark if present.
     * 
     * @param {string} routineName - The routine name
     * @returns {string} The normalized routine name.
     */
    private normalizeRoutineName(routineName: string): string {
        if (this.isMutableRoutine(routineName)) {
            return routineName.slice(0, -1); // Remove the last character (exclamation mark)
        }

        return routineName; // If no exclamation mark, return the original string
    }

    /**
     * Returns the interaction type for the logic driver.
     * 
     * @returns {IxType} The interaction type.
     */
    protected getIxType(): IxType {
        return IxType.LOGIC_INVOKE;
    }

    /**
     * Creates the logic payload from the given interaction object.
     * 
     * @param {LogicIxObject} ixObject - The interaction object.
     * @returns {LogicPayload} The logic payload.
     */
    protected createPayload(ixObject: LogicIxObject): LogicPayload {
        const payload = {
            logic_id: this.getLogicId(),
            callsite: ixObject.routine.name,
        } as LogicPayload

        if(ixObject.routine.accepts && 
        Object.keys(ixObject.routine.accepts).length > 0) {
            const calldata = this.manifestCoder.encodeArguments(
                ixObject.routine.accepts, 
                ixObject.arguments
            );
            payload.calldata = hexToBytes(calldata);
        }

        return payload;
    }

    /**
     * Processes the logic interaction result and returns the decoded data or 
     error, if available.
     * 
     * @param {LogicIxResponse} response - The logic interaction response.
     * @param {number} timeout - The custom timeout for processing the result. (optional)
     * @returns {Promise<LogicIxResult | null>} A promise that resolves to the 
     logic interaction result or null.
     */
    protected async processResult(response: LogicIxResponse, timeout?: number): Promise<LogicIxResult | null> {
        try {
            const routine = this.getRoutineElement(response.routine_name)
            const result = await response.result(timeout);
            const data = { 
                output: this.manifestCoder.decodeOutput(
                    result.outputs,
                    routine.data["returns"]
                ), 
                error: ManifestCoder.decodeException(result.error) 
            };
    
            if(data.output || data.error) {
                return data
            }

            return null
        } catch(err) {
            throw err;
        }
    }
}

/**
 * Returns a logic driver instance based on the given logic id.
 * 
 * @param {string} logicId - The logic id of the logic.
 * @param {Signer} signer - The signer or provider instance. 
 * @param {Options} options - The custom tesseract options for retrieving 
 * logic manifest. (optional)
 * @returns {Promise<LogicDriver>} A promise that resolves to a LogicDriver instance.
 */
export const getLogicDriver = async <T extends Record<string, (...args: any) => any>>(logicId: string, signer: Signer, options?: Options): Promise<LogicDriver<T>> => {
    try {
        const provider = signer.getProvider();
        const manifest = await provider.getLogicManifest(logicId, "JSON", options);

        if (typeof manifest === "object") {
            return  new LogicDriver<T>(logicId, manifest, signer);
        }

        ErrorUtils.throwError(
            "Invalid logic manifest",
            ErrorCode.INVALID_ARGUMENT
        );
    } catch(err) {
        throw err;
    }
}
