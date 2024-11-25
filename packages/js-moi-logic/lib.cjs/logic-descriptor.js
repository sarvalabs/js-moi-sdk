"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicDescriptor = exports.EngineKind = void 0;
const js_moi_manifest_1 = require("@zenz-solutions/js-moi-manifest");
const logic_base_1 = require("./logic-base");
const logic_id_1 = require("./logic-id");
var EngineKind;
(function (EngineKind) {
    EngineKind["PISA"] = "PISA";
    EngineKind["MERU"] = "MERU";
})(EngineKind || (exports.EngineKind = EngineKind = {}));
/**
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
        this.encodedManifest = js_moi_manifest_1.ManifestCoder.encodeManifest(this.manifest);
        this.engine = this.manifest.engine.kind;
        this.sealed = false;
        this.assetLogic = false;
    }
    /**
     * Returns the logic id of the logic.
     *
     * @returns {string} The logic id.
     */
    getLogicId() {
        return this.logicId;
    }
    /**
     * Returns the logic execution engine type.
     *
     * @returns {EngineKind} The engine type.
     */
    getEngine() {
        return this.engine;
    }
    /**
     * Returns the logic manifest.
     *
     * @returns {LogicManifest.Manifest} The logic manifest.
     */
    getManifest() {
        return this.manifest;
    }
    /**
     * Returns the POLO encoded logic manifest.
     *
     * @returns {string} The POLO encoded logic manifest.
     */
    getEncodedManifest() {
        return this.encodedManifest;
    }
    /**
     * Checks if the logic is sealed.
     *
     * @returns {boolean} True if the logic is sealed, false otherwise.
     */
    isSealed() {
        return this.sealed;
    }
    /**
     * Checks if the logic represents an asset logic.
     *
     * @returns {boolean} True if the logic is an representation of asset logic, false otherwise.
     */
    isAssetLogic() {
        return this.assetLogic;
    }
    /**
     * Checks if the logic allows interactions.
     *
     * @returns {boolean} True if the logic allows interactions, false otherwise.
     */
    allowsInteractions() {
        return this.logicId.isInteractive();
    }
    /**
     * Checks if the logic is stateful.
     *
     * @returns {boolean} True if the logic is stateful, false otherwise.
     */
    isStateful() {
        return this.logicId.isStateful();
    }
    /**
     * Checks if the logic has persistent state.
     * @returns A tuple containing the pointer to the persistent state and a flag indicating if it exists.
     *
     @example
     * const [ptr, exists] = logic.hasPersistentState();
     */
    hasPersistentState() {
        const ptr = this.stateMatrix.get(js_moi_manifest_1.ContextStateKind.PersistentState);
        if (ptr !== undefined) {
            return [ptr, true];
        }
        return [0, false];
    }
    /**
     * Checks if the logic has ephemeral state.
     * @returns A tuple containing the pointer to the ephemeral state and a flag indicating if it exists.
     *
     * @example
     * const [ptr, exists] = logic.hasEphemeralState();
     */
    hasEphemeralState() {
        const ptr = this.stateMatrix.get(js_moi_manifest_1.ContextStateKind.EphemeralState);
        if (ptr !== undefined) {
            return [ptr, true];
        }
        return [0, false];
    }
}
exports.LogicDescriptor = LogicDescriptor;
//# sourceMappingURL=logic-descriptor.js.map