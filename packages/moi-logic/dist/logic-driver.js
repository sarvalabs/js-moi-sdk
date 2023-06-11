"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogicDriver = exports.LogicDriver = void 0;
const moi_abi_1 = require("moi-abi");
const moi_utils_1 = require("moi-utils");
const state_1 = require("./state");
const logic_descriptor_1 = require("./logic-descriptor");
/**
 * LogicDriver
 *
 * Represents a logic driver that serves as an interface for interacting with logics.
 */
class LogicDriver extends logic_descriptor_1.LogicDescriptor {
    routines = {};
    persistentState;
    ephemeralState;
    constructor(logicId, manifest, provider) {
        super(logicId, manifest, provider);
        this.createState();
        this.createRoutines();
    }
    /**
     * createState
     *
     * Creates the persistent and ephemeral states for the logic driver,
     if available in logic manifest.
     */
    createState() {
        const [persistentStatePtr, persistentStateExists] = this.hasPersistentState();
        if (persistentStateExists) {
            this.persistentState = new state_1.PersistentState(this.logicId.hex(), this.elements.get(persistentStatePtr), this.abiCoder, this.provider);
        }
    }
    /**
     * createRoutines
     *
     * Creates an interface for executing routines defined in the logic manifest.
     */
    createRoutines() {
        this.manifest.elements.forEach((element) => {
            if (element.kind === "routine") {
                const routine = element.data;
                if (routine.kind === "invokable") {
                    const routineName = this.normalizeRoutineName(routine.name);
                    // Create a routine execution function
                    this.routines[routineName] = ((args = []) => {
                        return this.createIxObject(routine, ...args);
                    });
                    // Define routine properties
                    this.routines[routineName].isMutable = () => {
                        return this.isMutableRoutine(routineName);
                    };
                    this.routines[routineName].accepts = () => {
                        return routine.accepts ? routine.accepts : null;
                    };
                    this.routines[routineName].returns = () => {
                        return routine.returns ? routine.returns : null;
                    };
                }
            }
        });
    }
    /**
     * isMutableRoutine
     *
     * Checks if a routine is mutable based on its name.
     *
     * @param {string} routineName - The name of the routine.
     * @returns {boolean} True if the routine is mutable, false otherwise.
     */
    isMutableRoutine(routineName) {
        return routineName.endsWith("!");
    }
    /**
     * normalizeRoutineName
     *
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
     * getIxType
     *
     * Returns the interaction type for the logic driver.
     *
     * @returns {IxType} The interaction type.
     */
    getIxType() {
        return moi_utils_1.IxType.LOGIC_INVOKE;
    }
    /**
     * createPayload
     *
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
            payload.calldata = this.abiCoder.encodeArguments(ixObject.routine.accepts, ixObject.arguments);
        }
        return payload;
    }
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
    async processResult(response, timeout) {
        try {
            const routine = this.getRoutineElement(response.routine_name);
            const result = await response.result(response.hash, timeout);
            const data = {
                output: this.abiCoder.decodeOutput(result.outputs, routine.data["returns"]),
                error: moi_abi_1.ABICoder.decodeException(result.error)
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
 * getLogicDriver
 *
 * Returns a logic driver instance based on the given logic id.
 *
 * @param {string} logicId - The logic id of the logic.
 * @param {JsonRpcProvider} provider - The JSON-RPC provider.
 * @param {Options} options - The custom options for the logic driver. (optional)
 * @returns {Promise<LogicDriver>} A promise that resolves to a LogicDriver instance.
 */
const getLogicDriver = async (logicId, provider, options) => {
    try {
        const manifest = await provider.getLogicManifest(logicId, "JSON", options);
        if (typeof manifest === 'object') {
            return new LogicDriver(logicId, manifest, provider);
        }
        moi_utils_1.ErrorUtils.throwError("Invalid logic manifest", moi_utils_1.ErrorCode.INVALID_ARGUMENT);
    }
    catch (err) {
        throw err;
    }
};
exports.getLogicDriver = getLogicDriver;
