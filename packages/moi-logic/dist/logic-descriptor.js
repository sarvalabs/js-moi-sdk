"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicDescriptor = exports.EngineKind = void 0;
const moi_abi_1 = require("moi-abi");
const logic_id_1 = require("./logic-id");
const logic_base_1 = require("./logic-base");
const state_1 = require("./state");
var EngineKind;
(function (EngineKind) {
    EngineKind["PISA"] = "PISA";
    EngineKind["MERU"] = "MERU";
})(EngineKind = exports.EngineKind || (exports.EngineKind = {}));
/**
 * LogicDescriptor
 *
 * Abstract class representing a logic descriptor, which provides information
 about a logic.
 */
class LogicDescriptor extends logic_base_1.LogicBase {
    logicId;
    manifest;
    encodedManifest;
    engine;
    sealed;
    assetLogic;
    constructor(logicId, manifest, signer) {
        super(manifest, signer);
        this.logicId = new logic_id_1.LogicId(logicId);
        this.manifest = manifest;
        this.encodedManifest = moi_abi_1.ABICoder.encodeABI(this.manifest);
        this.engine = this.manifest.engine.kind;
        this.sealed = false;
        this.assetLogic = false;
    }
    /**
     * getLogicId
     *
     * Returns the logic id of the logic.
     *
     * @returns {string} The logic id.
     */
    getLogicId() {
        return this.logicId.hex();
    }
    /**
     * getEngine
     *
     * Returns the logic execution engine type.
     *
     * @returns {EngineKind} The engine type.
     */
    getEngine() {
        return this.engine;
    }
    /**
     * getManifest
     *
     * Returns the logic manifest.
     *
     * @returns {LogicManifest.Manifest} The logic manifest.
     */
    getManifest() {
        return this.manifest;
    }
    /**
     * getEncodedManifest
     *
     * Returns the POLO encoded logic manifest.
     *
     * @returns {string} The POLO encoded logic manifest.
     */
    getEncodedManifest() {
        return this.encodedManifest;
    }
    /**
     * isSealed
     *
     * Checks if the logic is sealed.
     *
     * @returns {boolean} True if the logic is sealed, false otherwise.
     */
    isSealed() {
        return this.sealed;
    }
    /**
     * isAssetLogic
     *
     * Checks if the logic represents an asset logic.
     *
     * @returns {boolean} True if the logic is an representation of asset logic, false otherwise.
     */
    isAssetLogic() {
        return this.assetLogic;
    }
    /**
     * allowsInteractions
     *
     * Checks if the logic allows interactions.
     *
     * @returns {boolean} True if the logic allows interactions, false otherwise.
     */
    allowsInteractions() {
        return this.logicId.isInteractive();
    }
    /**
     * isStateful
     *
     * Checks if the logic is stateful.
     *
     * @returns {boolean} True if the logic is stateful, false otherwise.
     */
    isStateful() {
        return this.logicId.isStateful();
    }
    /**
     * hasPersistentState
     *
     * Checks if the logic has persistent state.
     *
     * @returns {[number, boolean]} A tuple containing the pointer to the
     persistent state and a flag indicating if it exists.
     */
    hasPersistentState() {
        const ptr = this.stateMatrix.get(state_1.ContextStateKind.PersistentState);
        if (ptr !== undefined) {
            return [ptr, true];
        }
        return [0, false];
    }
    /**
     * hasEphemeralState
     *
     * Checks if the logic has ephemeral state.
     *
     * @returns {[number, boolean]} A tuple containing the pointer to the
     ephemeral state and a flag indicating if it exists.
     */
    hasEphemeralState() {
        const ptr = this.stateMatrix.get(state_1.ContextStateKind.EphemeralState);
        if (ptr !== undefined) {
            return [ptr, true];
        }
        return [0, false];
    }
}
exports.LogicDescriptor = LogicDescriptor;
