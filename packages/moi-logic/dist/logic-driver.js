"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogicDriver = exports.LogicDriver = void 0;
const moi_manifest_1 = require("moi-manifest");
const moi_utils_1 = require("moi-utils");
const state_1 = require("./state");
const logic_descriptor_1 = require("./logic-descriptor");
/**
 * Represents a logic driver that serves as an interface for interacting with logics.
 */
class LogicDriver extends logic_descriptor_1.LogicDescriptor {
    routines = {};
    persistentState;
    ephemeralState;
    constructor(logicId, manifest, signer) {
        super(logicId, manifest, signer);
        this.createState();
        this.createRoutines();
    }
    /**
     * Creates the persistent and ephemeral states for the logic driver,
     if available in logic manifest.
     */
    createState() {
        const provider = this.signer.getProvider();
        const [persistentStatePtr, persistentStateExists] = this.hasPersistentState();
        if (persistentStateExists) {
            const persistentState = new state_1.PersistentState(this.logicId.hex(), this.elements.get(persistentStatePtr), this.manifestCoder, provider);
            (0, moi_utils_1.defineReadOnly)(this, "persistentState", persistentState);
        }
    }
    /**
     * Creates an interface for executing routines defined in the logic manifest.
     */
    createRoutines() {
        const routines = {};
        this.manifest.elements.forEach((element) => {
            if (element.kind === "routine") {
                const routine = element.data;
                if (routine.kind === "invokable") {
                    const routineName = this.normalizeRoutineName(routine.name);
                    // Create a routine execution function
                    routines[routineName] = ((args = []) => {
                        return this.createIxObject(routine, ...args);
                    });
                    // Define routine properties
                    routines[routineName].isMutable = () => {
                        return this.isMutableRoutine(routine.name);
                    };
                    routines[routineName].accepts = () => {
                        return routine.accepts ? routine.accepts : null;
                    };
                    routines[routineName].returns = () => {
                        return routine.returns ? routine.returns : null;
                    };
                }
            }
        });
        (0, moi_utils_1.defineReadOnly)(this, "routines", routines);
    }
    /**
     * Checks if a routine is mutable based on its name.
     *
     * @param {string} routineName - The name of the routine.
     * @returns {boolean} True if the routine is mutable, false otherwise.
     */
    isMutableRoutine(routineName) {
        return routineName.endsWith("!");
    }
    /**
     * Normalizes a routine name by removing the exclamation mark if present.
     *
     * @param {string} routineName - The routine name
     * @returns {string} The normalized routine name.
     */
    normalizeRoutineName(routineName) {
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
    getIxType() {
        return moi_utils_1.IxType.LOGIC_INVOKE;
    }
    /**
     * Creates the logic payload from the given interaction object.
     *
     * @param {LogicIxObject} ixObject - The interaction object.
     * @returns {LogicPayload} The logic payload.
     */
    createPayload(ixObject) {
        const payload = {
            logic_id: this.getLogicId(),
            callsite: ixObject.routine.name,
        };
        if (ixObject.routine.accepts &&
            Object.keys(ixObject.routine.accepts).length > 0) {
            const calldata = this.manifestCoder.encodeArguments(ixObject.routine.accepts, ixObject.arguments);
            payload.calldata = (0, moi_utils_1.hexToBytes)(calldata);
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
            const routine = this.getRoutineElement(response.routine_name);
            const result = await response.result(timeout);
            const data = {
                output: this.manifestCoder.decodeOutput(result.outputs, routine.data["returns"]),
                error: moi_manifest_1.ManifestCoder.decodeException(result.error)
            };
            if (data.output || data.error) {
                return data;
            }
            return null;
        }
        catch (err) {
            throw err;
        }
    }
}
exports.LogicDriver = LogicDriver;
/**
 * Returns a logic driver instance based on the given logic id.
 *
 * @param {string} logicId - The logic id of the logic.
 * @param {Signer} signer - The signer instance for signing the interactions.
 * @param {Options} options - The custom tesseract options for retrieving
 * logic manifest. (optional)
 * @returns {Promise<LogicDriver>} A promise that resolves to a LogicDriver instance.
 */
const getLogicDriver = async (logicId, signer, options) => {
    try {
        const provider = signer.getProvider();
        const manifest = await provider.getLogicManifest(logicId, "JSON", options);
        if (typeof manifest === 'object') {
            return new LogicDriver(logicId, manifest, signer);
        }
        moi_utils_1.ErrorUtils.throwError("Invalid logic manifest", moi_utils_1.ErrorCode.INVALID_ARGUMENT);
    }
    catch (err) {
        throw err;
    }
};
exports.getLogicDriver = getLogicDriver;
