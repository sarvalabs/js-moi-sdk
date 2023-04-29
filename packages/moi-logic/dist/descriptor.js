"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineKind = void 0;
const moi_abi_1 = require("moi-abi");
const state_1 = require("./state");
const logic_id_1 = __importDefault(require("./logic_id"));
var EngineKind;
(function (EngineKind) {
    EngineKind["PISA"] = "PISA";
    EngineKind["MERU"] = "MERU";
})(EngineKind = exports.EngineKind || (exports.EngineKind = {}));
class LogicDescriptor {
    logicId;
    manifest;
    encodedManifest;
    engine;
    stateMatrix;
    sealed;
    assetLogic;
    elements;
    callSites;
    classDefs;
    constructor(logicId, manifest) {
        this.logicId = new logic_id_1.default(logicId);
        this.manifest = manifest;
        this.encodedManifest = moi_abi_1.ABICoder.encodeABI(this.manifest);
        this.engine = this.manifest.engine.kind;
        this.sealed = false;
        this.assetLogic = false;
        this.stateMatrix = new state_1.ContextStateMatrix(manifest.elements);
        this.initManifestMaps();
    }
    initManifestMaps() {
        this.elements = new Map();
        this.callSites = new Map();
        this.classDefs = new Map();
        this.manifest.elements.forEach(element => {
            this.elements.set(element.ptr, element);
            switch (element.kind) {
                case "class":
                    element.data = element.data;
                    this.classDefs.set(element.data.name, element.ptr);
                    break;
                case "routine":
                    element.data = element.data;
                    const callsite = { ptr: element.ptr, kind: element.data.kind };
                    this.callSites.set(element.data.name, callsite);
                    break;
                default:
                    break;
            }
        });
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
    getStateMatrix() {
        return this.stateMatrix;
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
    getElements() {
        return this.elements;
    }
    getCallsites() {
        return this.callSites;
    }
    getClassDefs() {
        return this.classDefs;
    }
}
exports.default = LogicDescriptor;
