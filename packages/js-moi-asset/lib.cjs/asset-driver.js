"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetDriver = exports.AssetDriver = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
const asset_descriptor_1 = require("./asset-descriptor");
const js_moi_logic_1 = require("js-moi-logic");
const state_1 = require("./state");
/**
 * Represents a asset driver that serves as an interface for interacting with logics.
 */
class AssetDriver extends asset_descriptor_1.AssetDescriptor {
    routines = {};
    persistentState;
    ephemeralState;
    constructor(assetId, manifest, arg) {
        super(assetId, manifest, arg);
        this.createState();
        this.createRoutines();
    }
    /**
     * Creates the persistent and ephemeral states for the asset driver,
     if available in logic manifest.
     */
    createState() {
        const hasPersistance = this.stateMatrix.persistent();
        const hasEphemeral = this.stateMatrix.ephemeral();
        if (hasPersistance) {
            const persistentState = new state_1.PersistentState(this, this.provider);
            (0, js_moi_utils_1.defineReadOnly)(this, "persistentState", persistentState);
        }
        if (hasEphemeral) {
            const ephemeralState = new state_1.EphemeralState(this, this.provider);
            (0, js_moi_utils_1.defineReadOnly)(this, "ephemeralState", ephemeralState);
        }
    }
    /**
     * Creates an interface for executing routines defined in the logic manifest.
     */
    createRoutines() {
        const routines = {};
        this.manifest.elements.forEach((element) => {
            if (element.kind !== "callable") {
                return;
            }
            const routine = element.data;
            if (!["invoke", "enlist"].includes(routine.kind)) {
                return;
            }
            routines[routine.name] = async (...params) => {
                const argsLen = params.at(-1) && params.at(-1) instanceof js_moi_logic_1.RoutineOption
                    ? params.length - 1
                    : params.length;
                if (routine.accepts && argsLen < routine.accepts.length) {
                    js_moi_utils_1.ErrorUtils.throwError("One or more required arguments are missing.", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
                }
                const ixObject = this.createIxObject(routine, ...params);
                if (!this.isMutableRoutine(routine)) {
                    return await ixObject.unwrap();
                }
                return await ixObject.send();
            };
            routines[routine.name].isMutable = () => {
                return this.isMutableRoutine(routine);
            };
            routines[routine.name].accepts = () => {
                return routine.accepts ? routine.accepts : null;
            };
            routines[routine.name].returns = () => {
                return routine.returns ? routine.returns : null;
            };
        });
        (0, js_moi_utils_1.defineReadOnly)(this, "routines", routines);
    }
    /**
     * Checks if a routine is mutable based on its name.
     *
     * @param {string} routineName - The name of the routine.
     * @returns {boolean} True if the routine is mutable, false otherwise.
     */
    isMutableRoutine(routine) {
        return ["dynamic"].includes(routine.mode);
    }
    /**
     * Creates the logic payload from the given interaction object.
     *
     * @param {AssetIxObject} ixObject - The interaction object.
     * @returns {LogicActionPayload} The logic action payload.
     */
    createPayload(ixObject) {
        const payload = {
            asset_id: this.getAssetId().string(),
            callsite: ixObject.routine.name,
        };
        if (ixObject.routine.accepts &&
            Object.keys(ixObject.routine.accepts).length > 0) {
            payload.calldata = this.manifestCoder.encodeArguments(ixObject.routine.name, ...ixObject.arguments);
        }
        return payload;
    }
    /**
     * Processes the logic interaction result and returns the decoded data or
     error, if available.
     *
     * @param {AssetIxResponse} response - The logic interaction response.
     * @param {number} timeout - The custom timeout for processing the result. (optional)
     * @returns {Promise<AssetIxResult | null>} A promise that resolves to the
     logic interaction result or null.
     */
    async processResult(response, timeout) {
        try {
            const result = await response.result(timeout);
            return {
                output: this.manifestCoder.decodeOutput(response.routine_name, result[0].outputs),
                error: js_moi_manifest_1.ManifestCoder.decodeException(result[0].error)
            };
        }
        catch (err) {
            throw err;
        }
    }
}
exports.AssetDriver = AssetDriver;
/**
 * Returns a asset driver instance based on the given asset id.
 *
 * @param {string} assetId - The asset id of the asset.
 * @param {Signer} signer - The signer instance for the logic driver.
 * @param {Options} options - The custom tesseract options for retrieving
 *
 * @returns {Promise<AssetDriver>} A promise that resolves to a LogicDriver instance.
 */
const getAssetDriver = async (assetId, signer, options) => {
    const manifest = await signer.getProvider().getLogicManifest(assetId, "JSON", options);
    if (typeof manifest !== "object") {
        js_moi_utils_1.ErrorUtils.throwError("Invalid logic manifest", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
    }
    return new AssetDriver(assetId, manifest, signer);
};
exports.getAssetDriver = getAssetDriver;
//# sourceMappingURL=asset-driver.js.map