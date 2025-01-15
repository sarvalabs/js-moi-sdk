import { ManifestCoder, ManifestCoderFormat } from "js-moi-manifest";
import { ElementType, ErrorCode, ErrorUtils, LogicId, defineReadOnly } from "js-moi-utils";
import { LogicDescriptor } from "./logic-descriptor";
import { RoutineOption } from "./routine-options";
import { EphemeralState, PersistentState } from "./state";
/**
 * Represents a logic driver that serves as an interface for interacting with logics.
 */
export class LogicDriver extends LogicDescriptor {
    routines;
    persistentState;
    ephemeralState;
    constructor(logicId, manifest, arg) {
        super(logicId, manifest, arg);
        this.createState();
        this.routines = this.createRoutines();
        Object.defineProperty(this, "routines", { writable: false });
    }
    /**
     * Creates the persistent and ephemeral states for the logic driver,
     if available in logic manifest.
     */
    createState() {
        const hasPersistance = this.stateMatrix.persistent();
        const hasEphemeral = this.stateMatrix.ephemeral();
        if (hasPersistance) {
            const persistentState = new PersistentState(this, this.signer.getProvider());
            defineReadOnly(this, "persistentState", persistentState);
        }
        if (hasEphemeral) {
            const ephemeralState = new EphemeralState(this, this.signer.getProvider());
            defineReadOnly(this, "ephemeralState", ephemeralState);
        }
    }
    newRoutine(data) {
        const metadata = {
            kind: data.kind,
            mode: data.mode,
            isMutating: this.isMutableRoutine(data),
            accepts: data.accepts,
            returns: data.returns,
            catches: data.catches,
        };
        const callback = async (...params) => {
            const hasOption = params.at(-1) instanceof RoutineOption;
            const args = hasOption ? params.slice(0, -1) : params;
            const option = hasOption ? params.at(-1) : undefined;
            console.log("args", args);
            console.log("options", option);
            if (args.length !== metadata.accepts.length) {
                const sign = `${data.name}(${metadata.accepts.map((arg) => arg.label + ": " + arg.type).join(", ")})`;
                ErrorUtils.throwArgumentError(`Invalid number of arguments for routine: ${sign}`, "args", ErrorCode.INVALID_ARGUMENT);
            }
            return null;
        };
        return Object.freeze(Object.assign(callback, metadata));
    }
    /**
     * Creates an interface for executing routines defined in the logic manifest.
     */
    createRoutines() {
        const routines = {};
        for (const element of this.getElements().values()) {
            if (element.kind !== ElementType.Routine) {
                continue;
            }
            defineReadOnly(routines, element.data.name, this.newRoutine(element.data));
        }
        return routines;
    }
    /**
     * Checks if a routine is mutable based on its name.
     *
     * @param {string} routineName - The name of the routine.
     * @returns {boolean} True if the routine is mutable, false otherwise.
     */
    isMutableRoutine(routine) {
        return ["persistent", "ephemeral"].includes(routine.mode);
    }
    /**
     * Creates the logic payload from the given interaction object.
     *
     * @param {LogicIxObject} ixObject - The interaction object.
     * @returns {LogicActionPayload} The logic action payload.
     */
    createPayload(ixObject) {
        const payload = {
            logic_id: this.getLogicId().string(),
            callsite: ixObject.routine.name,
        };
        if (ixObject.routine.accepts && Object.keys(ixObject.routine.accepts).length > 0) {
            payload.calldata = this.manifestCoder.encodeArguments(ixObject.routine.name, ...ixObject.arguments);
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
    async processResult(response, timeout) {
        try {
            const result = await response.result(timeout);
            return {
                output: this.manifestCoder.decodeOutput(response.routine_name, result.outputs),
                error: ManifestCoder.decodeException(result[0].error),
            };
        }
        catch (err) {
            throw err;
        }
    }
}
/**
 * Returns a logic driver instance based on the given logic id.
 *
 * @param {string} logicId - The logic id of the logic.
 * @param {Signer} signer - The signer instance for the logic driver.
 * @param {Options} options - The custom tesseract options for retrieving
 *
 * @returns {Promise<LogicDriver>} A promise that resolves to a LogicDriver instance.
 */
export const getLogicDriver = async (logicId, signer) => {
    const id = logicId instanceof LogicId ? logicId : new LogicId(logicId);
    const { manifest: blob } = await signer.getProvider().getLogic(id, {
        modifier: { include: ["manifest"] },
    });
    const manifest = ManifestCoder.decodeManifest(blob, ManifestCoderFormat.JSON);
    return new LogicDriver(id, manifest, signer);
};
//# sourceMappingURL=logic-driver.js.map