"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogicDriver = exports.LogicDriver = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
const logic_descriptor_1 = require("./logic-descriptor");
const routine_options_1 = require("./routine-options");
const state_1 = require("./state");
/**
 * Represents a logic driver that serves as an interface for interacting with logics.
 */
class LogicDriver extends logic_descriptor_1.LogicDescriptor {
    routines;
    persistentState;
    ephemeralState;
    constructor(logicId, manifest, arg) {
        super(logicId, manifest, arg);
        this.createState();
        this.routines = this.createRoutines();
        Object.defineProperty(this, "routines", { writable: false });
    }
    createOperationPayload(callsite, args) {
        const calldata = this.manifestCoder.encodeArguments(callsite, ...args);
        const { value } = this.getLogicId();
        return {
            type: js_moi_utils_1.OpType.LogicInvoke,
            payload: { callsite, calldata, logic_id: value },
        };
    }
    /**
     * Creates the persistent and ephemeral states for the logic driver,
     if available in logic manifest.
     */
    createState() {
        const hasPersistance = this.stateMatrix.persistent();
        const hasEphemeral = this.stateMatrix.ephemeral();
        if (hasPersistance) {
            const persistentState = new state_1.PersistentState(this, this.signer.getProvider());
            (0, js_moi_utils_1.defineReadOnly)(this, "persistentState", persistentState);
        }
        if (hasEphemeral) {
            const ephemeralState = new state_1.EphemeralState(this, this.signer.getProvider());
            (0, js_moi_utils_1.defineReadOnly)(this, "ephemeralState", ephemeralState);
        }
    }
    newRoutine(data) {
        const metadata = {
            kind: data.kind,
            mode: data.mode,
            accepts: data.accepts,
            returns: data.returns,
            catches: data.catches,
        };
        const callback = async (...params) => {
            const hasOption = params.at(-1) instanceof routine_options_1.RoutineOption;
            const args = hasOption ? params.slice(0, -1) : params;
            const option = hasOption ? params.at(-1) : undefined;
            if (args.length !== metadata.accepts.length) {
                const sign = `${data.name}(${metadata.accepts.map((arg) => arg.label + ": " + arg.type).join(", ")})`;
                js_moi_utils_1.ErrorUtils.throwArgumentError(`Invalid number of arguments for routine: ${sign}`, "args", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
            }
            return await this.triggerCallsite(data.name, args, option);
        };
        return Object.freeze(Object.assign(callback, metadata));
    }
    /**
     * Creates an interface for executing routines defined in the logic manifest.
     */
    createRoutines() {
        const routines = {};
        for (const element of this.getElements().values()) {
            if (element.kind !== js_moi_utils_1.ElementType.Routine) {
                continue;
            }
            (0, js_moi_utils_1.defineReadOnly)(routines, element.data.name, this.newRoutine(element.data));
        }
        return routines;
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
                error: js_moi_manifest_1.ManifestCoder.decodeException(result[0].error),
            };
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
 * @param {Signer} signer - The signer instance for the logic driver.
 * @param {Options} options - The custom tesseract options for retrieving
 *
 * @returns {Promise<LogicDriver>} A promise that resolves to a LogicDriver instance.
 */
const getLogicDriver = async (logicId, signer) => {
    const id = logicId instanceof js_moi_utils_1.LogicId ? logicId : new js_moi_utils_1.LogicId(logicId);
    const { manifest: blob } = await signer.getProvider().getLogic(id, {
        modifier: { include: ["manifest"] },
    });
    const manifest = js_moi_manifest_1.ManifestCoder.decodeManifest(blob, js_moi_manifest_1.ManifestCoderFormat.JSON);
    return new LogicDriver(id, manifest, signer);
};
exports.getLogicDriver = getLogicDriver;
//# sourceMappingURL=logic-driver.js.map