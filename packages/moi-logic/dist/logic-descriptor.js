"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineKind = void 0;
const moi_abi_1 = require("moi-abi");
const state_1 = require("./state");
const logic_id_1 = require("./logic-id");
const element_descriptor_1 = __importDefault(require("./element-descriptor"));
var EngineKind;
(function (EngineKind) {
    EngineKind["PISA"] = "PISA";
    EngineKind["MERU"] = "MERU";
})(EngineKind || (exports.EngineKind = EngineKind = {}));
class LogicDescriptor extends element_descriptor_1.default {
    logicId;
    manifest;
    encodedManifest;
    engine;
    sealed;
    assetLogic;
    constructor(logicId, manifest) {
        super(manifest.elements);
        this.logicId = new logic_id_1.LogicId(logicId);
        this.manifest = manifest;
        this.encodedManifest = moi_abi_1.ABICoder.encodeABI(this.manifest);
        this.engine = this.manifest.engine.kind;
        this.sealed = false;
        this.assetLogic = false;
    }
    getLogicId() {
        return this.logicId.hex();
    }
    getEngine() {
        return this.engine;
    }
    getManifest() {
        return this.manifest;
    }
    getEncodedManifest() {
        return this.encodedManifest;
    }
    isSealed() {
        return this.sealed;
    }
    isAssetLogic() {
        return this.assetLogic;
    }
    hasPersistentState() {
        const ptr = this.stateMatrix.get(state_1.ContextStateKind.PersistentState);
        if (ptr !== undefined) {
            return [ptr, true];
        }
        return [0, false];
    }
    hasEphemeralState() {
        const ptr = this.stateMatrix.get(state_1.ContextStateKind.EphemeralState);
        if (ptr !== undefined) {
            return [ptr, true];
        }
        return [0, false];
    }
    allowsInteractions() {
        return this.logicId.isInteractive();
    }
    isStateful() {
        return this.logicId.isStateful();
    }
}
exports.default = LogicDescriptor;
