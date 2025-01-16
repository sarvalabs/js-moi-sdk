"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicDescriptor = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
const logic_base_1 = require("./logic-base");
/**
 * Abstract class representing a logic descriptor, which provides information
 about a logic.
 */
class LogicDescriptor extends logic_base_1.LogicBase {
    logicId;
    manifest;
    constructor(logicId, manifest, signer) {
        super(manifest, signer);
        this.logicId = logicId instanceof js_moi_utils_1.LogicId ? logicId : new js_moi_utils_1.LogicId(logicId);
        this.manifest = manifest;
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
        return this.manifest.engine.kind;
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
        return js_moi_manifest_1.ManifestCoder.encodeManifest(this.manifest);
    }
    /**
     * Checks if the logic is sealed.
     *
     * @returns {boolean} True if the logic is sealed, false otherwise.
     */
    isSealed() {
        return false;
    }
    /**
     * Checks if the logic represents an asset logic.
     *
     * @returns {boolean} True if the logic is an representation of asset logic, false otherwise.
     */
    isAssetLogic() {
        return this.logicId.isAssetLogic();
    }
    /**
     * Checks if the logic allows interactions.
     *
     * @returns {boolean} True if the logic allows interactions, false otherwise.
     */
    allowsInteractions() {
        return this.logicId.isIntractable();
    }
    /**
     * Checks if the logic is stateful.
     *
     * @returns {boolean} True if the logic is stateful, false otherwise.
     */
    isStateful() {
        // TODO : Implement this method
        throw new Error("Method not implemented.");
    }
    /**
     * Checks if the logic has persistent state.
     * @returns A tuple containing the pointer to the persistent state and a flag indicating if it exists.
     *
     @example
     * const [ptr, exists] = logic.hasPersistentState();
     */
    hasPersistentState() {
        const ptr = this.stateMatrix.get(js_moi_utils_1.LogicState.Persistent);
        return ptr == null ? [0, false] : [ptr, true];
    }
    /**
     * Checks if the logic has ephemeral state.
     * @returns A tuple containing the pointer to the ephemeral state and a flag indicating if it exists.
     *
     * @example
     * const [ptr, exists] = logic.hasEphemeralState();
     */
    hasEphemeralState() {
        const ptr = this.stateMatrix.get(js_moi_utils_1.LogicState.Ephemeral);
        return ptr == null ? [0, false] : [ptr, true];
    }
}
exports.LogicDescriptor = LogicDescriptor;
//# sourceMappingURL=logic-descriptor.js.map